import StaffModel from "../models/staff.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import tokenBlacklistModel from "../models/blacklist.model.js";
import env from "../config/env.js";
import crypto from "crypto";

const authCookieOptions = {
    httpOnly: true,
    secure: env.cookie.secure,
    sameSite: env.cookie.sameSite,
    maxAge: env.cookie.maxAge
};

async function generateStaffId(role) {
    const prefixMap = { admin: "ADM", chef: "CHF", waiter: "WTR" };
    let staffId;
    let isUnique = false;

    while (!isUnique) {
        const count = await StaffModel.countDocuments({ role });
        staffId = `${prefixMap[role] || "STF"}-${String(count + 1).padStart(3, "0")}`;

        const existingId = await StaffModel.findOne({ staffId });
        if (!existingId) {
            isUnique = true;
        }
    }

    return staffId;
}

function signStaffToken(user) {
    return jwt.sign(
        {
            Id: user._id,
            staffId: user.staffId,
            name: user.name,
            role: user.role,
            isAdmin: user.isAdmin
        },
        env.jwtSecret,
        { expiresIn: "1d" }
    );
}

async function createUserController(req, res, next) {
    try {
        const { name, email, password, role } = req.body;

        if (!name || !email || !password || !role) {
            return res.status(400).json({ message: "Please provide all required fields" });
        }
        
        const hashedPassword = await bcrypt.hash(password, 10);

        const existingUser = await StaffModel.findOne({ email });

        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        const newStaffId = await generateStaffId(role);

        const newUser = new StaffModel({
            staffId: newStaffId,
            name,
            email,
            passwordHash: hashedPassword,
            role,
            isAdmin: false,
            isActive: false
        });

        await newUser.save();

        res.status(201).json(
            {
                success: true,
                message: "Staff registration request submitted successfully. Awaiting admin approval.",
                user: {
                    staffId: newUser.staffId,
                    name: newUser.name,
                    email: newUser.email,
                    isAdmin: newUser.isAdmin,
                    role: newUser.role,
                    isActive: newUser.isActive 
                },
            }
        );

    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: "Email is already registered" });
        }

        next(error);
    }
}

async function loginUserController(req, res, next) {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Please provide all required fields" });
        }

        const user = await StaffModel.findOne({ email });

        if (!user) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        if (!user.passwordHash) {
            return res.status(401).json({
                message: `This account uses ${user.provider} login. Please sign in with ${user.provider}.`
            });
        }

        const validPassword = await bcrypt.compare(password, user.passwordHash);

        if (!validPassword) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        if (!user.isActive && !user.isAdmin) {
            return res.status(403).json({ message: "Your staff account is pending approval by an admin" });
        }

        const token = signStaffToken(user);

        res.cookie("token", token, authCookieOptions);

        res.status(200).json({
            success: true,
            message: "Logged In Successfully",
            user: { staffId: user.staffId, name: user.name, email: user.email, isAdmin: user.isAdmin, role: user.role }
        });
    }

    catch (error) {
        next(error);
    }
};

async function logoutUserController(req, res, next) {
    try {
        const token = req.cookies.token;

        if (token) {
            const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
            await tokenBlacklistModel.create({ token: tokenHash });
        }

        res.clearCookie("token", {
            httpOnly: true,
            secure: env.cookie.secure,
            sameSite: env.cookie.sameSite
        })

        res.status(200).json({ message: "User LogOut Successfully" });
    }
    catch (error) {
        next(error);
    }
}

async function getMeController(req, res, next) {
    try {
        const user = await StaffModel.findById(req.user.Id);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({
            message: "User information retrieved successfully",
            user: {
                staffId: user.staffId,
                name: user.name,
                email: user.email,
                isAdmin: user.isAdmin,
                role: user.role
            }}
        );
    } catch (error) {
        next(error);
    }
}

async function getAllStaffController(req, res, next) {
    try {
        const staff = await StaffModel.find({}, "-passwordHash").sort({ createdAt: -1 });
        res.status(200).json({ success: true, staff });
    } catch (error) {
        next(error);
    }
}

async function toggleStaffApprovalController(req, res, next) {
    try {
        const { staffId } = req.params;
        const staff = await StaffModel.findOne({ staffId });

        if (!staff) {
            return res.status(404).json({ message: "Staff member not found" });
        }

        staff.isActive = !staff.isActive;
        await staff.save();

        res.status(200).json({
            success: true,
            message: `Staff ${staff.name} status updated to ${staff.isActive ? "Approved" : "Deactivated"}`,
            staff: {
                staffId: staff.staffId,
                name: staff.name,
                email: staff.email,
                role: staff.role,
                isAdmin: staff.isAdmin,
                isActive: staff.isActive
            }
        });
    } catch (error) {
        next(error);
    }
}

async function removeStaffController(req, res, next) {
    try {
        const { staffId } = req.params;
        const staff = await StaffModel.findOneAndDelete({ staffId });

        if (!staff) {
            return res.status(404).json({ message: "Staff member not found" });
        }

        res.status(200).json({
            success: true,
            message: `Staff request for ${staff.name} rejected and deleted successfully`
        });
    } catch (error) {
        next(error);
    }
}

export default {
    createUserController,
    loginUserController,
    logoutUserController,
    getMeController,
    getAllStaffController,
    toggleStaffApprovalController,
    removeStaffController
};
