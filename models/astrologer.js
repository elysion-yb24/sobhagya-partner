import mongoose from "mongoose";

const astrologerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    phone: { type: String, required: true, unique: true },
    isVerified: { type: Boolean, default: false }, // Phone verification status
    isDetailsFilled: { type: Boolean, default: false },
    videoPrice: { type: Number, default: null }, // Keeping it as a Number
    audioPrice: { type: Number, default: null }, // Keeping it as a Number
    isKycDone: { type: Boolean, default: false },
    leadStatus: {
      type: String,
      enum: ["lead", "interviewed", "kyc_pending", "onboarded", "rejected"],
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
        enum: [
          "Hindi",
          "English",
          "Punjabi",
          "Bengali",
          "Marathi",
          "Tamil",
          "Telugu",
          "Bhojpuri",
          "Malayalam",
          "Kannada",
          "Gujarati",
          "Assamese",
          "Others",
        ],
      },
    ],
    specializations: [
      {
        type: String,
        enum: [
          "Vedic",
          "Vastu",
          "Tarrot Reading",
          "Reiki Healing",
          "Palmistry",
          "KP",
          "Prashna",
          "Meditation & Mindfulness",
          "Yoga & Meditation",
          "Psychics",
          "Pranic Healing",
          "Feng Shui",
          "Fortune Telling",
          "Face Reading",
          "Numerology",
          "Others",
        ],
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
