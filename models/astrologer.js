import mongoose from "mongoose";

const astrologerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    phone: { type: String, required: true, unique: true },
    isVerified: { type: Boolean, default: false }, // Phone verification status
    isDetailsFilled:{ type: Boolean, default: false },
    videoPrice:{ type: String, required: false, default:"Not Decided" },
    audioPrice:{ type: String, required: false, default:"Not Decided" },
    isKycDone:{ type: Boolean, default: false },
    leadStatus: {
      type: String,
      enum: ["lead", "interviewed", "kyc_pending", "onboarded", "rejected"],
      default: "lead",
    },
    interviewStatus: {
      type: String,
      enum: ["Pending", "Interviewed", "Onboarded", "Rejected"],
      default: "Pending",
    },
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
    audioPrice: { type: Number }, // Optional
    videoPrice: { type: Number }, // Optional

    otp: { type: String }, // OTP for phone verification
    otpExpiry: { type: Date }, // Expiration for OTP
  },
  { timestamps: true }
);

// Check if the model already exists before creating a new one
export default mongoose.models.Astrologer || mongoose.model("Astrologer", astrologerSchema);
