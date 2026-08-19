import mongoose from "mongoose";

const bannerSchema = new mongoose.Schema({
    title: {
        type: String,
        default: ""
    },
    subtitle: {
        type: String,
        default: ""
    },
    image: {
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
    order: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

export const BannerModel = mongoose.model("Banner", bannerSchema);
