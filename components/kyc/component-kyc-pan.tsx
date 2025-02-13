"use client";
import React, { useState, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";

const Step2 = () => {
  const router = useRouter();
  const fileInputRef = useRef(null);

  const [panNumber, setPanNumber] = useState("");
  const [panFile, setPanFile] = useState(null);
  const [panPreview, setPanPreview] = useState(null);
  const [error, setError] = useState({ pan: false, file: false });
  const [fileUploaded, setFileUploaded] = useState(false);
  const [loading, setLoading] = useState(false);

  const Toast = Swal.mixin({
    toast: true,
    position: "top",
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
  });

  const validatePan = (panNumber) => /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(panNumber);

  const handleFileUpload = (e) => {
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
    setFileUploaded(true);
    Toast.fire({
      icon: "success",
      title: "PAN file uploaded successfully.",
    });
  };

  const handleEdit = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setPanFile(null);
    setPanPreview(null);
    setFileUploaded(false);
    setError((prev) => ({ ...prev, file: false }));

    Toast.fire({
      icon: "info",
      title: "You can upload a new PAN file.",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!panNumber || !validatePan(panNumber)) {
      setError((prev) => ({ ...prev, pan: true }));
      Toast.fire({
        icon: "error",
        title: "Invalid PAN number. Please ensure it follows the format ABCDE1234F.",
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
        setFileUploaded(false);
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
    <div className="flex flex-col items-center">
      <p className="text-center text-[#9C9AA5] text-sm font-inter -mt-2 mb-2">
        2 / 4
      </p>
      <h1 className="text-xl text-black font-bold font-inter text-center">
        Upload Your PAN Card
      </h1>

      {/* PAN Preview */}
      {panPreview ? (
        <div className="w-[150px] h-[150px] rounded-full border-4 border-[#FFCD66] overflow-hidden my-4">
          <Image
            src={panPreview}
            alt="PAN Preview"
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

      <div className="flex justify-center items-center w-full max-w-[600px] gap-3 mt-6 mb-4">
        {/* Upload PAN Card Button */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center justify-center w-1/2 py-2 px-4 bg-white border border-[#FFCD66] text-black font-inter rounded-lg gap-2 cursor-pointer whitespace-nowrap"
        >
          <Image
            src="/assets/images/Upload.png"
            alt="Upload PAN Card"
            width={20}
            height={20}
            className="h-auto w-auto"
            priority
          />
          Upload PAN
        </button>
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept="image/*"
          onChange={handleFileUpload}
        />

        {/* Edit PAN Card Button */}
        <button
          type="button"
          onClick={handleEdit}
          className="flex items-center justify-center w-1/2 py-2 px-4 bg-white border border-[#FFCD66] text-black font-inter rounded-lg gap-2 cursor-pointer whitespace-nowrap"
        >
          <Image
            src="/assets/images/Edit.png"
            alt="Edit PAN Card"
            width={20}
            height={20}
            className="h-auto w-auto"
            priority
          />
          Edit PAN
        </button>
      </div>

      <form onSubmit={handleSubmit} className="w-full max-w-md">
        <label htmlFor="pan" className="font-inter">
          Enter PAN Number <span className="text-red-500">*</span>
        </label>
        <input
          id="pan"
          name="pan"
          type="text"
          placeholder="PAN Number"
          className={`form-input placeholder:text-gray-400 border ${
            error.pan ? "border-red-500" : "border-[#FFCD66]"
          }`}
          value={panNumber}
          onChange={(e) => {
            setError((prev) => ({ ...prev, pan: false }));
            setPanNumber(e.target.value);
          }}
        />
        {error.pan && (
          <p className="text-red-500 text-sm">
            PAN must follow the format (ABCDE1234F).
          </p>
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

export default Step2;
