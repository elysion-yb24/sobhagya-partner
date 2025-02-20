"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

function EndPage() {
  const router = useRouter();
  const [showFullText, setShowFullText] = useState(false);

  const fullText =
    "We have received your documents and they are currently under review. Our verification team is carefully assessing the details to ensure accuracy and compliance. This process typically takes 24 to 48 hours. We appreciate your patience and will notify you once the verification is complete.";

  // Handle user sign out
  const handleSignOut = async () => {
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (response.ok) {
        router.push("/auth/login");
      } else {
        alert("Failed to sign out. Please try again.");
      }
    } catch (error) {
      console.error("Error signing out:", error);
      alert("Something went wrong. Please try again.");
    }
  };

  return (
    <div
      className="w-full m-auto min-h-screen flex items-center relative overflow-hidden flex-col md:flex-row"
      style={{
        backgroundImage: `url('/assets/images/circle.png')`,
        backgroundPosition: "bottom right",
        backgroundRepeat: "no-repeat",
        backgroundSize: "15%, cover",
      }}
    >
      {/* Left Section */}
      <div className="flex-shrink-0 w-full md:max-w-[50%] flex flex-col items-center md:items-start text-center md:text-left ml-0 md:ml-[15%] -mt-0 md:-mt-20 px-4">
        {/* Logo */}
        <Image
          className="mx-auto md:ml-[10%]"
          src="/assets/images/monk-logo.png"
          alt="Logo"
          width={250}
          height={150}
          priority
        />

        {/* Onboarding Text */}
        <p className="text-black text-2xl md:text-3xl font-inter font-bold my-4">
          KYC Verification in Progress...
        </p>

        {/* User Greeting */}
        <div className="flex items-center justify-start w-full">
          <p className="text-black text-xl font-inter font-bold">
            Namaste
          </p>
          <div className="ml-2">
            <Image
              src="/assets/images/WavingHand.png"
              alt="Waving Hand"
              width={30}
              height={30}
              priority
            />
          </div>
        </div>

        {/* Status Box - KYC Documents Uploaded */}
        <div className="bg-[#FFF9E6] font-inter font-bold w-full md:w-[70%] h-auto border border-gray-300 rounded-lg pb-2 pt-6 pl-8 pr-8 mt-1 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="font-extrabold text-base md:text-xl text-[#252525]">
              KYC Documents :
            </span>
            <span className="text-black font-medium text-base md:text-lg">
              Uploaded
            </span>
          </div>
        </div>

        {/* Information Text - Left aligned for mobile */}
        <div className="font-inter w-full md:w-[70%] my-4 text-sm md:text-base text-left">
          <p>
            {/* Show full text on desktop */}
            <span className="hidden md:inline">{fullText}</span>

            {/* Show truncated text on mobile with Read More option */}
            <span className="md:hidden">
              {showFullText ? fullText : `${fullText.substring(0, 80)}... `}
              <span
                className="text-gray-500 cursor-pointer font-medium"
                onClick={() => setShowFullText(!showFullText)}
              >
                {showFullText ? "Read Less" : "Read More"}
              </span>
            </span>
          </p>
        </div>

        {/* Sign Out Button */}
        <div className="flex justify-center md:justify-start w-full">
          <button
            type="button"
            onClick={handleSignOut}
            className="btn mx-auto text-white font-inter font-bold bg-[#FFCD66] my-5 px-20"
          >
            Sign Out
          </button>
        </div>
      </div>

      {/* Right Section (hidden on mobile) */}
      <div className="hidden md:block w-full max-w-[50%] ml-6 mx-[10%]">
        <Image
          src="/assets/images/You.png"
          alt="Illustration"
          width={500}
          height={400}
          priority
        />
      </div>
    </div>
  );
}

export default EndPage;
