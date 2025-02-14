"use client";
import React, { useState, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import Webcam from "react-webcam";

const ProfileUpload: React.FC = () => {
  const router = useRouter();
  const webcamRef = useRef<Webcam | null>(null);

  const [displayName, setDisplayName] = useState<string>("");
  const [displayPic, setDisplayPic] = useState<File | null>(null);
  const [displayPreview, setDisplayPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [uploadButtonText, setUploadButtonText] = useState<string>("Upload Photo");

  const Toast = Swal.mixin({
    toast: true,
    position: "top",
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
  });

  const handleOpenCamera = () => {
    setCameraActive(true);
    setUploadButtonText("Click Photo");
    Toast.fire({
      icon: "success",
      title: "Camera opened successfully.",
    });
  };

  const handleCapturePhoto = () => {
    if (!webcamRef.current) return;

    const imageSrc = webcamRef.current.getScreenshot();
    if (!imageSrc) return;

    setDisplayPreview(imageSrc);

    // ✅ Convert Base64 to Blob and store as File
    fetch(imageSrc)
      .then((res) => res.blob())
      .then((blob) => {
        const file = new File([blob], "profile-picture.jpg", { type: "image/jpeg" });
        setDisplayPic(file);
        setUploadButtonText("Upload Photo");
        setCameraActive(false);

        Toast.fire({
          icon: "success",
          title: "Photo captured successfully.",
        });
      })
      .catch((error) => {
        console.error("Error capturing photo:", error);
        Toast.fire({
          icon: "error",
          title: "Failed to capture photo.",
        });
      });
  };

  const handleEdit = () => {
    setDisplayPic(null);
    setDisplayPreview(null);
    setCameraActive(false);
    setUploadButtonText("Upload Photo");

    Toast.fire({
      icon: "info",
      title: "Profile picture removed.",
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!displayName.trim()) {
      Toast.fire({
        icon: "error",
        title: "Display name cannot be empty.",
      });
      return;
    }

    if (!displayPic) {
      Toast.fire({
        icon: "error",
        title: "Please upload a valid profile picture.",
      });
      return;
    }

    const formData = new FormData();
    formData.append("displayName", displayName.trim());
    formData.append("displayPic", displayPic);

    setLoading(true);
    try {
      const response = await fetch("/api/kyc/profile", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        setDisplayName("");
        setDisplayPic(null);
        setDisplayPreview(null);

        Toast.fire({
          icon: "success",
          title: "Profile uploaded successfully.",
        });
        router.push("/auth/kyc/page4");
      } else {
        Toast.fire({
          icon: "error",
          title: result.message || "Failed to upload profile.",
        });
      }
    } catch (error) {
      console.error("Error uploading profile:", error);
      Toast.fire({
        icon: "error",
        title: "An error occurred while uploading the profile.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center">
      <p className="text-center text-[#9C9AA5] text-sm font-inter -mt-2 mb-2">3 / 4</p>
      <h1 className="text-xl text-black font-bold font-inter text-center">
        Upload Your Profile Picture
      </h1>

      {/* Camera Live Preview or Image Preview */}
      {cameraActive ? (
        <div className="w-[150px] h-[150px] rounded-full border-4 border-[#FFCD66] overflow-hidden flex justify-center items-center my-4">
          <Webcam
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            className="object-cover w-full h-full rounded-full"
          />
        </div>
      ) : displayPreview ? (
        <div className="w-[150px] h-[150px] rounded-full border-4 border-[#FFCD66] overflow-hidden my-4">
          <Image
            src={displayPreview}
            alt="Profile Preview"
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

      {/* Upload and Edit Profile Buttons */}
      <div className="flex justify-center items-center w-full max-w-[600px] gap-3 mt-6">
        {/* Upload / Click Photo Button */}
        <button
          type="button"
          onClick={cameraActive ? handleCapturePhoto : handleOpenCamera}
          className="flex items-center justify-center w-1/2 py-2 px-4 bg-white border border-[#FFCD66] text-black font-inter rounded-lg gap-2 cursor-pointer whitespace-nowrap"
        >
          <Image
            src="/assets/images/Upload.png"
            alt="Upload Photo"
            width={20}
            height={20}
            className="h-auto w-auto"
            priority
          />
          {uploadButtonText}
        </button>

        {/* Edit Profile Button */}
        <button
          type="button"
          onClick={handleEdit}
          className="flex items-center justify-center w-1/2 py-2 px-4 bg-white border border-[#FFCD66] text-black font-inter rounded-lg gap-2 cursor-pointer whitespace-nowrap"
        >
          <Image
            src="/assets/images/Edit.png"
            alt="Edit Profile"
            width={20}
            height={20}
            className="h-auto w-auto"
            priority
          />
          Edit Profile
        </button>
      </div>

      <form onSubmit={handleSubmit} className="w-full max-w-md mt-6">
        <label htmlFor="displayName" className="font-inter">
          Enter Display Name <span className="text-red-500">*</span>
        </label>
        <input
          id="displayName"
          name="displayName"
          type="text"
          placeholder="Display Name"
          className="form-input placeholder:text-gray-400 border border-[#FFCD66]"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
        />

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

export default ProfileUpload;
