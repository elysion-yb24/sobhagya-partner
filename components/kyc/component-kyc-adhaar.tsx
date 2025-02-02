"use client";
import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";

const Step1 = () => {
  const router = useRouter();
  const [aadhaar, setAadhaar] = useState("");
  const [aadhaarFile, setAadhaarFile] = useState(null);
  const [aadhaarPreview, setAadhaarPreview] = useState(null); // Aadhaar preview state
  const [error, setError] = useState({ aadhaar: false, file: false });
  const [fileUploaded, setFileUploaded] = useState(false);
  const [loading, setLoading] = useState(false);

  const Toast = Swal.mixin({
    toast: true,
    position: "top",
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
  });

  const validateAadhaar = (aadhaar) => {
    return /^\d{12}$/.test(aadhaar);
  };

  const handleSubmit = async (e) => {
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
        setAadhaar("");
        setAadhaarFile(null);
        setAadhaarPreview(null); // Reset preview
        setFileUploaded(false);
        document.getElementById("aadhaar-upload").value = "";

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
    } catch (error) {
      console.error("Error submitting KYC Step 1:", error);
      Toast.fire({
        icon: "error",
        title: "An error occurred while submitting Aadhaar details.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError((prev) => ({ ...prev, file: true }));
      Toast.fire({
        icon: "error",
        title: "Only image files are allowed for Aadhaar upload.",
      });
      return;
    }

    setAadhaarFile(file);
    setAadhaarPreview(URL.createObjectURL(file)); // Set preview URL
    setError((prev) => ({ ...prev, file: false }));
    setFileUploaded(true);
    Toast.fire({
      icon: "success",
      title: "Aadhaar file uploaded successfully.",
    });

    console.log("File Uploaded:", file.name);
  };

  const handleEdit = () => {
    setAadhaarFile(null);
    setAadhaarPreview(null); // Clear preview
    setFileUploaded(false);
    setError((prev) => ({ ...prev, file: false }));

    // Reset file input explicitly
    const fileInput = document.getElementById("aadhaar-upload");
    if (fileInput) {
      fileInput.value = "";
    }

    Toast.fire({
      icon: "info",
      title: "You can upload a new Aadhaar file.",
    });
    console.log("Edit Aadhaar clicked. File cleared.");
  };

  return (
    <div className="flex flex-col items-center">
      <p className="text-center text-[#9C9AA5] text-sm font-inter -mt-2 mb-2">1 / 4</p>
      <h1 className="text-xl text-black font-bold font-inter text-center">
        Upload Your Aadhaar Card
      </h1>
      
      {/* Aadhaar Preview */}
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
  {/* Upload Aadhaar Button */}
  <button
    type="button"
    onClick={() => document.getElementById("aadhaar-upload").click()}
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
    id="aadhaar-upload"
    type="file"
    className="hidden"
    accept="image/*"
    onChange={handleFileUpload}
  />

  {/* Edit Aadhaar Button */}
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
          Enter Aadhar Number <span className="text-red-500">*</span>
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
