"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";

function RegisterComponent2() {
  const [userData, setUserData] = useState({
    name: "",
    status: "Pending",
    vcp: "Not Decided",
    acp: "Not Decided",
  });

  const [kycDetails, setKycDetails] = useState<{
    page1Filled?: boolean;
    page2Filled?: boolean;
    page3Filled?: boolean;
    page4Filled?: boolean;
    kycNotification?: string | null;
  } | null>(null);

  const [dynamicText, setDynamicText] = useState<string>(
    "Loading KYC details..."
  );
  const [showFullText, setShowFullText] = useState(false);

  const router = useRouter();

  // ---------------------------------------------
  // Decide which text to show based on KYC status
  // (when there is NO kycNotification)
  // ---------------------------------------------
  const getKycText = (): string => {
    if (!kycDetails) {
      // If there's absolutely no record (API returned null),
      // show default "Congratulations" message
      return "Congratulations! Your interview is completed — welcome to the Sobhagya Family! Please complete the pending documentation to begin your journey as an esteemed astrologer.";
    }

    const { page1Filled, page2Filled, page3Filled, page4Filled } = kycDetails;

    // CASE 1: All pages filled
    if (page1Filled && page2Filled && page3Filled && page4Filled) {
      return "Great news! You have successfully submitted all your KYC documents. Our team is currently reviewing them, and we’ll update you soon.";
    }
    // CASE 2: Otherwise, fallback to this
    return "Congratulations! Your interview is completed — welcome to the Sobhagya Family! Please complete the pending documentation to begin your journey as an esteemed astrologer.";
  };

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

  // Fetch KYC details
  useEffect(() => {
    const fetchKycDetails = async () => {
      try {
        const response = await fetch("/api/auth/register/fetchKyc", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        });

        const result = await response.json();
        // If success == false, do nothing; default text remains
        if (result.success) {
          // result.kycDetails could be null or an object
          setKycDetails(result.kycDetails);
        }
      } catch (error) {
        console.error("Error fetching KYC details:", error);
      }
    };

    fetchKycDetails();
  }, []);

  // Whenever kycDetails changes, update the dynamicText
  // and show a SweetAlert2 toast if we have a kycNotification
  useEffect(() => {
    if (kycDetails?.kycNotification) {
      Swal.fire({
        toast: true,
        position: "top",
        icon: "info",
        title: kycDetails.kycNotification,
        showConfirmButton: false,
        timer: 6000,
        timerProgressBar: true,
      });
      // const Toast = Swal.mixin({
      //     toast: true,
      //     position: "top",
      //     showConfirmButton: false,
      //     timer: 3000,
      //     timerProgressBar: true,
      //   });
      // Override main text to the "Congratulations..." message
      setDynamicText(
        "Congratulations! Your interview is completed — welcome to the Sobhagya Family! Please complete the pending documentation to begin your journey as an esteemed astrologer."
      );
    } else {
      // No notification => proceed with the standard logic
      setDynamicText(getKycText());
    }
  }, [kycDetails]);

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

        {/* Status Box */}
        <div className="bg-[#FFF9E6] font-inter font-bold w-full md:w-[70%] h-auto min-h-[150px] border border-gray-300 rounded-lg pt-6 pl-8 pr-8 mt-1 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="font-extrabold text-base md:text-xl text-[#252525]">
              Interview Status :
            </span>
            <span className="font-extrabold text-base md:text-xl text-[#252525] mr-10">
              {userData.status}
            </span>
          </div>
          <div className="flex items-center justify-between mb-3">
            <span className="font-extrabold text-base md:text-xl text-[#252525]">
              Video Call Price :
            </span>
            <span className="font-bold text-base md:text-xl text-[#252525] mr-10 ">
              {userData.vcp}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-extrabold text-base md:text-xl text-[#252525]">
              Audio Call Price :
            </span>
            <span className="font-extrabold text-base md:text-xl text-[#252525] mr-10">
              {userData.acp}
            </span>
          </div>
        </div>

        {/* Information Text */}
        <div className="font-inter w-full md:w-[70%] my-4 text-sm md:text-base text-left">
          <p>
            {/* Show full text on desktop */}
            <span className="hidden md:inline">{dynamicText}</span>

            {/* Show truncated text on mobile with Read More option */}
            <span className="md:hidden">
              {showFullText ? dynamicText : `${dynamicText.substring(0, 80)}... `}
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
        <div className="flex justify-center md:justify-start w-full md:-mx-20">
          <button
            type="button"
            onClick={handleDoKyc}
            className="btn mx-auto text-white font-inter font-bold bg-[#fec758] my-2 px-20"
          >
            DO KYC
          </button>
        </div>
      </div>

      {/* Right Section (hidden on mobile) */}
      <div className="hidden md:block w-full max-w-[50%] ml-6 mx-[5%]">
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

export default RegisterComponent2;
