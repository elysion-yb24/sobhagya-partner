"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface FormData {
  name: string;
  phone: string;
  yoe: string;
  languages: string[];
  astrologerTypes: string[];
}

const Step3Form: React.FC = () => {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    name: "",
    phone: "",
    yoe: "",
    languages: [],
    astrologerTypes: [],
  });

  const [errors, setErrors] = useState<Record<string, boolean>>({
    name: false,
    phone: false,
    yoe: false,
    languages: false,
    astrologerTypes: false,
  });

  const [showLanguagesList, setShowLanguagesList] = useState<boolean>(false);
  const [showAstrologyTypesList, setShowAstrologyTypesList] = useState<boolean>(false);

  const allLanguages: string[] = [
    "Hindi", "English", "Punjabi", "Bengali", "Marathi", "Tamil", "Telugu",
    "Bhojpuri", "Malayalam", "Kannada", "Gujarati", "Assamese", "Others"
  ];

  const allAstrologyTypes: string[] = [
    "Vedic", "Vastu", "Tarot Reading", "Reiki Healing", "Palmistry", "KP", "Prashna",
    "Meditation & Mindfulness", "Yoga & Meditation", "Psychics", "Pranic Healing",
    "Feng Shui", "Fortune Telling", "Face Reading", "Numerology", "Others"
  ];

  // ✅ Fetch and prefill name & phone from localStorage
  useEffect(() => {
    try {
      const userDetails = JSON.parse(localStorage.getItem("userDetails") || "{}");
      if (userDetails.name && userDetails.phone) {
        setFormData((prevData) => ({ ...prevData, name: userDetails.name, phone: userDetails.phone }));
      }
    } catch (error) {
      console.error("⚠️ Error fetching user details from localStorage:", error);
    }
  }, []);

  // ✅ Handle Input Change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
    setErrors((prevErrors) => ({ ...prevErrors, [name]: false }));
  };

  // ✅ Handle Adding Entries to Arrays
  const handleAddEntry = (field: keyof FormData, value: string) => {
    if (value.trim() === "" || formData[field].includes(value)) return;
    setFormData((prevData) => ({ ...prevData, [field]: [...prevData[field], value.trim()] }));
    setErrors((prevErrors) => ({ ...prevErrors, [field]: false }));
  };

  // ✅ Handle Removing Entries from Arrays
  const handleRemoveEntry = (field: keyof FormData, value: string) => {
    setFormData((prevData) => ({
      ...prevData,
      [field]: prevData[field].filter((item) => item !== value),
    }));
  };

  // ✅ Validate Form Before Submission
  const validateForm = (): boolean => {
    const newErrors = {
      name: formData.name === "",
      phone: formData.phone === "",
      yoe: formData.yoe === "" || parseInt(formData.yoe) < 0,
      languages: formData.languages.length === 0,
      astrologerTypes: formData.astrologerTypes.length === 0,
    };
    setErrors(newErrors);
    return !Object.values(newErrors).includes(true);
  };

  // ✅ Handle Form Submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        const response = await fetch("/api/auth/cover-register/page3", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });

        const result = await response.json();
        if (result.success) {
          router.push("/auth/register");
        } else {
          alert(result.message || "An error occurred");
        }
      } catch (error) {
        console.error("❌ Error:", error);
        alert("An error occurred while submitting the form.");
      }
    }
  };

  return (
    <div className="px-4 sm:px-8 max-w-[700px] mx-auto">
      <div className="text-center mb-5">
        <p className="text-center text-[#9C9AA5] text-sm font-inter -mt-2">3 / 3</p>
        <h1 className="text-2xl font-bold text-black font-inter">We are Happy to Onboard You</h1>
        <p className="text-sm text-[#9C9AA5] mx-auto">
          This is just the beginning of a remarkable journey—your first step to joining us as an esteemed astrologer!
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Years of Experience */}
        <div className="mb-2">
          <label htmlFor="yoe" className="font-inter text-black">
            Years of Experience <span className="text-red-500">*</span>
          </label>
          <input
            id="yoe"
            name="yoe"
            type="number"
            placeholder="Enter Years of Experience"
            className={`form-input w-full rounded-md mb-2 px-4 py-2 ${
              errors.yoe ? "border-red-500" : "border-[#FFCD66]"
            }`}
            value={formData.yoe}
            onChange={handleChange}
            min="0"
          />
          {errors.yoe && <p className="text-red-500 text-sm">Please enter valid years of experience.</p>}
        </div>

        {/* Languages Field */}
        <div className="mb-2">
          <label className="font-inter text-black">Languages <span className="text-red-500">*</span></label>
          <div className="relative">
            <input
              type="text"
              placeholder="Add a language"
              className="form-input w-full rounded-md px-4 py-2 border-[#FFCD66]"
              onFocus={() => setShowLanguagesList(true)}
              onBlur={() => setTimeout(() => setShowLanguagesList(false), 200)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddEntry("languages", e.currentTarget.value);
                  e.currentTarget.value = "";
                }
              }}
            />
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {formData.languages.map((lang) => (
              <span key={lang} className="bg-[#FFCD66] text-white px-3 py-1 rounded-full cursor-pointer" onClick={() => handleRemoveEntry("languages", lang)}>
                {lang} ×
              </span>
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <button type="submit" className="btn mx-auto w-full bg-[#FFCD66] text-white font-inter py-2 rounded-md text-lg font-semibold mt-6">
          Submit
        </button>
      </form>
    </div>
  );
};

export default Step3Form;
