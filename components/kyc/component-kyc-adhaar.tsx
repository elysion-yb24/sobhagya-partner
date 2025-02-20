"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Swal from "sweetalert2";

export default function Step1() {
  const router = useRouter();

  // Aadhaar Number
  const [aadhaar, setAadhaar] = useState("");
  // File references
  const fileInputRefFront = useRef<HTMLInputElement>(null);
  const fileInputRefBack = useRef<HTMLInputElement>(null);

  // State for front file & preview
  const [aadhaarFrontFile, setAadhaarFrontFile] = useState<File | null>(null);
  const [aadhaarFrontPreview, setAadhaarFrontPreview] = useState<string | null>(null);

  // State for back file & preview
  const [aadhaarBackFile, setAadhaarBackFile] = useState<File | null>(null);
  const [aadhaarBackPreview, setAadhaarBackPreview] = useState<string | null>(null);

  // Error handling
  const [error, setError] = useState({
    aadhaar: false,
    frontFile: false,
    backFile: false,
  });

  // Loading / Submitting state
  const [loading, setLoading] = useState(false);

  // SweetAlert instance
  const Toast = Swal.mixin({
    toast: true,
    position: "top",
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
  });

  // Validate 12-digit Aadhaar
  const validateAadhaar = (num: string): boolean => /^\d{12}$/.test(num);

  // ========= FRONT Upload Handlers =========
  const handleFileUploadFront = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Accept only image/jpeg, image/png
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
    setAadhaarFrontPreview(URL.createObjectURL(file));

    Toast.fire({
      icon: "success",
      title: "Aadhaar front file uploaded successfully.",
    });
  };

  const handleReuploadFront = () => {
    if (fileInputRefFront.current) {
      fileInputRefFront.current.value = "";
    }
    setAadhaarFrontFile(null);
    setAadhaarFrontPreview(null);
    setError((prev) => ({ ...prev, frontFile: false }));

    Toast.fire({
      icon: "info",
      title: "You can now upload a new Aadhaar Front image.",
    });
  };

  // ========= BACK Upload Handlers =========
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
    setAadhaarBackPreview(URL.createObjectURL(file));

    Toast.fire({
      icon: "success",
      title: "Aadhaar back file uploaded successfully.",
    });
  };

  const handleReuploadBack = () => {
    if (fileInputRefBack.current) {
      fileInputRefBack.current.value = "";
    }
    setAadhaarBackFile(null);
    setAadhaarBackPreview(null);
    setError((prev) => ({ ...prev, backFile: false }));

    Toast.fire({
      icon: "info",
      title: "You can now upload a new Aadhaar Back image.",
    });
  };

  // ========= SUBMIT Handler =========
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validate Aadhaar Number
    if (!aadhaar || !validateAadhaar(aadhaar)) {
      setError((prev) => ({ ...prev, aadhaar: true }));
      Toast.fire({
        icon: "error",
        title: "Invalid Aadhaar number. Must be a 12-digit number.",
      });
      return;
    }

    // Validate both front & back
    if (!aadhaarFrontFile) {
      setError((prev) => ({ ...prev, frontFile: true }));
      Toast.fire({
        icon: "error",
        title: "Please upload an Aadhaar front image.",
      });
      return;
    }
    if (!aadhaarBackFile) {
      setError((prev) => ({ ...prev, backFile: true }));
      Toast.fire({
        icon: "error",
        title: "Please upload an Aadhaar back image.",
      });
      return;
    }

    // Build FormData
    const formData = new FormData();
    formData.append("aadharNumber", aadhaar);
    formData.append("aadharFrontFile", aadhaarFrontFile);
    formData.append("aadharBackFile", aadhaarBackFile);

    setLoading(true);
    try {
      const response = await fetch("/api/kyc/aadhar", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();
      if (response.ok) {
        // Reset fields
        setAadhaar("");
        setAadhaarFrontFile(null);
        setAadhaarBackFile(null);
        setAadhaarFrontPreview(null);
        setAadhaarBackPreview(null);

        if (fileInputRefFront.current) fileInputRefFront.current.value = "";
        if (fileInputRefBack.current) fileInputRefBack.current.value = "";

        Toast.fire({
          icon: "success",
          title: "KYC Step 1 completed successfully.",
        });
        // Example: move to next page
        router.push("/auth/kyc/page2");
      } else {
        Toast.fire({
          icon: "error",
          title: result.message || "Failed to submit Aadhaar details.",
        });
      }
    } catch (err) {
      console.error("Error submitting KYC Step 1:", err);
      Toast.fire({
        icon: "error",
        title: "An error occurred while submitting Aadhaar details.",
      });
    } finally {
      setLoading(false);
    }
  };

  // ========= RENDER =========
  return (
    <div className="flex flex-col items-center mb-8">
      <p className="text-center text-[#9C9AA5] text-sm font-inter mb-2">1 / 4</p>
      <h1 className="text-2xl text-black font-bold font-inter text-center mb-4">
        Upload Your Aadhar Card
      </h1>

      {/* PREVIEW Section - Only shows if either front/back is uploaded */}
{(aadhaarFrontPreview || aadhaarBackPreview) && (
  <div className="flex gap-4 mb-4 w-[320px] justify-start">
    {aadhaarFrontPreview && (
      <div className="w-[80px] h-[80px] border-2 border-[#FFCD66] overflow-hidden">
        <Image
          src={aadhaarFrontPreview}
          alt="Aadhar Front Preview"
          width={80}
          height={80}
          className="object-cover w-full h-full"
          priority
        />
      </div>
    )}

    {aadhaarBackPreview && (
      <div className="w-[80px] h-[80px] border-2 border-[#FFCD66] overflow-hidden">
        <Image
          src={aadhaarBackPreview}
          alt="Aadhar Back Preview"
          width={80}
          height={80}
          className="object-cover w-full h-full"
          priority
        />
      </div>
    )}
  </div>
)}

      <div className="flex flex-col items-center space-y-3">
        {/* FRONT Button */}
        <button
          type="button"
          onClick={() => fileInputRefFront.current?.click()}
          className="w-[320px] py-2 px-3 bg-white border border-[#FFCD66] text-black font-inter rounded-lg"
        >
          {aadhaarFrontPreview ? "Re-upload Aadhaar Front" : "Upload Aadhaar Front"}
        </button>
        <input
          ref={fileInputRefFront}
          type="file"
          className="hidden"
          accept="image/jpeg,image/jpg,image/png"
          onChange={handleFileUploadFront}
        />

        {/* BACK Button */}
        <button
          type="button"
          onClick={() => fileInputRefBack.current?.click()}
          className="w-[320px] py-2 px-3 bg-white border border-[#FFCD66] text-black font-inter rounded-lg"
        >
          {aadhaarBackPreview ? "Re-upload Aadhaar Back" : "Upload Aadhaar Back"}
        </button>
        <input
          ref={fileInputRefBack}
          type="file"
          className="hidden"
          accept="image/jpeg,image/jpg,image/png"
          onChange={handleFileUploadBack}
        />
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col items-center mt-6">
        <div className="flex flex-col w-[320px]">
          <label htmlFor="aadhaar" className="font-inter mb-1">
            Enter Aadhar Number <span className="text-red-500">*</span>
          </label>
          <input
            id="aadhaar"
            name="aadhaar"
            type="text"
            placeholder="Aadhaar Number"
            className={`placeholder:text-gray-400 border rounded-lg px-3 py-2 ${
              error.aadhaar ? "border-red-500" : "border-[#FFCD66]"
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
          className="w-[320px] mt-6 py-2 bg-[#FFCD66] text-white font-bold font-inter rounded-lg"
          disabled={loading}
        >
          {loading ? "Submitting..." : "Continue"}
        </button>
      </form>
    </div>
  );
}
