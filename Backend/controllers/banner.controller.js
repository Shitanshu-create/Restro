import { BannerModel } from "../models/banner.model.js";

const defaultBanners = [
    {
        title: "Indian Dishes",
        subtitle: "Authentic flavors, rich spices",
        imageUrl: "/banners/indian.png",
        altText: "Indian Specialities",
        isActive: true,
        displayOrder: 0
    },
    {
        title: "Chinese Dishes",
        subtitle: "Delicious wok tossed specialties",
        imageUrl: "/banners/chinese.png",
        altText: "Chinese Delights",
        isActive: true,
        displayOrder: 1
    }
];

// Helper to seed initial banners if database collection is empty
const seedBannersIfEmpty = async () => {
    try {
        const count = await BannerModel.countDocuments();
        if (count === 0) {
            await BannerModel.insertMany(defaultBanners);
        }
    } catch (err) {
        console.error("Error seeding default banners:", err);
    }
};

/**
 * Get all active banners (for customer view)
 */
export const getActiveBannersController = async (req, res, next) => {
    try {
        await seedBannersIfEmpty();
        const banners = await BannerModel.find({ isActive: true }).sort({ displayOrder: 1, createdAt: -1 });
        return res.status(200).json({
            success: true,
            data: banners
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get all banners (for admin view)
 */
export const getAllBannersController = async (req, res, next) => {
    try {
        await seedBannersIfEmpty();
        const banners = await BannerModel.find({}).sort({ displayOrder: 1, createdAt: -1 });
        return res.status(200).json({
            success: true,
            data: banners
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Create a new banner (Admin)
 */
export const createBannerController = async (req, res, next) => {
    try {
        const { imageUrl, title, subtitle, altText, isActive, displayOrder } = req.body;

        if (!imageUrl) {
            return res.status(400).json({
                success: false,
                message: "Image URL or upload is required"
            });
        }

        const banner = new BannerModel({
            title: title || `Banner ${Date.now()}`,
            subtitle: subtitle || "",
            imageUrl,
            altText: altText || "Promotional Banner",
            isActive: isActive !== undefined ? isActive : true,
            displayOrder: displayOrder || 0
        });

        await banner.save();

        return res.status(201).json({
            success: true,
            message: "Banner added successfully",
            data: banner
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Toggle banner active status (Admin)
 */
export const toggleBannerController = async (req, res, next) => {
    try {
        const { id } = req.params;
        const banner = await BannerModel.findById(id);

        if (!banner) {
            return res.status(404).json({
                success: false,
                message: "Banner not found"
            });
        }

        banner.isActive = !banner.isActive;
        await banner.save();

        return res.status(200).json({
            success: true,
            message: `Banner ${banner.isActive ? 'enabled' : 'disabled'} successfully`,
            data: banner
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Delete a banner (Admin)
 */
export const deleteBannerController = async (req, res, next) => {
    try {
        const { id } = req.params;
        const banner = await BannerModel.findByIdAndDelete(id);

        if (!banner) {
            return res.status(404).json({
                success: false,
                message: "Banner not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Banner deleted successfully"
        });
    } catch (error) {
        next(error);
    }
};
