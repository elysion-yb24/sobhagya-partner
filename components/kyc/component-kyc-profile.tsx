"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import Webcam from "react-webcam";

export default function ProfileUpload() {
  const router = useRouter();
  const webcamRef = useRef<Webcam | null>(null);

  const [displayName, setDisplayName] = useState("");
  const [displayPic, setDisplayPic] = useState<File | null>(null);
  const [displayPreview, setDisplayPreview] = useState<string | null>(null);

  const [cameraActive, setCameraActive] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [loading, setLoading] = useState(false);

  // SweetAlert
  const Toast = Swal.mixin({
    toast: true,
    position: "top",
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
  });

  // 1) Fetch existing profile details from the server
  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch("/api/kyc/fetch-profile-details");
        if (!res.ok) {
          // Possibly 401 or 404
          setIsPageLoading(false);
          return;
        }
        const data = await res.json();
        if (data?.displayName) setDisplayName(data.displayName);
        if (data?.profilePicUrl) setDisplayPreview(data.profilePicUrl);
      } catch (error) {
        console.error("Error fetching profile details:", error);
      } finally {
        setIsPageLoading(false);
      }
    }
    fetchProfile();
  }, []);

  // 2) Handle Back Button → page2
  useEffect(() => {
    const handleBack = () => {
      router.replace("/auth/kyc/page2");
    };
    window.addEventListener("popstate", handleBack);
    return () => window.removeEventListener("popstate", handleBack);
  }, [router]);

  // 3) Camera Controls
  const handleOpenCamera = () => {
    // Clear old preview if user wants a new capture
    setDisplayPreview(null);
    setDisplayPic(null);
    setCameraActive(true);
    Toast.fire({ icon: "success", title: "Camera opened successfully." });
  };

  const handleCapturePhoto = () => {
    if (!webcamRef.current) return;

    const imageSrc = webcamRef.current.getScreenshot();
    if (!imageSrc) return;

    setDisplayPreview(imageSrc);
    setCameraActive(false);

    // Convert base64 to File
    fetch(imageSrc)
      .then((res) => res.blob())
      .then((blob) => {
        const file = new File([blob], "profile-picture.jpg", { type: "image/jpeg" });
        setDisplayPic(file);
        Toast.fire({ icon: "success", title: "Photo captured successfully." });
      })
      .catch((err) => {
        console.error("Error capturing photo:", err);
        Toast.fire({ icon: "error", title: "Failed to capture photo." });
      });
  };

  

  // 4) Submit Handler
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validate name
    if (!displayName.trim()) {
      Toast.fire({ icon: "error", title: "Display name cannot be empty." });
      return;
    }

    // If user has no new file & no existing preview → must upload
    if (!displayPic && !displayPreview) {
      Toast.fire({ icon: "error", title: "Please capture or upload a profile picture." });
      return;
    }

    // Build FormData
    const formData = new FormData();
    formData.append("displayName", displayName.trim());
    // Only append if user captured a new pic
    if (displayPic) {
      formData.append("profilePic", displayPic);
    }

    setLoading(true);
    try {
      const response = await fetch("/api/kyc/profile", {
        method: "POST",
        body: formData,
      });
      const result = await response.json();

      if (response.ok) {
        Toast.fire({ icon: "success", title: "Profile uploaded successfully." });
        router.push("/auth/kyc/page4");
      } else {
        Toast.fire({
          icon: "error",
          title: result.message || "Failed to upload profile.",
        });
      }
    } catch (err) {
      console.error("Error uploading profile:", err);
      Toast.fire({ icon: "error", title: "An error occurred while uploading the profile." });
    } finally {
      setLoading(false);
    }
  };

  if (isPageLoading) {
    return <div></div>;
  }

  return (
    <div className="flex flex-col items-center mb-8">
      <p className="text-center text-[#9C9AA5] text-sm font-inter mb-2">3 / 4</p>
      <h1 className="text-2xl text-black font-bold font-inter text-center mb-4">
        Upload Your Profile Picture
      </h1>

      <div className="flex gap-4 mb-4 w-[320px] justify-center">
        {/* Existing or captured preview */}
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

        {/* Camera if active */}
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

      {/* Upload / Capture Photo Button with Icon */}
<button
  type="button"
  onClick={cameraActive ? handleCapturePhoto : handleOpenCamera}
  className="w-[320px] py-2 px-3 bg-white border border-[#fec758] text-black font-inter rounded-lg 
             flex items-center justify-center gap-2"
>
  <Image
    src="/assets/images/Upload.png"
    alt="Upload Icon"
    width={20}
    height={20}
  />
  <span>
    {cameraActive ? "Click Photo" : displayPreview ? "Re-upload Photo" : "Upload Photo"}
  </span>
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
}
