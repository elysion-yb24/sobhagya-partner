const mongoose = require("mongoose");

const kycSchema = new mongoose.Schema(
  {
    astrologerId: { type: mongoose.Schema.Types.ObjectId, ref: "Astrologer", required: true },
    page1Filled:{ type: Boolean, default: false },
    page2Filled:{ type: Boolean, default: false },
    page3Filled:{ type: Boolean, default: false },
    page4Filled:{ type: Boolean, default: false },
    aadharNumber: { type: String, required: false },
    aadharFrontFile: { type: String, required: false }, // URL for Aadhar card
    aadharBackFile: { type: String, required: false }, // URL for Aadhar card
    panNumber: { type: String, required: false },
    panFile: { type: String, required: false }, // URL for PAN card
    displayName: { type: String, required: false },
    displayPic: { type: String, required: false },// URL for display
    bankDetails: {
      bankAccountNumber: { type: String, required: false },
      accountHolderName: { type: String, required: false },
      ifscCode: { type: String, required: false },
      branchName: { type: String },
      upiId: { type: String },
      cancelledCheque: { type: String }, // URL for cheque/passbook
    },
  },
  { timestamps: true }
);


export default mongoose.models.Kyc || mongoose.model('Kyc', kycSchema);