import mongoose from "mongoose";
import appRunVariables from "@/config/appRunVariables";

const astrologerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    phone: { type: String, required: true, unique: true },
    isVerified: { type: Boolean, default: false }, // Phone verification status
    isDetailsFilled: { type: Boolean, default: false },
    displayAudioPrice:{type: Number, default: 10},
    displayVideoPrice:{type:Number,default:17},
    videoPrice: { type: Number, default: 0 }, // Keeping it as a Number
    audioPrice: { type: Number, default: 0 }, // Keeping it as a Number
    isKycDone: { type: Boolean, default: false },
    leadStatus: {
      type: String,
      enum: ["lead", "interviewed", "kyc_pending","kyc_done", "onboarded", "rejected"],
      default: "lead",
    },
    interviewStatus: {
      type: String,
      enum: ["Pending", "Scheduled", "Clear", "Rejected"],
      default: "Pending",
    },
    interviewDate: { type: Date, default: null }, // New field for interview date
    interviewTime: { type: String, default: null }, // New field for interview time (HH:MM format)

    yearsOfExperience: { type: Number }, // Optional, collected later
    languages: [
      {
        type: String,
        enum: appRunVariables.languages
      },
    ],
    specializations: [
      {
        type: String,
        enum: appRunVariables.talksAbout,
      },
    ],
    profileImage: { type: String }, // Optional
    
    otp: { type: String }, // OTP for phone verification
    otpExpiry: { type: Date }, // Expiration for OTP
  },
  { timestamps: true }
);

// Check if the model already exists before creating a new one
export default mongoose.models.Astrologer || mongoose.model("Astrologer", astrologerSchema);