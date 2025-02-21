"use client";
import React, { useState, useEffect, useRef } from "react";
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
  const [isPageLoading, setIsPageLoading] = useState(true);

  // SweetAlert Instance
  const Toast = Swal.mixin({
    toast: true,
    position: "top",
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
  });

  // === 1️⃣ Fetch Existing Profile Data on Page Load ===
  useEffect(() => {
    const fetchProfileDetails = async () => {
      try {
        const res = await fetch("/api/kyc/fetch-profile-details");

        if (!res.ok) {
          setIsPageLoading(false);
          return;
        }

        const data = await res.json();
        if (data.displayName) setDisplayName(data.displayName);
        if (data.profilePicUrl) setDisplayPreview(data.profilePicUrl);
      } catch (error) {
        console.error("Error fetching profile details:", error);
      } finally {
        setIsPageLoading(false);
      }
    };

    fetchProfileDetails();
  }, []);

  // === 2️⃣ Handle Back Button to Redirect to Page 2 ===
  useEffect(() => {
    const handleBack = () => {
      router.replace("/auth/kyc/page2");
    };

    window.addEventListener("popstate", handleBack);
    return () => {
      window.removeEventListener("popstate", handleBack);
    };
  }, [router]);

  // === 3️⃣ Open Camera ===
  const handleOpenCamera = () => {
    setDisplayPreview(null);
    setDisplayPic(null);
    setCameraActive(true);

    Toast.fire({
      icon: "success",
      title: "Camera opened successfully.",
    });
  };

  // === 4️⃣ Capture Photo ===
  const handleCapturePhoto = () => {
    if (!webcamRef.current) return;

    const imageSrc = webcamRef.current.getScreenshot();
    if (!imageSrc) return;

    setDisplayPreview(imageSrc);
    setCameraActive(false);

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

  // === 5️⃣ Remove Profile Picture ===
  const handleEdit = () => {
    setDisplayPic(null);
    setDisplayPreview(null);
    setCameraActive(false);

    Toast.fire({
      icon: "info",
      title: "Profile picture removed.",
    });
  };

  // === 6️⃣ Submit Handler ===
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!displayName.trim()) {
      Toast.fire({
        icon: "error",
        title: "Display name cannot be empty.",
      });
      return;
    }

    if (!displayPic && !displayPreview) {
      Toast.fire({
        icon: "error",
        title: "Please capture a profile picture.",
      });
      return;
    }

    // Build FormData
    const formData = new FormData();
    formData.append("displayName", displayName.trim());
    if (displayPic) formData.append("profilePic", displayPic);

    setLoading(true);
    try {
      const response = await fetch("/api/kyc/profile", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
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

  if (isPageLoading) return <div></div>;

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
          <div className="w-[80px] h-[80px] border-2 border-[#fec758] overflow-hidden">
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
          <div className="w-[150px] h-[150px] border-2 border-[#fec758] overflow-hidden flex justify-center items-center">
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
        className="w-[320px] py-2 px-3 bg-white border border-[#fec758] text-black font-inter rounded-lg"
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
            className="placeholder:text-gray-400 border rounded-lg px-3 py-2 border-[#fec758]"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
          />
        </div>

        <button
          type="submit"
          className="w-[320px] mt-6 py-2 bg-[#fec758] text-white font-bold font-inter rounded-lg"
          disabled={loading}
        >
          {loading ? "Submitting..." : "Continue"}
        </button>
      </form>
    </div>
  );
};

export default ProfileUpload;
