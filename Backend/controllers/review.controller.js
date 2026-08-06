import { ReviewModel } from "../models/review.model.js";

async function submitReviewController(req, res, next) {
    try {
        const { rating, comment, tableNo, customerName } = req.body;
        const customerId = req.customer?.customerId || req.body.customerId;

        if (!customerId) {
            return res.status(401).json({ success: false, message: "Unauthorized customer session" });
        }

        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({ success: false, message: "Rating between 1 and 5 is required" });
        }

        // Check if customer already submitted a review for this session
        const existingReview = await ReviewModel.findOne({ customerId });
        if (existingReview) {
            return res.status(400).json({ success: false, message: "You have already submitted a review for this session" });
        }

        const review = new ReviewModel({
            customerId,
            customerName: customerName || "Anonymous",
            tableNo: tableNo || "N/A",
            rating,
            comment: comment || ""
        });

        await review.save();

        res.status(201).json({
            success: true,
            message: "Review submitted successfully",
            review
        });
    } catch (error) {
        next(error);
    }
}

async function getAllReviewsController(req, res, next) {
    try {
        const { from, to } = req.query;
        let query = {};

        if (from || to) {
            query.createdAt = {};
            if (from) query.createdAt.$gte = new Date(from);
            if (to) query.createdAt.$lte = new Date(to);
        }

        const reviews = await ReviewModel.find(query).sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            message: "Reviews fetched successfully",
            reviews
        });
    } catch (error) {
        next(error);
    }
}

export default { submitReviewController, getAllReviewsController };
