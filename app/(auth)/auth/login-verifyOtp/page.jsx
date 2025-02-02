"use client"

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import { useRouter } from 'next/navigation';
import { useTimer } from 'react-timer-hook';

const Lottie = dynamic(() => import("lottie-react"), { ssr: false });
const OTPInput = dynamic(() => import("react-otp-input"), { ssr: false });
import phoneOtpAnimation from "@/components/login/phoneOtp.json";

function VerifyOtpComponent() {
  const [otp, setOtp] = useState('');
  const [phone, setPhone] = useState('');
  const [disable, setDisable] = useState(false);
  const router = useRouter();

  const Toast = Swal.mixin({
    toast: true,
    position: 'top',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
  });

  const time = new Date();
  const { seconds, isRunning, start, restart } = useTimer({
    expiryTimestamp: time.setSeconds(time.getSeconds() + 30),
    autoStart: true,
  });

  useEffect(() => {
    const storedPhone = localStorage.getItem('phone');
    if (storedPhone) {
      setPhone(storedPhone);
    } else {
      router.push('/auth/login/send-otp');
    }
  }, [router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/auth/login/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, otp, notifyToken: "web-login" }),
      });

      const result = await response.json();

      if (result.success) {
        Toast.fire({
          icon: "success",
          title: result.message,
        });

        // Redirect based on isDetailsFilled
        if (result.isDetailsFilled) {
          // If user details are already filled, go to /auth/register
          router.replace("/auth/register");
        } else {
          // If details are not filled, go to cover-register/page3
          router.replace("/auth/cover-register/page3");
        }
      } else {
        Toast.fire({
          icon: "error",
          title: result.message,
        });
        setOtp("");
      }
    } catch (err) {
      console.error("Error verifying OTP:", err);
      Toast.fire({
        icon: "error",
        title: "Something went wrong. Please try again.",
      });
    }
  };

  const handleResendOtp = async () => {
    try {
      setDisable(true);
      const response = await fetch("/api/auth/login/resend-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });

      const result = await response.json();

      if (result.success) {
        Toast.fire({
          icon: "success",
          title: "OTP resent successfully",
        });

        const newTime = new Date();
        newTime.setSeconds(newTime.getSeconds() + 30);
        restart(newTime);
      } else {
        Toast.fire({
          icon: "error",
          title: result.message,
        });
      }
    } catch (err) {
      console.error("Error resending OTP:", err);
      Toast.fire({
        icon: "error",
        title: "Something went wrong. Please try again.",
      });
    } finally {
      setDisable(false);
    }
  };

  return (
    <div className="max-w-[400px] m-auto min-h-screen flex justify-center items-center px-4">
      <div>
        <Lottie animationData={phoneOtpAnimation} />
        <h1 className="text-lg font-semibold my-4 text-center">
          Enter OTP sent to <span className="font-bold">{phone}</span>
        </h1>
        <form onSubmit={handleSubmit} className="text-center">
          <div className="flex justify-center mb-4">
            <OTPInput
              value={otp}
              onChange={setOtp}
              numInputs={4}
              renderSeparator={<span className="px-2">-</span>}
              renderInput={(props) => (
                <input
                  {...props}
                  className="w-12 h-12 sm:w-10 sm:h-10 border border-gray-300 rounded text-center font-bold text-lg"
                />
              )}
              shouldAutoFocus
              skipDefaultStyles
            />
          </div>
          {isRunning ? (
            <div className="my-4 text-sm text-center">
              Resend OTP in {seconds} seconds
            </div>
          ) : (
            <div
              className={`my-4 text-sm text-blue-500 font-bold text-center cursor-pointer ${
                disable ? "opacity-50 cursor-not-allowed" : ""
              }`}
              onClick={handleResendOtp}
            >
              Resend Now
            </div>
          )}
          <button
            type="submit"
            className="btn btn-primary my-8 w-full"
            disabled={!otp || otp.length !== 4}
          >
            Verify OTP
          </button>
        </form>
      </div>
    </div>
  );
}

export default VerifyOtpComponent;
