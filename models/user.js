import mongoose from "mongoose";
import appRunVariables from "../config/appRunVariables";

// Base Schema
const baseSchema = new mongoose.Schema({
    phone: { type: String, required: true, unique: true },
    numericId: { type: Number, unique: true },
    age: { type: Number, default: null },
    name: { type: String, default: "" },
    avatar: { type: String, default: "user/b_img_1.png" },
    sample: { type: String, default: "" },
    language: { type: [String], required: true, enum:appRunVariables.languages, default: "hindi" },
    role: { type: String, enum: ['user', 'friend', 'astrologer', 'normal', 'dropped'], required: true, default: "user", index: true },
    talksAbout: { type: [String], required: true, enum:appRunVariables.talksAbout,default: "all" },
    about: { type: String, default: "" },
    status: { type: String, enum: ['online', 'ogbusy', 'offline'], required: true, default: "offline" },
    callType: { type: String, enum: ['call', 'video', 'live', 'video-group', ""], default: "" },
    reportCount: { type: Number, default: 0 },
    upi: { type: String, default: "" },
    rating: {
        avg: { type: Number, default: 5 },
        count: { type: Number, default: 1 },
        max: { type: Number, default: 4 },
        min: { type: Number, default: 3 }
    },
    priority: { type: Number, default: 0 },
    calls: { type: Number, default: 0 },
    callMinutes: { type: Number, default: 5 },
    isRecommended: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
    isBlocked:{type:Boolean, default : false},
    blockedReason:{type:String,default:''},
    isVideoCallAllowed: { type: Boolean, default: false },
    isVideoCallAllowedAdmin:{type:Boolean,default:false},
    rpm: { type: Number, default: 6 },
    offerRpm: { type: Number, default: 4 },
    videoRpm: { type: Number, default: 29 },
    payoutAudioRpm: { type: Number, default: 2 },
    payoutVideoRpm: { type: Number, default: 9 },
    isLive: { type: Boolean, default: false },
    isLiveBlocked: { type: Boolean, default: false }
});

// Add relevant indexes
baseSchema.index({ status: 1 });
baseSchema.index({ "rating.avg": -1 });
baseSchema.index({ role: 1, status: 1 });
baseSchema.index({ role: 1, status: 1, "rating.avg": -1 });

// Base User model
const User = mongoose.models.User || mongoose.model('User', baseSchema);

export default User;