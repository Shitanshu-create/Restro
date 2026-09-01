import express from "express";
import authMiddleware from "../middlewares/auth.middleware.js";
import {
    getActiveBannersController,
    getAllBannersController,
    createBannerController,
    toggleBannerController,
    deleteBannerController
} from "../controllers/banner.controller.js";

const bannerRouter = express.Router();

// Public route for customer view
bannerRouter.get("/public", getActiveBannersController);

// Admin routes
bannerRouter.get("/admin/all", authMiddleware.verifyAdmin, getAllBannersController);
bannerRouter.post("/admin/create", authMiddleware.verifyAdmin, createBannerController);
bannerRouter.patch("/admin/toggle/:id", authMiddleware.verifyAdmin, toggleBannerController);
bannerRouter.delete("/admin/delete/:id", authMiddleware.verifyAdmin, deleteBannerController);

export default bannerRouter;
