"use client";
import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";

const Step2: React.FC = () => {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [panNumber, setPanNumber] = useState<string>("");
  const [panFile, setPanFile] = useState<File | null>(null);
  const [panPreview, setPanPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [isPageLoading, setIsPageLoading] = useState(true);

  const [error, setError] = useState<{ pan: boolean; file: boolean }>({
    pan: false,
    file: false,
  });

  const Toast = Swal.mixin({
    toast: true,
    position: "top",
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
  });

  // ✅ PAN Validation (Format: ABCDE1234F)
  const validatePan = (panNumber: string): boolean =>
    /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(panNumber);

  // 1️⃣ On Page Load, fetch existing PAN details
  useEffect(() => {
    const fetchPanDetails = async () => {
      try {
        const res = await fetch("/api/kyc/fetch-pan-details");
        if (!res.ok) {
          setIsPageLoading(false);
          return;
        }
        const data = await res.json();
        // If user previously uploaded a PAN
        if (data.panNumber) setPanNumber(data.panNumber);
        if (data.panFileUrl) setPanPreview(data.panFileUrl);
      } catch (err) {
        console.error("Error fetching PAN details:", err);
      } finally {
        setIsPageLoading(false);
      }
    };
    fetchPanDetails();
  }, []);

  // 2️⃣ Handle Back Button (to page1)
  useEffect(() => {
    const handleBack = () => {
      router.replace("/auth/kyc/page1");
    };
    window.addEventListener("popstate", handleBack);
    return () => window.removeEventListener("popstate", handleBack);
  }, [router]);

  // 3️⃣ Handle new file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Only images
    if (!file.type.startsWith("image/")) {
      setError((prev) => ({ ...prev, file: true }));
      Toast.fire({ icon: "error", title: "Only image files are allowed for PAN." });
      return;
    }
    // Save file & preview
    setPanFile(file);
    setPanPreview(URL.createObjectURL(file));
    setError((prev) => ({ ...prev, file: false }));

    Toast.fire({ icon: "success", title: "PAN file uploaded successfully." });
  };

  // 4️⃣ Submit Handler
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validate PAN format
    if (!panNumber || !validatePan(panNumber)) {
      setError((prev) => ({ ...prev, pan: true }));
      Toast.fire({
        icon: "error",
        title: "Invalid PAN. Format: ABCDE1234F.",
      });
      return;
    }

    // If user has no new file & no existing preview → must upload
    if (!panFile && !panPreview) {
      setError((prev) => ({ ...prev, file: true }));
      Toast.fire({
        icon: "error",
        title: "Please upload a valid PAN file.",
      });
      return;
    }

    // Build form data
    const formData = new FormData();
    formData.append("panNumber", panNumber);
    // Only append if user re-uploaded a new file
    if (panFile) {
      formData.append("panFile", panFile);
    }

    setLoading(true);
    try {
      const response = await fetch("/api/kyc/pan", {
        method: "POST",
        body: formData,
      });
      const result = await response.json();

      if (response.ok) {
        Toast.fire({ icon: "success", title: "KYC Step 2 completed successfully." });
        router.push("/auth/kyc/page3");
      } else {
        Toast.fire({
          icon: "error",
          title: result.message || "Failed to submit PAN details.",
        });
      }
    } catch (err) {
      console.error("Error submitting PAN details:", err);
      Toast.fire({
        icon: "error",
        title: "An error occurred while submitting PAN details.",
      });
    } finally {
      setLoading(false);
    }
  };

  // 5️⃣ If still fetching existing data
  if (isPageLoading) {
    return <div></div>;
  }

  // 6️⃣ Render
  return (
    <div className="flex flex-col items-center mb-8">
      <p className="text-center text-[#9C9AA5] text-sm font-inter mb-2">
        2 / 4
      </p>
      <h1 className="text-2xl text-black font-bold font-inter text-center mb-4">
        Upload Your PAN Card
      </h1>

      {panPreview && (
        <div className="flex gap-4 mb-4 w-[320px] justify-center">
          <div className="w-[80px] h-[80px] border-2 border-[#fec758] overflow-hidden">
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

     {/* Upload PAN Button with Icon */}
<button
  type="button"
  onClick={() => fileInputRef.current?.click()}
  className="w-[320px] py-2 px-3 bg-white border border-[#fec758] text-black font-inter rounded-lg 
             flex items-center justify-center gap-2"
>
  <Image
    src="/assets/images/Upload.png"
    alt="Upload Icon"
    width={20}
    height={20}
  />
  <span>{panPreview ? "Re-Upload PAN" : "Upload PAN"}</span>
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
              error.pan ? "border-red-500" : "border-[#fec758]"
            }`}
            value={panNumber}
            onChange={(e) => {
              setError((prev) => ({ ...prev, pan: false }));
              setPanNumber(e.target.value);
            }}
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

export default Step2;
