"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useTimer } from "react-timer-hook";
import Swal from "sweetalert2";

const Step2Form: React.FC = () => {
  const router = useRouter();
  const [otp, setOtp] = useState<string[]>(["", "", "", ""]);
  const [loading, setLoading] = useState<boolean>(false);
  const [resending, setResending] = useState<boolean>(false);
  const [phoneNumber, setPhoneNumber] = useState<string>("");

  // References for each input field
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Timer for Resend OTP
  const time = new Date();
  time.setSeconds(time.getSeconds() + 30);
  const { seconds, isRunning, restart } = useTimer({
    expiryTimestamp: time,
    autoStart: true,
  });

  useEffect(() => {
    // ✅ Fetch phone number from localStorage safely
    try {
      const userDetails = JSON.parse(localStorage.getItem("userDetails") || "{}");
      if (userDetails?.phone) {
        setPhoneNumber(userDetails.phone);
      } else {
        console.warn("⚠️ Phone number not found in localStorage");
        router.push("/auth/login/send-otp"); // Redirect if phone is missing
      }
    } catch (error) {
      console.error("❌ Error fetching phone number:", error);
      router.push("/auth/login/send-otp");
    }
  }, [router]);

  // ✅ Handle OTP Input Change
  const handleChange = (index: number, value: string) => {
    const updatedOtp = [...otp];
    updatedOtp[index] = value.slice(0, 1); // Only one digit per input
    setOtp(updatedOtp);

    // Auto-focus to the next input field
    if (value && index < inputRefs.current.length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // ✅ Handle Backspace Navigation
  const handleKeyDown = (index: number, event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Backspace" && otp[index] === "" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const Toast = Swal.mixin({
    toast: true,
    position: "top",
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
  });

  // ✅ Resend OTP Functionality
  const handleResendOTP = async () => {
    if (resending) return;

    if (!phoneNumber) {
      Toast.fire({
        icon: "error",
        title: "⚠️ Phone number is missing. Please try again.",
      });
      return;
    }

    setResending(true);
    try {
      const response = await fetch("/api/auth/login/resend-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ phone: phoneNumber }),
      });

      const result = await response.json();
      if (result.success) {
        Toast.fire({
          icon: "success",
          title: "✅ OTP has been resent successfully!",
        });

        // ✅ Restart timer properly
        const newTime = new Date();
        newTime.setSeconds(newTime.getSeconds() + 30);
        restart(newTime);
      } else {
        Toast.fire({
          icon: "error",
          title: result.message || "❌ Failed to resend OTP",
        });
      }
    } catch (error) {
      console.error("❌ Error resending OTP:", error);
      Toast.fire({
        icon: "error",
        title: "⚠️ An error occurred while resending OTP. Please try again.",
      });
    } finally {
      setResending(false);
    }
  };

  // ✅ Handle OTP Verification
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const otpCode = otp.join("");
    if (otpCode.length === 4) {
      setLoading(true);
      try {
        const userDetails = JSON.parse(localStorage.getItem("userDetails") || "{}");

        const response = await fetch("/api/auth/cover-register/page2", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ name: userDetails.name, phone: userDetails.phone, otp: otpCode }),
        });

        const result = await response.json();
        if (result.success) {
          router.push("/auth/cover-register/page3"); // Navigate to Step 3
        } else {
          Toast.fire({
            icon: "error",
            title: result.message || "❌ OTP verification failed",
          });
        }
      } catch (error) {
        console.error("❌ Error:", error);
        Toast.fire({
          icon: "error",
          title: "⚠️ An error occurred. Please try again.",
        });
      } finally {
        setLoading(false);
      }
    } else {
      Toast.fire({
        icon: "error",
        title: "⚠️ Please enter a valid 4-digit OTP",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="dark:text-white">
      <div className="justify-center items-center">
        <p className="text-center text-[#9C9AA5] text-xs font-inter -mt-2 mb-1">
          2 / 3
        </p>
        <h1 className="text-lg md:text-xl text-black font-bold font-inter text-center">
          Secure Your Account <br />
          Verify Your Phone Number!
        </h1>
        <Image
          className="mx-auto my-[5%]"
          src="/assets/images/Rating.png"
          alt="Verification Logo"
          width={200}
          height={100}
          priority
        />
        <h1 className="text-2xl my-[5%] text-black font-bold font-inter text-center">
          OTP Verification
        </h1>

        <p className="text-center text-black text-sm font-semibold">
          We will send you a one-time password on this{" "}
          <span className="text-black font-bold">Mobile Number</span>
        </p>

        <p className="text-center text-black font-bold text-medium mt-1 mb-1">
          {phoneNumber ? `+91 - ${phoneNumber}` : "+91 - XXXXX XXXXX"}
        </p>
      </div>

      {/* OTP Input Fields */}
      <div className="flex justify-center gap-4 my-5">
        {[...Array(4)].map((_, index) => (
          <input
            key={index}
            ref={(el) => (inputRefs.current[index] = el)}
            type="text"
            maxLength={1}
            className="w-12 h-12 text-center text-xl font-bold bg-gray-100 border border-[#fec758] rounded-full focus:outline-none focus:ring-2 focus:ring-yellow-300"
            value={otp[index]}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
          />
        ))}
      </div>

      {/* Resend OTP Section */}
      <div className="text-center font-inter my-3">
        {isRunning ? (
          <p className="text-black">Resend OTP in {seconds}s</p>
        ) : (
          <button type="button" className="text-[#E9890A] cursor-pointer" onClick={handleResendOTP}>
            {resending ? "Resending..." : "Did Not Get OTP: Resend OTP"}
          </button>
        )}
      </div>

      <button type="submit" className="btn mx-auto w-[60%] text-white font-inter font-bold bg-[#fec758] my-5" disabled={loading}>
        {loading ? "Verifying..." : "Continue"}
      </button>
    </form>
  );
};

export default Step2Form;
