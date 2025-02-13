"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Swal from "sweetalert2";

const Step1Form = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
  });
  const [errors, setErrors] = useState({
    name: false,
    phone: false,
  });
  const [loading, setLoading] = useState(false);

  const Toast = Swal.mixin({
    toast: true,
    position: "top",
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setErrors({ ...errors, [name]: false });
};

  const validateForm = () => {
    const newErrors = {
      name: formData.name === "",
      phone: formData.phone === "" || !/^[6-9]\d{9}$/.test(formData.phone),
    };
    setErrors(newErrors);

    if (newErrors.name) {
      Toast.fire({
        icon: "error",
        title: "Name is required.",
      });
    }
    if (newErrors.phone) {
      Toast.fire({
        icon: "error",
        title: "Invalid phone number. Must be 10 digits starting with 6-9.",
      });
    }

    return !newErrors.name && !newErrors.phone;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (validateForm()) {
      setLoading(true);
      try {
        console.log("Form data:", formData);
        const response = await fetch("/api/auth/cover-register/page1", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        });

        const result = await response.json();
        if (result.success) {
          // Save name and phone to localStorage
          localStorage.setItem("userDetails", JSON.stringify(formData));
          Toast.fire({
            icon: "success",
            title: "OTP sent successfully!",
          });
          router.push("/auth/cover-register/page2"); // Navigate to Step 2
        } else {
          Toast.fire({
            icon: "error",
            title: result.message || "Failed to send OTP.",
          });
        }
      } catch (error) {
        console.error("Error:", error);
        Toast.fire({
          icon: "error",
          title: "An error occurred. Please try again.",
        });
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="dark:text-white">
      <div className="justify-center items-center">
        <p className="text-center text-[#9C9AA5] text-sm font-inter -mt-2">
          1 / 3
        </p>
        <h2 className="text-xl text-black font-inter text-center mt-1">
          We are Happy to Onboard You
        </h2>
        <p className="text-[#9C9AA5] text-center text-sm mx-auto">
          This is just the beginning of a remarkable journey—your first step to
          joining us as an esteemed astrologer!
        </p>
        <Image
          className="mx-auto -mt-5"
          src="/assets/images/monk-logo.png"
          alt="Logo"
          width={250}
          height={100}
          priority
        />
      </div>

      {/* Name Field */}
      <div className="mb-4">
        <label htmlFor="name" className="font-inter">
          Your Name <span className="text-red-500">*</span>
        </label>
        <input
          id="name"
          name="name"
          type="text"
          placeholder="Enter Name"
          className={`form-input placeholder:text-gray-400 ${
            errors.name ? "border-red-500" : "border-[#FFCD66]"
          }`}
          value={formData.name}
          onChange={handleChange}
        />
        {errors.name && <p className="text-red-500 text-sm">Name is required</p>}

        {/* ✅ Updated Note Below Name Field */}
        <p
          className="font-inter font-semibold text-[10px] text-[#9C9AA5] leading-[12.1px] mt-1"
        >
          Note: Enter your name as per your Government Records
        </p>
      </div>

      {/* Phone Field */}
      <div className="mt-6">
        <label htmlFor="phone" className="font-inter">
          Your Phone Number <span className="text-red-500">*</span>
        </label>
        <input
          id="phone"
          name="phone"
          type="tel"
          placeholder="Enter Your Phone Number"
          className={`form-input placeholder:text-gray-400 ${
            errors.phone ? "border-red-500" : "border-[#FFCD66]"
          }`}
          value={formData.phone}
          onChange={handleChange}
        />
        {errors.phone && (
          <p className="text-red-500 text-sm">Invalid phone number</p>
        )}
      </div>

      {/* Continue Button */}
      <button
        type="submit"
        className="btn mx-auto w-[60%] text-white font-inter bg-[#FFCD66] my-10"
        disabled={loading}
      >
        {loading ? "Sending..." : "Continue"}
      </button>
    </form>
  );
};

export default Step1Form;
