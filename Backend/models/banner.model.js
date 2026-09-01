import mongoose from "mongoose";

const bannerSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    subtitle: {
        type: String,
        default: ""
    },
    imageUrl: {
        type: String,
        required: true
    },
    altText: {
        type: String,
        default: ""
    },
    isActive: {
        type: Boolean,
        default: true
    },
    displayOrder: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

export const BannerModel = mongoose.model("Banner", bannerSchema);
