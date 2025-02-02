import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema(
  {
    astrologerId: { type: mongoose.Schema.Types.ObjectId, ref: "Astrologer", required: false },
    authToken: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    expiresAt: { type: Date, required: true }, // e.g., 1-day expiry
  },
  { timestamps: true }
);

// Check if the model already exists before creating it
export default mongoose.models.Session || mongoose.model("Session", sessionSchema);
