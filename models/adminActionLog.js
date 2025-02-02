const mongoose = require("mongoose");

const adminActionLogSchema = new mongoose.Schema(
  {
    astrologerId: { type: mongoose.Schema.Types.ObjectId, ref: "Astrologer", required: true },
    action: { type: String, required: true }, // e.g., "validated", "rejected", "requested more info"
    performedBy: { type: String, required: true }, // Admin's ID or name
    comments: { type: String }, // Optional remarks for the action
  },
  { timestamps: true }
);

module.exports = mongoose.model("AdminActionLog", adminActionLogSchema);
