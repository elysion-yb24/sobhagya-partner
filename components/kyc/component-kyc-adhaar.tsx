"use client";
import React, { useState, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";

const Step1: React.FC = () => {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [aadhaar, setAadhaar] = useState<string>("");
  const [aadhaarFile, setAadhaarFile] = useState<File | null>(null);
  const [aadhaarPreview, setAadhaarPreview] = useState<string | null>(null);
  const [error, setError] = useState<{ aadhaar: boolean; file: boolean }>({
    aadhaar: false,
    file: false,
  });
  const [fileUploaded, setFileUploaded] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  const Toast = Swal.mixin({
    toast: true,
    position: "top",
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
  });

  const validateAadhaar = (num: string): boolean => /^\d{12}$/.test(num);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file type (JPG, JPEG, optional PDF)
    const allowedTypes = ["image/jpeg", "image/jpg", "application/pdf"];
    if (!allowedTypes.includes(file.type)) {
      setError((prev) => ({ ...prev, file: true }));
      Toast.fire({
        icon: "error",
        title: "Invalid file type. Please upload JPG, JPEG, or PDF only.",
      });
      return;
    }

    setAadhaarFile(file);
    setError((prev) => ({ ...prev, file: false }));
    setFileUploaded(true);

    // Preview only if it's an image
    if (file.type.startsWith("image/")) {
      setAadhaarPreview(URL.createObjectURL(file));
    } else {
      setAadhaarPreview(null); // No preview for PDFs
    }

    Toast.fire({
      icon: "success",
      title: "Aadhaar file uploaded successfully.",
    });
  };

  const handleEdit = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setAadhaarFile(null);
    setAadhaarPreview(null);
    setFileUploaded(false);
    setError((prev) => ({ ...prev, file: false }));

    Toast.fire({
      icon: "info",
      title: "You can upload a new Aadhaar file.",
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!aadhaar || !validateAadhaar(aadhaar)) {
      setError((prev) => ({ ...prev, aadhaar: true }));
      Toast.fire({
        icon: "error",
        title: "Invalid Aadhaar number. It must be a 12-digit number.",
      });
      return;
    }

    if (!aadhaarFile) {
      setError((prev) => ({ ...prev, file: true }));
      Toast.fire({
        icon: "error",
        title: "Please upload an Aadhaar file.",
      });
      return;
    }

    const formData = new FormData();
    formData.append("aadharNumber", aadhaar);
    formData.append("aadharFile", aadhaarFile);

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
        setAadhaarFile(null);
        setAadhaarPreview(null);
        setFileUploaded(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }

        Toast.fire({
          icon: "success",
          title: "KYC Step 1 completed successfully.",
        });
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

  return (
    <div className="flex flex-col items-center">
      <p className="text-center text-[#9C9AA5] text-sm font-inter -mt-2 mb-2">
        1 / 4
      </p>
      <h1 className="text-xl text-black font-bold font-inter text-center">
        Upload Your Aadhaar Card
      </h1>

      {/* Preview */}
      {aadhaarPreview ? (
        <div className="w-[150px] h-[150px] rounded-full border-4 border-[#FFCD66] overflow-hidden my-4">
          <Image
            src={aadhaarPreview}
            alt="Aadhaar Preview"
            width={150}
            height={150}
            className="object-cover w-full h-full"
            priority
          />
        </div>
      ) : (
        <Image
          className="mx-auto my-[5%]"
          src="/assets/images/Group-2.png"
          alt="Logo"
          width={150}
          height={100}
          priority
        />
      )}

      <div className="flex justify-center items-center w-full max-w-[500px] gap-2 mt-6 mb-4">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center justify-center flex-1 py-2 px-3 bg-white border border-[#FFCD66] text-black font-inter rounded-lg gap-2 cursor-pointer whitespace-nowrap"
        >
          <Image
            src="/assets/images/Upload.png"
            alt="Upload Aadhaar"
            width={20}
            height={20}
            className="h-auto w-auto"
            priority
          />
          Upload Aadhaar
        </button>
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept="image/jpeg,image/jpg,application/pdf"
          onChange={handleFileUpload}
        />

        <button
          type="button"
          onClick={handleEdit}
          className="flex items-center justify-center flex-1 py-2 px-3 bg-white border border-[#FFCD66] text-black font-inter rounded-lg gap-2 cursor-pointer whitespace-nowrap"
        >
          <Image
            src="/assets/images/Edit.png"
            alt="Edit Aadhaar"
            width={20}
            height={20}
            className="h-auto w-auto"
            priority
          />
          Edit Aadhaar
        </button>
      </div>

      <form onSubmit={handleSubmit} className="w-full max-w-md">
        <label htmlFor="aadhaar" className="font-inter">
          Enter Aadhaar Number <span className="text-red-500">*</span>
        </label>
        <input
          id="aadhaar"
          name="aadhaar"
          type="text"
          placeholder="Aadhaar Number"
          className={`form-input placeholder:text-gray-400 border ${
            error.aadhaar ? "border-red-500" : "border-[#FFCD66]"
          }`}
          value={aadhaar}
          onChange={(e) => {
            setError((prev) => ({ ...prev, aadhaar: false }));
            setAadhaar(e.target.value);
          }}
        />
        {error.aadhaar && (
          <p className="text-red-500 text-sm">Aadhaar must be a 12-digit number.</p>
        )}

        <button
          type="submit"
          className="btn mx-auto w-[60%] text-white font-inter bg-[#FFCD66] my-10"
          disabled={loading}
        >
          {loading ? "Submitting..." : "Continue"}
        </button>
      </form>
    </div>
  );
};

export default Step1;
