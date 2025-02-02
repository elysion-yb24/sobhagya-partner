"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

function RegisterComponent1() {
  const [userData, setUserData] = useState({
    name: "",
    status: "Pending",
    vcp: "Not Decided",
    acp: "Not Decided",
  });

  const [showFullText, setShowFullText] = useState(false);
  const router = useRouter();

  const fullText =
    "We are in the process of scheduling your telephonic interview as part of the onboarding process. The call will be arranged within the next 24 to 48 hours. After the interview, we will finalize the calling price for your profile.";

  // Prevent the user from navigating back
  useEffect(() => {
    window.history.pushState(null, "", window.location.href);

    const handleBackButton = () => {
      window.history.pushState(null, "", window.location.href);
    };

    window.addEventListener("popstate", handleBackButton);

    return () => {
      window.removeEventListener("popstate", handleBackButton);
    };
  }, []);

  // Fetch astrologer details
  useEffect(() => {
    const fetchAstrologerDetails = async () => {
      try {
        const response = await fetch("/api/auth/register/fetchAstrologer", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        });

        const result = await response.json();
        if (result.success) {
          setUserData({
            name: result.data.name || "Unknown",
            status: result.data.interviewStatus,
            vcp: result.data.videoPrice || "Not Decided",
            acp: result.data.audioPrice || "Not Decided",
          });
        } else {
          console.error("Failed to fetch astrologer details:", result.message);
        }
      } catch (error) {
        console.error("Error fetching astrologer details:", error);
      }
    };

    fetchAstrologerDetails();
  }, []);

  // Handle KYC step navigation
  const handleDoKyc = async () => {
    try {
      const response = await fetch("/api/auth/register/register", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      const result = await response.json();
      if (result.success) {
        router.push(result.nextRoute);
      } else {
        alert(result.message || "Could not determine next KYC page.");
      }
    } catch (error) {
      console.error("Error checking KYC progress:", error);
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
          Onboarding in Progress...
        </p>

        {/* User Greeting */}
        <div className="flex items-center justify-start w-full">
          <p className="text-black text-xl font-inter font-bold">
            Namaste {userData.name.split(" ")[0]}
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

        {/* Status Box - Proper Alignment */}
<div className="bg-[#FFF9E6] font-inter font-bold w-full md:w-[70%] h-auto min-h-[150px] border border-gray-300 rounded-lg pt-6 pl-8 pr-8 mt-1 shadow-sm">
  <div className="flex items-center justify-between mb-3">
    <span className="font-extrabold text-base md:text-xl text-[#252525]">
      Interview Status :
    </span>
    <span className="text-black font-medium text-base md:text-lg">
      {userData.status}
    </span>
  </div>
  <div className="flex items-center justify-between mb-3">
    <span className="font-extrabold text-base md:text-xl text-[#252525]">
      Video Call Price :
    </span>
    <span className="text-black font-medium text-base md:text-lg">
      {userData.vcp}
    </span>
  </div>
  <div className="flex items-center justify-between">
    <span className="font-extrabold text-base md:text-xl text-[#252525]">
      Audio Call Price :
    </span>
    <span className="text-black font-medium text-base md:text-lg">
      {userData.acp}
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

        {/* Button */}
        <div className="flex justify-center md:justify-start w-full">
          <button
            type="button"
            onClick={handleDoKyc}
            className="btn mx-auto text-white font-inter bg-[#FFCD66] my-5 px-20"
          >
            DO KYC
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

export default RegisterComponent1;
