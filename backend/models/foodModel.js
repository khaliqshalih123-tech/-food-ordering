import mongoose from "mongoose";

const foodSchema = new mongoose.Schema({
    name: {type: String, required: true},
    description: {type: String, required: true},
    price: {type: Number, required: true},
    image: {type: String, required: true},
    category: {type: String, required: true},
    restaurant: {type: String, default: ""},
    cuisine: {type: String, default: ""},
    tags: [{type: String}],
    isVeg: {type: Boolean, default: false},
    isAvailable: {type: Boolean, default: true},
    rating: {type: Number, default: 0, min: 0, max: 5},
}, {timestamps: true})

// Compound index for efficient search across multiple fields
foodSchema.index({ name: "text", description: "text", restaurant: "text", cuisine: "text", category: "text", tags: "text" });

// Indexes for filter queries
foodSchema.index({ category: 1 });
foodSchema.index({ restaurant: 1 });
foodSchema.index({ price: 1 });
foodSchema.index({ rating: -1 });
foodSchema.index({ isVeg: 1 });
foodSchema.index({ isAvailable: 1 });

const foodModel = mongoose.models.food || mongoose.model("food", foodSchema);

export default foodModel;