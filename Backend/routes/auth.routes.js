import express from "express";
import authController from "../controllers/auth.controller.js";
import rateLimit from "express-rate-limit";
import authMiddleware from "../middlewares/auth.middleware.js";



const authRouter = express.Router();



const LoginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,             // 15 minutes
    max: 15,                              // Limit each IP to 15 requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: "Too many attempts. Please try again later." }
});



/**
 * @description Register route
 * @route POST /api/auth/register
 * @access Public
 */
authRouter.post("/register", authController.createUserController);



/**
 * @description Login route 
 * @route POST /api/auth/login
 * @access Public
 */
authRouter.post("/login", LoginLimiter, authController.loginUserController);



/**
 * @description LogOut route
 * @route POST /api/auth/logout
 * @access Private
 */
authRouter.post("/logout", authMiddleware.authUser, authController.logoutUserController);




/**
 * @route GET /api/auth/getMe
 * @desc Give user information
 * @access Private
 */
authRouter.get("/getMe", authMiddleware.authUser, authController.getMeController);



/**
 * @route GET /api/auth/staff
 * @desc Fetch all staff
 * @access Private (Admin)
 */
authRouter.get("/staff", authMiddleware.verifyAdmin, authController.getAllStaffController);



/**
 * @route PATCH /api/auth/staff/:staffId/approve
 * @desc Toggle approval for staff
 * @access Private (Admin)
 */
authRouter.patch("/staff/:staffId/approve", authMiddleware.verifyAdmin, authController.toggleStaffApprovalController);



/**
 * @route DELETE /api/auth/staff/:staffId
 * @desc Remove staff request
 * @access Private (Admin)
 */
authRouter.delete("/staff/:staffId", authMiddleware.verifyAdmin, authController.removeStaffController);



export default authRouter;