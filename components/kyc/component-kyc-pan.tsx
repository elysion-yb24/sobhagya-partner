"use client";
import React, { useState, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";

const Step2: React.FC = () => {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [panNumber, setPanNumber] = useState<string>("");
  const [panFile, setPanFile] = useState<File | null>(null);
  const [panPreview, setPanPreview] = useState<string | null>(null);
  const [error, setError] = useState<{ pan: boolean; file: boolean }>({
    pan: false,
    file: false,
  });
  const [loading, setLoading] = useState<boolean>(false);

  // SweetAlert Instance
  const Toast = Swal.mixin({
    toast: true,
    position: "top",
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
  });

  // PAN Validation (Format: ABCDE1234F)
  const validatePan = (panNumber: string): boolean =>
    /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(panNumber);

  // Handle PAN File Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError((prev) => ({ ...prev, file: true }));
      Toast.fire({
        icon: "error",
        title: "Only image files are allowed for PAN upload.",
      });
      return;
    }

    setPanFile(file);
    setPanPreview(URL.createObjectURL(file));
    setError((prev) => ({ ...prev, file: false }));

    Toast.fire({
      icon: "success",
      title: "PAN file uploaded successfully.",
    });
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!panNumber || !validatePan(panNumber)) {
      setError((prev) => ({ ...prev, pan: true }));
      Toast.fire({
        icon: "error",
        title: "Invalid PAN number. Format: ABCDE1234F.",
      });
      return;
    }

    if (!panFile) {
      setError((prev) => ({ ...prev, file: true }));
      Toast.fire({
        icon: "error",
        title: "Please upload a valid PAN file.",
      });
      return;
    }

    const formData = new FormData();
    formData.append("panNumber", panNumber);
    formData.append("panFile", panFile);

    setLoading(true);
    try {
      const response = await fetch("/api/kyc/pan", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        setPanNumber("");
        setPanFile(null);
        setPanPreview(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }

        Toast.fire({
          icon: "success",
          title: "KYC Step 2 completed successfully.",
        });
        router.push("/auth/kyc/page3");
      } else {
        Toast.fire({
          icon: "error",
          title: result.message || "Failed to submit PAN details.",
        });
      }
    } catch (error) {
      console.error("Error submitting KYC Step 2:", error);
      Toast.fire({
        icon: "error",
        title: "An error occurred while submitting PAN details.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center mb-8">
      <p className="text-center text-[#9C9AA5] text-sm font-inter mb-2">
        2 / 4
      </p>
      <h1 className="text-2xl text-black font-bold font-inter text-center mb-4">
        Upload Your PAN Card
      </h1>

      {/* PREVIEW Section - Matches Aadhaar Upload */}
      {panPreview && (
        <div className="flex gap-4 mb-4 w-[320px] justify-start">
          <div className="w-[80px] h-[80px] border-2 border-[#FFCD66] overflow-hidden">
            <Image
              src={panPreview}
              alt="PAN Preview"
              width={80}
              height={80}
              className="object-cover w-full h-full"
              priority
            />
          </div>
        </div>
      )}

      {/* Upload/Re-upload Button */}
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        className="w-[320px] py-2 px-3 bg-white border border-[#FFCD66] text-black font-inter rounded-lg"
      >
        {panPreview ? "Re-Upload PAN" : "Upload PAN"}
      </button>
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept="image/*"
        onChange={handleFileUpload}
      />

      <form onSubmit={handleSubmit} className="flex flex-col items-center mt-6">
        <div className="flex flex-col w-[320px]">
          <label htmlFor="pan" className="font-inter mb-1">
            Enter PAN Number <span className="text-red-500">*</span>
          </label>
          <input
            id="pan"
            name="pan"
            type="text"
            placeholder="PAN Number"
            className={`placeholder:text-gray-400 border rounded-lg px-3 py-2 ${
              error.pan ? "border-red-500" : "border-[#FFCD66]"
            }`}
            value={panNumber}
            onChange={(e) => {
              setError((prev) => ({ ...prev, pan: false }));
              setPanNumber(e.target.value);
            }}
          />
          {error.pan && (
            <p className="text-red-500 text-sm mt-1">
              PAN must follow the format (ABCDE1234F).
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
};

export default Step2;
