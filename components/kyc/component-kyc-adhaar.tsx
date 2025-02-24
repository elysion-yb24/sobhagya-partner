"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Swal from "sweetalert2";

export default function Step1() {
  const router = useRouter();

  useEffect(() => {
    const handleBack = () => {
      router.replace("/auth/register"); // Redirect when back button is pressed
    };
  
    window.addEventListener("popstate", handleBack);
    return () => {
      window.removeEventListener("popstate", handleBack);
    };
  }, [router]);

  // Aadhaar Number
  const [aadhaar, setAadhaar] = useState("");

  // Refs for file inputs
  const fileInputRefFront = useRef<HTMLInputElement>(null);
  const fileInputRefBack = useRef<HTMLInputElement>(null);

  // Front file + preview
  const [aadhaarFrontFile, setAadhaarFrontFile] = useState<File | null>(null);
  const [aadhaarFrontPreview, setAadhaarFrontPreview] = useState<string | null>(null);

  // Back file + preview
  const [aadhaarBackFile, setAadhaarBackFile] = useState<File | null>(null);
  const [aadhaarBackPreview, setAadhaarBackPreview] = useState<string | null>(null);

  // Error handling
  const [error, setError] = useState({
    aadhaar: false,
    frontFile: false,
    backFile: false,
  });

  // Loading states
  const [isPageLoading, setIsPageLoading] = useState(true);  // For initial fetch
  const [isSubmitting, setIsSubmitting] = useState(false);   // For form submission

  // SweetAlert config
  const Toast = Swal.mixin({
    toast: true,
    position: "top",
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
  });

  // === Utility: Validate Aadhaar ===
  const validateAadhaar = (num: string) => /^\d{12}$/.test(num);

  // === 1. On Page Load, Fetch Existing Aadhaar Data ===
  useEffect(() => {
    const fetchAadhaarDetails = async () => {
      try {
        const res = await fetch("/api/kyc/fetch-aadhar-details");
        // If user not logged in or no data found, you may get a 404 or some error
        if (!res.ok) {
          setIsPageLoading(false);
          return;
        }
        const data = await res.json();

        // If we found Aadhaar data
        if (data.aadhaarNumber) {
          setAadhaar(data.aadhaarNumber);
          if (data.aadhaarFrontUrl) setAadhaarFrontPreview(data.aadhaarFrontUrl);
          if (data.aadhaarBackUrl) setAadhaarBackPreview(data.aadhaarBackUrl);
        }
      } catch (error) {
        console.error("Error fetching Aadhaar details:", error);
      } finally {
        setIsPageLoading(false);
      }
    };

    fetchAadhaarDetails();
  }, []);

  // === 2. Handlers for Uploading Files ===
  // Front
  const handleFileUploadFront = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];
    if (!allowedTypes.includes(file.type)) {
      setError((prev) => ({ ...prev, frontFile: true }));
      Toast.fire({
        icon: "error",
        title: "Invalid file type. Please upload JPG or PNG only.",
      });
      return;
    }

    setAadhaarFrontFile(file);
    setError((prev) => ({ ...prev, frontFile: false }));

    // Create a local preview
    const objectURL = URL.createObjectURL(file);
    setAadhaarFrontPreview(objectURL);

    Toast.fire({
      icon: "success",
      title: "Aadhaar front file uploaded successfully.",
    });
  };

  // Back
  const handleFileUploadBack = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];
    if (!allowedTypes.includes(file.type)) {
      setError((prev) => ({ ...prev, backFile: true }));
      Toast.fire({
        icon: "error",
        title: "Invalid file type. Please upload JPG or PNG only.",
      });
      return;
    }

    setAadhaarBackFile(file);
    setError((prev) => ({ ...prev, backFile: false }));

    const objectURL = URL.createObjectURL(file);
    setAadhaarBackPreview(objectURL);

    Toast.fire({
      icon: "success",
      title: "Aadhaar back file uploaded successfully.",
    });
  };

  // === 3. Form Submission ===
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validate Aadhaar Number
    if (!aadhaar || !validateAadhaar(aadhaar)) {
      setError((prev) => ({ ...prev, aadhaar: true }));
      Toast.fire({
        icon: "error",
        title: "Invalid Aadhaar number. Must be 12 digits.",
      });
      return;
    }

    // Validate files
    if (!aadhaarFrontFile && !aadhaarFrontPreview) {
      setError((prev) => ({ ...prev, frontFile: true }));
      Toast.fire({
        icon: "error",
        title: "Please upload an Aadhaar front image.",
      });
      return;
    }
    if (!aadhaarBackFile && !aadhaarBackPreview) {
      setError((prev) => ({ ...prev, backFile: true }));
      Toast.fire({
        icon: "error",
        title: "Please upload an Aadhaar back image.",
      });
      return;
    }

    // Build FormData for submission
    const formData = new FormData();
    formData.append("aadharNumber", aadhaar);

    // Only append the actual files if we re-uploaded them
    if (aadhaarFrontFile) formData.append("aadharFrontFile", aadhaarFrontFile);
    if (aadhaarBackFile) formData.append("aadharBackFile", aadhaarBackFile);

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/kyc/aadhar", {
        method: "POST",
        body: formData,
      });
      const result = await response.json();

      if (response.ok) {
        Toast.fire({
          icon: "success",
          title: "KYC Aadhaar updated successfully.",
        });
        // Redirect to next step
        router.push("/auth/kyc/page2");
      } else {
        Toast.fire({
          icon: "error",
          title: result.message || "Failed to submit Aadhaar details.",
        });
      }
    } catch (err) {
      console.error("Error submitting Aadhaar details:", err);
      Toast.fire({
        icon: "error",
        title: "An error occurred while submitting Aadhaar details.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // === 4. If Still Fetching Existing Data, Show a Loader ===
  if (isPageLoading) {
    return <div></div>;
  }

  // === 5. Render the Page ===
  return (
    <div className="flex flex-col items-center mb-8">
      <p className="text-center text-[#9C9AA5] text-sm font-inter mb-2">1 / 4</p>
      <h1 className="text-2xl text-black font-bold font-inter text-center mb-4">
        Upload Your Aadhaar Card
      </h1>

      {/* Preview if front/back available */}
      {(aadhaarFrontPreview || aadhaarBackPreview) && (
        <div className="flex gap-4 mb-4 w-[320px] justify-center">
          {aadhaarFrontPreview && (
            <div className="w-[80px] h-[80px] border-2 border-[#fec758] overflow-hidden">
              <Image
                src={aadhaarFrontPreview}
                alt="Aadhaar Front Preview"
                width={80}
                height={80}
                className="object-cover w-full h-full"
                priority
              />
            </div>
          )}
          {aadhaarBackPreview && (
            <div className="w-[80px] h-[80px] border-2 border-[#fec758] overflow-hidden">
              <Image
                src={aadhaarBackPreview}
                alt="Aadhaar Back Preview"
                width={80}
                height={80}
                className="object-cover w-full h-full"
                priority
              />
            </div>
          )}
        </div>
      )}

      {/* Buttons for uploading front/back */}
      <div className="flex flex-col items-center space-y-3">
        <button
          type="button"
          onClick={() => fileInputRefFront.current?.click()}
          className="w-[320px] py-2 px-3 bg-white border border-[#fec758] text-black font-inter rounded-lg 
                     flex items-center justify-center gap-2"
        >
          <Image
            src="/assets/images/upload.png"
            alt="Upload Icon"
            width={20}
            height={20}
          />
          <span>
            {aadhaarFrontPreview ? "Re-upload Aadhaar Front" : "Upload Aadhaar Front"}
          </span>
        </button>
        <input
          ref={fileInputRefFront}
          type="file"
          className="hidden"
          accept="image/jpeg,image/jpg,image/png"
          onChange={handleFileUploadFront}
        />

        <button
          type="button"
          onClick={() => fileInputRefBack.current?.click()}
          className="w-[320px] py-2 px-3 bg-white border border-[#fec758] text-black font-inter rounded-lg 
                     flex items-center justify-center gap-2"
        >
          <Image
            src="/assets/images/upload.png"
            alt="Upload Icon"
            width={20}
            height={20}
          />
          <span>
            {aadhaarBackPreview ? "Re-upload Aadhaar Back" : "Upload Aadhaar Back"}
          </span>
        </button>
        <input
          ref={fileInputRefBack}
          type="file"
          className="hidden"
          accept="image/jpeg,image/jpg,image/png"
          onChange={handleFileUploadBack}
        />
      </div>

      {/* Aadhaar Number & Submit */}
      <form onSubmit={handleSubmit} className="flex flex-col items-center mt-6 w-full">
        <div className="flex flex-col w-[320px]">
          <label htmlFor="aadhaar" className="font-inter mb-1">
            Enter Aadhaar Number <span className="text-red-500">*</span>
          </label>
          <input
            id="aadhaar"
            name="aadhaar"
            type="text"
            placeholder="Aadhaar Number"
            className={`placeholder:text-gray-400 border rounded-lg px-3 py-2 ${
              error.aadhaar ? "border-red-500" : "border-[#fec758]"
            }`}
            value={aadhaar}
            onChange={(e) => {
              setError((prev) => ({ ...prev, aadhaar: false }));
              setAadhaar(e.target.value);
            }}
          />
          {error.aadhaar && (
            <p className="text-red-500 text-sm mt-1">
              Aadhaar must be a 12-digit number.
            </p>
          )}
        </div>

        <button
          type="submit"
          className="w-[320px] mt-6 py-2 bg-[#fec758] text-white font-bold font-inter rounded-lg"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Submitting..." : "Continue"}
        </button>
      </form>
    </div>
  );
}
