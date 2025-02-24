"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import Swal from "sweetalert2";
import { AppProgressBar } from "next-nprogress-bar"; // Import progress bar

function SendOtpComponent() {
  const [isChecked, setIsChecked] = useState(true);
  const router = useRouter();

  const Toast = Swal.mixin({
    toast: true,
    position: "top",
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Start Progress Bar when form is submitted
    window.dispatchEvent(new Event("start-progress"));

    try {
      const phoneNumber = e.target[0].value;

      const regex = /^[6-9]\d{9}$/;
      if (!regex.test(phoneNumber)) {
        Toast.fire({
          icon: "error",
          title: "Invalid Mobile Number",
        });
        e.target.reset();

        // Stop progress bar on error
        window.dispatchEvent(new Event("stop-progress"));
        return;
      }

      localStorage.setItem("phone", phoneNumber);

      const response = await fetch("/api/auth/login/login", {
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
          title: result.message,
        });

        // Stop progress bar before redirecting
        window.dispatchEvent(new Event("stop-progress"));
        router.push("/auth/login-verifyOtp");
      } else {
        Toast.fire({
          icon: "error",
          title: result.message,
        });
        e.target.reset();

        // Stop progress bar on error
        window.dispatchEvent(new Event("stop-progress"));
      }
    } catch (err) {
      console.error("Error:", err);
      Toast.fire({
        icon: "info",
        title: "Something went wrong. Please try again.",
      });

      // Stop progress bar on error
      window.dispatchEvent(new Event("stop-progress"));
    }
  };

  return (
    <div
      className={`w-full min-h-screen flex items-center justify-center relative flex-col md:flex-row bg-desktop`}
    >
      <AppProgressBar
        height="4px"
        color="#4287f5"
        options={{ showSpinner: false }}
        shallowRouting={false}
      />

      <div className="flex w-full flex-col md:flex-row items-center">
        {/* Branding Section */}
        <div className="w-full md:max-w-[30%] flex flex-col md:items-start text-center -mt-20 md:text-left ml-0 md:ml-[15%]">
          <Image
            className="mx-auto w-[250px] h-[250px] md:w-[350px] md:h-[350px]"
            src="/assets/images/monk-logo.png"
            alt="Logo"
            width={350}
            height={250}
            priority
          />

          <p className="text-black text-3xl -mt-10 md:text-4xl font-inter font-bold pb-2">
            Welcome to Sobhagya
          </p>
          <p className="text-black text-xl md:text-2xl font-inter font-semibold tracking-[-0.06em] md:block hidden">
            India's emerging astrology app. Guiding your destiny is our Sobhagya!
          </p>
        </div>

        {/* Form Section */}
        <div className="w-full max-w-[90%] md:max-w-[25%] mx-auto mt-2 md:mt-6 flex flex-col items-center md:items-start">
          <h1 className="text-3xl md:text-4xl mb-4 text-black font-inter font-bold text-center md:text-left hidden md:block">
            Happy to see you again!
          </h1>
          <form
            onSubmit={handleSubmit}
            className="space-y-4 w-full"
            style={{
              marginTop: "1rem", // Reducing the gap between "Sign In" and input bar for mobile
            }}
          >
            <label className="font-inter text-[#5B5B5B] -mb-2">Sign In</label>
            <input
              type="tel"
              placeholder="Enter your Phone Number"
              className="form-input w-full border-black focus:ring-0 focus:border-black"
              required
            />

            {/* Terms & Conditions Section */}
            <div className="flex items-start my-2">
              <input
                type="checkbox"
                className="form-checkbox text-black bg-white border-black checked:bg-black checked:border-black focus:outline-none mt-1"
                defaultChecked
                onChange={(e) => setIsChecked(e.target.checked)}
              />
              <p className="ml-2 text-[#5B5B5B] font-inter">
                By clicking, you are agreeing to our{" "}
                <Link
  href="https://docs.google.com/document/d/1QE87YySH5LUMGWqa6cj_KGgjTv8ictmNGhlDALrzcOY/edit?tab=t.0#heading=h.sdnh9hq3qzrx"
  className="underline text-blue-600"
  target="_blank"
  rel="noopener noreferrer"
>
  Privacy Policy
</Link>
{" "}
                &{" "}
                <Link
                  href="https://docs.google.com/document/d/1amDjyAAVSEHJeYwdFIpmDcAZ5l0aMiH6ZkPIStVfCag/edit?tab=t.0#heading=h.w6efcjeto7p3"
                  className="underline text-blue-600"
                  target="_blank"
  rel="noopener noreferrer"
                >
                  Terms of Service
                </Link>
              </p>
            </div>

            <button
              type="submit"
              className="btn w-full bg-black text-white hover:bg-gray-800 border-2 border-black focus:outline-none font-inter focus:ring-0 focus:border-black"
              disabled={!isChecked}
            >
              Sign In
            </button>

            <div className="font-inter justify-center flex">OR</div>

            <Link href="/auth/cover-register/page1">
              <button
                type="button"
                className="btn my-2 w-full bg-white text-black hover:bg-gray-100 font-inter border-black focus:outline-none focus:ring-0 focus:border-black"
                disabled={!isChecked}
              >
                Astrologer Registration
              </button>
            </Link>
          </form>
        </div>
      </div>

      {/* Bottom Gradient */}
      <div
        className="absolute bottom-0 w-full h-[15%] bg-gradient-to-t from-yellow-500 to-transparent md:hidden"
        style={{
          zIndex: -1,
        }}
      ></div>

      {/* Component-Level Styles */}
      <style jsx>{`
        @media (min-width: 768px) {
          /* Tailwind's md breakpoint */
          .bg-desktop {
            background-image: url("/assets/images/Group-8.png"),
              url("/assets/images/circle.png");
            background-position: bottom left, bottom right;
            background-repeat: no-repeat, no-repeat;
            background-size: 60%, 10%;
          }
        }
      `}</style>
    </div>
  );
}

export default SendOtpComponent;
