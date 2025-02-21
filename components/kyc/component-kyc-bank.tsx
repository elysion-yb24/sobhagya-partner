"use client";
import React, { useState, useEffect } from "react";
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
  const [chequePreview, setChequePreview] = useState<string | null>(null);
  const [fileUploaded, setFileUploaded] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [isPageLoading, setIsPageLoading] = useState<boolean>(true);

  const [error, setError] = useState<Record<string, boolean>>({
    accountNumber: false,
    accountHolderName: false,
    ifscCode: false,
    branchName: false,
    upiId: false,
    cheque: false,
  });

  // SweetAlert Instance
  const Toast = Swal.mixin({
    toast: true,
    position: "top",
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
  });

  // === 1️⃣ Fetch Existing Bank Details on Page Load ===
  useEffect(() => {
    const fetchBankDetails = async () => {
      try {
        const res = await fetch("/api/kyc/fetch-bank-details");

        if (!res.ok) {
          setIsPageLoading(false);
          return;
        }

        const data = await res.json();

        // Prefill form fields if data exists
        if (data.bankAccountNumber) setAccountNumber(data.bankAccountNumber);
        if (data.accountHolderName) setAccountHolderName(data.accountHolderName);
        if (data.ifscCode) setIfscCode(data.ifscCode);
        if (data.branchName) setBranchName(data.branchName);
        if (data.upiId) setUpiId(data.upiId);

        // If there's a previously uploaded cancelled cheque, store the URL (not previewed, but used if the user doesn't re-upload)
        if (data.cancelledCheque) {
          setChequePreview(data.cancelledCheque);
        }
      } catch (error) {
        console.error("Error fetching bank details:", error);
      } finally {
        setIsPageLoading(false);
      }
    };

    fetchBankDetails();
  }, []);

  useEffect(() => {
        const handleBack = () => {
          router.replace("/auth/kyc/page3");
        };
    
        window.addEventListener("popstate", handleBack);
        return () => {
          window.removeEventListener("popstate", handleBack);
        };
      }, [router]);

  // === 2️⃣ Handle File Upload ===
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Only allow images or PDFs
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

  // === 3️⃣ Submit Handler ===
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
      return;
    }

    // If no new file and no existing file in DB, show error
    if (!cancelledCheque && !chequePreview) {
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

    // Only append the new file if user actually re-uploaded one
    if (cancelledCheque) {
      formData.append("cancelledCheque", cancelledCheque);
    }

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

  if (isPageLoading) return <div></div>;

  return (
    <div className="flex flex-col items-center px-4">
      <p className="text-center text-[#9C9AA5] text-sm font-inter -mt-2 mb-3">
        4 / 4
      </p>
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
          className={`form-input border ${
            error.accountNumber ? "border-red-500" : "border-[#fec758]"
          }`}
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
          className={`form-input border ${
            error.accountHolderName ? "border-red-500" : "border-[#fec758]"
          }`}
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
          className={`form-input border ${
            error.ifscCode ? "border-red-500" : "border-[#fec758]"
          }`}
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
          className={`form-input border ${
            error.branchName ? "border-red-500" : "border-[#fec758]"
          }`}
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
          className={`form-input border ${
            error.upiId ? "border-red-500" : "border-[#fec758]"
          }`}
          value={upiId}
          onChange={(e) => setUpiId(e.target.value)}
        />

        {/* Upload Button */}
        <label className="btn w-full text-white font-inter bg-[#fec758] my-6 cursor-pointer">
          Upload Cancelled Cheque / Passbook
          <input
            type="file"
            className="hidden"
            accept="image/*, application/pdf"
            onChange={handleFileUpload}
          />
        </label>

        {/* Submit Button */}
        <button
          type="submit"
          className="btn w-full text-white font-inter font-bold bg-[#fec758]"
          disabled={loading}
        >
          {loading ? "Submitting..." : "Continue"}
        </button>
      </form>
    </div>
  );
};

export default Step4;
