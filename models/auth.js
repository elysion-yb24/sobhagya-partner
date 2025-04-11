import mongoose from "mongoose";

// Auth Schema
const authSchema = new mongoose.Schema({
    phone: { type: String, required: true, unique: true },
    otp: { type: String },
    otpExpiry: { type: Date },
    createdAt: { type: Date, default: Date.now },
    role: { type: String, enum: ['user', 'friend', 'astrologer', 'normal', "dropped"], required: true, default: "user", index: true }

}, { timestamps: true });

// Create the Auth model
const Auth = mongoose.models.Auth || mongoose.model('Auth', authSchema);

export default Auth;
