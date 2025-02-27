import mongoose from 'mongoose';

const adminSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    phone: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    otp: {
        type: String,
        required: false
    },
    otpExpiry: {
        type: Date,
        required: false
    },
    isVerified: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

export default mongoose.models.Admin || mongoose.model("Admin", adminSchema);
