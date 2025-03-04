"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

function RegisterComponent4() {
  const [userData, setUserData] = useState({
    name: "",
    interviewDate: "Not Scheduled",
    interviewTime: "Not Scheduled",
  });

  const router = useRouter();

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
        await console.log("User Details",result);
        if (result.success) {
          setUserData({
            name: result.data.name || "Unknown",
            interviewDate: result.data.interviewDate
              ? new Date(result.data.interviewDate).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })
              : "Not Scheduled",
            interviewTime: result.data.interviewTime || "Not Scheduled",
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

  // Handle Sign Out
  const handleSignOut = async () => {
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      const result = await response.json();
      if (result.success) {
        window.location.href = "/";
      } else {
        alert("Sign-out failed. Please try again.");
      }
    } catch (error) {
      console.error("Error signing out:", error);
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

        {/* Updated Status Box */}
        <div className="bg-[#FFF9E6] font-inter font-bold w-full md:w-[70%] h-auto min-h-[150px] border border-gray-300 rounded-lg pt-6 pl-8 pr-8 mt-3 shadow-sm">
          <p className="text-[#252525] text-xl md:text-2xl font-bold mb-4 text-left ">
            Interview Scheduled
          </p>

          {/* Date and Time - Vertical on Mobile, Horizontal on Desktop */}
          <div className="flex flex-col md:flex-row items-start md:items-center md:justify-between text-lg md:text-xl text-black font-medium">
            <div className="w-full md:w-auto text-left">
              <strong className="text-[#252525]">Date:</strong> {userData.interviewDate}
            </div>
            <div className="w-full md:w-auto text-left md:text-right mt-2 md:mt-0">
              <strong className="text-[#252525]">Time:</strong> {userData.interviewTime}
            </div>
          </div>
        </div>

        {/* Information Text */}
        <div className="font-inter w-full md:w-[70%] my-4 text-sm md:text-base text-left">
          <p>Your interview callback has been scheduled. Please ensure you are available at this time.</p>
        </div>

        {/* Button */}
        <div className="flex justify-center md:justify-start w-full md:-mx-20">
          <button
            type="button"
            onClick={handleSignOut}
            className="btn mx-auto text-white font-inter font-bold bg-[#fec758] my-2 px-20"
          >
            Sign Out
          </button>
        </div>
      </div>

      {/* Right Section (hidden on mobile) */}
      <div className="hidden md:block w-full max-w-[50%] ml-6 mx-[5%]">
        <Image
          src="/assets/images/You.png"
          alt="Illustration"
          width={500}
          height={100}
          priority
        />
      </div>
    </div>
  );
}

export default RegisterComponent4;
