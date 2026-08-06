import express from "express";
import reviewController from "../controllers/review.controller.js";
import customerAuth from "../middlewares/customerAuth.middleware.js";
import authMiddleware from "../middlewares/auth.middleware.js";

const reviewRouter = express.Router();

// Customer submits review (requires active customer session)
reviewRouter.post("/submitReview", customerAuth.verifyCustomerSession, reviewController.submitReviewController);

// Admin gets all reviews (requires admin login)
reviewRouter.get("/getAllReviews", authMiddleware.verifyAdmin, reviewController.getAllReviewsController);

export default reviewRouter;
