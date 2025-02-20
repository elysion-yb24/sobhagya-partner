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

  // SweetAlert Instance
  const Toast = Swal.mixin({
    toast: true,
    position: "top",
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
  });

  // Open Camera
  const handleOpenCamera = () => {
    setDisplayPreview(null); // Remove previous image preview
    setDisplayPic(null);
    setCameraActive(true);

    Toast.fire({
      icon: "success",
      title: "Camera opened successfully.",
    });
  };

  // Capture Photo
  const handleCapturePhoto = () => {
    if (!webcamRef.current) return;

    const imageSrc = webcamRef.current.getScreenshot();
    if (!imageSrc) return;

    // Move preview image to the left and close camera
    setDisplayPreview(imageSrc);
    setCameraActive(false);

    // Convert Base64 to Blob and store as File
    fetch(imageSrc)
      .then((res) => res.blob())
      .then((blob) => {
        const file = new File([blob], "profile-picture.jpg", { type: "image/jpeg" });
        setDisplayPic(file);

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

  // Remove Profile Picture
  const handleEdit = () => {
    setDisplayPic(null);
    setDisplayPreview(null);
    setCameraActive(false);

    Toast.fire({
      icon: "info",
      title: "Profile picture removed.",
    });
  };

  // Submit Handler
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
        title: "Please capture a profile picture.",
      });
      return;
    }

    // Build FormData for the request
    const formData = new FormData();
    formData.append("displayName", displayName.trim());
    formData.append("profilePic", displayPic);

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
    <div className="flex flex-col items-center mb-8">
      <p className="text-center text-[#9C9AA5] text-sm font-inter mb-2">3 / 4</p>
      <h1 className="text-2xl text-black font-bold font-inter text-center mb-4">
        Upload Your Profile Picture
      </h1>

      {/* PREVIEW Section - Image on Left, Camera in Center */}
      <div className="flex gap-4 mb-4 w-[320px] justify-start">
        {/* Show captured image preview on the left */}
        {displayPreview && (
          <div className="w-[80px] h-[80px] border-2 border-[#FFCD66] overflow-hidden">
            <Image
              src={displayPreview}
              alt="Profile Preview"
              width={80}
              height={80}
              className="object-cover w-full h-full"
              priority
            />
          </div>
        )}

        {/* Show live camera preview in the center when active */}
        {cameraActive && (
          <div className="w-[150px] h-[150px] border-2 border-[#FFCD66] overflow-hidden flex justify-center items-center">
            <Webcam
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              className="object-cover w-full h-full"
            />
          </div>
        )}
      </div>

      {/* Upload / Capture Photo Button */}
      <button
        type="button"
        onClick={cameraActive ? handleCapturePhoto : handleOpenCamera}
        className="w-[320px] py-2 px-3 bg-white border border-[#FFCD66] text-black font-inter rounded-lg"
      >
        {cameraActive ? "Click Photo" : displayPreview ? "Re-upload Photo" : "Upload Photo"}
      </button>

      <form onSubmit={handleSubmit} className="flex flex-col items-center mt-6">
        <div className="flex flex-col w-[320px]">
          <label htmlFor="displayName" className="font-inter mb-1">
            Enter Display Name <span className="text-red-500">*</span>
          </label>
          <input
            id="displayName"
            name="displayName"
            type="text"
            placeholder="Display Name"
            className="placeholder:text-gray-400 border rounded-lg px-3 py-2 border-[#FFCD66]"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
          />
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

export default ProfileUpload;
