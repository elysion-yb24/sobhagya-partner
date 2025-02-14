"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";

const Step4: React.FC = () => {
  const router = useRouter();
  const [accountNumber, setAccountNumber] = useState<string>("");
  const [accountHolderName, setAccountHolderName] = useState<string>("");
  const [ifscCode, setIfscCode] = useState<string>("");
  const [branchName, setBranchName] = useState<string>("");
  const [upiId, setUpiId] = useState<string>("");
  const [cancelledCheque, setCancelledCheque] = useState<File | null>(null);
  const [fileUploaded, setFileUploaded] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Record<string, boolean>>({
    accountNumber: false,
    accountHolderName: false,
    ifscCode: false,
    branchName: false,
    upiId: false,
    cheque: false,
  });

  // Toast configuration
  const Toast = Swal.mixin({
    toast: true,
    position: "top",
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/") && !file.type.endsWith("pdf")) {
      setError((prev) => ({ ...prev, cheque: true }));
      Toast.fire({
        icon: "error",
        title: "Please upload a valid image or PDF file.",
      });
      return;
    }

    setCancelledCheque(file);
    setError((prev) => ({ ...prev, cheque: false }));
    setFileUploaded(true);
    Toast.fire({
      icon: "success",
      title: "Cancelled cheque uploaded successfully!",
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validate inputs
    const newErrors: Record<string, boolean> = {};
    if (!accountNumber.trim()) newErrors.accountNumber = true;
    if (!accountHolderName.trim()) newErrors.accountHolderName = true;
    if (!ifscCode.trim()) newErrors.ifscCode = true;
    if (!branchName.trim()) newErrors.branchName = true;
    if (!upiId.trim()) newErrors.upiId = true;

    setError(newErrors);

    if (Object.keys(newErrors).length > 0) {
      Toast.fire({
        icon: "error",
        title: "Please fill in all required fields.",
      });
      console.log("Validation errors:", newErrors);
      return;
    }

    // Ensure the file is present
    if (!cancelledCheque) {
      setError((prev) => ({ ...prev, cheque: true }));
      Toast.fire({
        icon: "error",
        title: "Please upload a cancelled cheque.",
      });
      return;
    }

    // Prepare form data
    const formData = new FormData();
    formData.append("bankAccountNumber", accountNumber.trim());
    formData.append("accountHolderName", accountHolderName.trim());
    formData.append("ifscCode", ifscCode.trim());
    formData.append("branchName", branchName.trim());
    formData.append("upiId", upiId.trim());
    formData.append("cancelledCheque", cancelledCheque);

    setLoading(true);

    try {
      const response = await fetch("/api/kyc/bank-details", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        Toast.fire({
          icon: "success",
          title: "Bank details submitted successfully!",
        });
        router.push("/auth/kyc/page5");
      } else {
        Toast.fire({
          icon: "error",
          title: result.message || "Failed to submit bank details.",
        });
      }
    } catch (error) {
      console.error("Error submitting bank details:", error);
      Toast.fire({
        icon: "error",
        title: "An error occurred. Please try again later.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center px-4">
      <p className="text-center text-[#9C9AA5] text-sm font-inter -mt-2 mb-3">4 / 4</p>
      <h1 className="text-2xl text-black font-bold font-inter text-center">
        Enter Your Bank Details
      </h1>
      <form onSubmit={handleSubmit} className="w-full max-w-md mt-6">
        {/* Bank Account Number */}
        <label htmlFor="accountNumber" className="font-inter">
          Bank Account Number <span className="text-red-500">*</span>
        </label>
        <input
          id="accountNumber"
          type="text"
          placeholder="Enter Bank Account Number"
          className={`form-input border ${error.accountNumber ? "border-red-500" : "border-[#FFCD66]"}`}
          value={accountNumber}
          onChange={(e) => setAccountNumber(e.target.value)}
        />

        {/* Account Holder Name */}
        <label htmlFor="accountHolderName" className="font-inter mt-4 block">
          Account Holder Name <span className="text-red-500">*</span>
        </label>
        <input
          id="accountHolderName"
          type="text"
          placeholder="Enter Account Holder Name"
          className={`form-input border ${error.accountHolderName ? "border-red-500" : "border-[#FFCD66]"}`}
          value={accountHolderName}
          onChange={(e) => setAccountHolderName(e.target.value)}
        />

        {/* IFSC Code */}
        <label htmlFor="ifscCode" className="font-inter mt-4 block">
          IFSC Code <span className="text-red-500">*</span>
        </label>
        <input
          id="ifscCode"
          type="text"
          placeholder="Enter IFSC Code"
          className={`form-input border ${error.ifscCode ? "border-red-500" : "border-[#FFCD66]"}`}
          value={ifscCode}
          onChange={(e) => setIfscCode(e.target.value)}
        />

        {/* Branch Name */}
        <label htmlFor="branchName" className="font-inter mt-4 block">
          Branch Name <span className="text-red-500">*</span>
        </label>
        <input
          id="branchName"
          type="text"
          placeholder="Enter Branch Name"
          className={`form-input border ${error.branchName ? "border-red-500" : "border-[#FFCD66]"}`}
          value={branchName}
          onChange={(e) => setBranchName(e.target.value)}
        />

        {/* UPI ID */}
        <label htmlFor="upiId" className="font-inter mt-4 block">
          Your UPI ID <span className="text-red-500">*</span>
        </label>
        <input
          id="upiId"
          type="text"
          placeholder="Enter UPI ID"
          className={`form-input border ${error.upiId ? "border-red-500" : "border-[#FFCD66]"}`}
          value={upiId}
          onChange={(e) => setUpiId(e.target.value)}
        />

        {/* Upload Button */}
        <label className="btn w-full text-white font-inter bg-[#FFCD66] my-6 cursor-pointer">
          Upload Cancel Cheque / Passbook Front
          <input type="file" className="hidden" accept="image/*, application/pdf" onChange={handleFileUpload} />
        </label>

        {/* Submit Button */}
        <button type="submit" className="btn w-full text-white font-inter bg-[#FFCD66]" disabled={loading}>
          {loading ? "Submitting..." : "Continue"}
        </button>
      </form>
    </div>
  );
};

export default Step4;
