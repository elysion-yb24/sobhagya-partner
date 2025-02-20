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

  // Dropdown visibility states
  const [showLanguagesList, setShowLanguagesList] = useState<boolean>(false);
  const [showAstroTypesList, setShowAstroTypesList] = useState<boolean>(false);

  const allLanguages: string[] = [
    "Hindi", "English", "Punjabi", "Bengali", "Marathi", "Tamil", "Telugu",
    "Bhojpuri", "Malayalam", "Kannada", "Gujarati", "Assamese", "Others"
  ];

  const allAstrologyTypes: string[] = [
    "Vedic", "Vastu", "Tarrot Reading", "Reiki Healing", "Palmistry", "KP", "Prashna",
    "Meditation & Mindfulness", "Yoga & Meditation", "Psychics", "Pranic Healing",
    "Feng Shui", "Fortune Telling", "Face Reading", "Numerology", "Others"
  ];

  // Pre-fill name and phone from localStorage (and set them as read-only)
  useEffect(() => {
    const userDetails = localStorage.getItem("userDetails");
    if (userDetails) {
      const { name, phone } = JSON.parse(userDetails);
      setFormData((prev) => ({
        ...prev,
        name: name || "",
        phone: phone || "",
      }));
    }
  }, []);

  // Handle Input Change for yoe (years of experience)
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
    setErrors((prevErrors) => ({
      ...prevErrors,
      [name]: false,
    }));
  };

  // Common function for adding an entry (languages or astrologerTypes)
  const handleAddEntry = (field: "languages" | "astrologerTypes", value: string) => {
    const trimmedValue = value.trim();
    if (!trimmedValue || formData[field].includes(trimmedValue)) return;

    setFormData((prev) => ({
      ...prev,
      [field]: [...prev[field], trimmedValue],
    }));
    setErrors((prevErrors) => ({ ...prevErrors, [field]: false }));
  };

  // Common function for removing an entry (languages or astrologerTypes)
  const handleRemoveEntry = (field: "languages" | "astrologerTypes", value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].filter((item) => item !== value),
    }));
  };

  // Validate form before submission
  const validateForm = (): boolean => {
    const newErrors = {
      name: formData.name.trim() === "",
      phone: formData.phone.trim() === "",
      yoe: formData.yoe === "" || parseInt(formData.yoe) < 0,
      languages: formData.languages.length === 0,
      astrologerTypes: formData.astrologerTypes.length === 0,
    };
    setErrors(newErrors);
    return !Object.values(newErrors).includes(true);
  };

  // Handle form submission
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

  // Toggles
  const toggleLanguagesList = () => setShowLanguagesList((prev) => !prev);
  const toggleAstroTypesList = () => setShowAstroTypesList((prev) => !prev);

  return (
    <div className="px-4 sm:px-8 max-w-[700px] mx-auto">
      <div className="text-center mb-5">
        <p className="text-center text-[#9C9AA5] text-sm font-inter -mt-2">3 / 3</p>
        <h1 className="text-2xl font-bold text-black font-inter">
          We are Happy to Onboard You
        </h1>
        <p className="text-sm text-[#9C9AA5] mx-auto">
          This is just the beginning of a remarkable journey—your first step to
          joining us as an esteemed astrologer!
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Name (read-only) */}
        <div className="mb-4">
          <label htmlFor="name" className="font-inter text-black">
            Name <span className="text-red-500">*</span>
          </label>
          <input
            id="name"
            name="name"
            type="text"
            placeholder="Enter your name"
            className={`form-input w-full rounded-md px-4 py-2 border ${
              errors.name ? "border-red-500" : "border-[#FFCD66]"
            }`}
            value={formData.name}
            readOnly
          />
          {errors.name && (
            <p className="text-red-500 text-sm">Name is required.</p>
          )}
        </div>

        {/* Phone (read-only) */}
        <div className="mb-4">
          <label htmlFor="phone" className="font-inter text-black">
            Phone Number <span className="text-red-500">*</span>
          </label>
          <input
            id="phone"
            name="phone"
            type="text"
            placeholder="Enter your phone number"
            className={`form-input w-full rounded-md px-4 py-2 border ${
              errors.phone ? "border-red-500" : "border-[#FFCD66]"
            }`}
            value={formData.phone}
            readOnly
          />
          {errors.phone && (
            <p className="text-red-500 text-sm">Phone number is required.</p>
          )}
        </div>

        {/* Years of Experience */}
        <div className="mb-4">
          <label htmlFor="yoe" className="font-inter text-black">
            Years of Experience <span className="text-red-500">*</span>
          </label>
          <input
            id="yoe"
            name="yoe"
            type="number"
            placeholder="Enter Years of Experience"
            className={`form-input w-full rounded-md px-4 py-2 border ${
              errors.yoe ? "border-red-500" : "border-[#FFCD66]"
            }`}
            value={formData.yoe}
            onChange={handleChange}
            min="0"
          />
          {errors.yoe && (
            <p className="text-red-500 text-sm">
              Please enter valid years of experience.
            </p>
          )}
        </div>

        {/* Languages */}
        <div className="mb-4">
          <label className="font-inter text-black">
            Languages <span className="text-red-500">*</span>
          </label>
          {/* Read-only input to toggle dropdown */}
          <div className="relative">
            <input
              type="text"
              placeholder="Select a language"
              className={`form-input w-full rounded-md px-4 py-2 border ${
                errors.languages ? "border-red-500" : "border-[#FFCD66]"
              }`}
              value=""
              onClick={toggleLanguagesList}
              readOnly
            />
            {/* Dropdown list */}
            {showLanguagesList && (
              <ul
                className="absolute left-0 w-full mt-1 bg-white border border-[#FFCD66] rounded-md shadow z-10 max-h-56 overflow-auto"
                onMouseLeave={() => setShowLanguagesList(false)}
              >
                {allLanguages.map((lang) => (
                  <li
                    key={lang}
                    onClick={() => {
                      handleAddEntry("languages", lang);
                      setShowLanguagesList(false);
                    }}
                    className="px-4 py-2 hover:bg-[#FFE7B8] cursor-pointer"
                  >
                    {lang}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Display selected languages */}
          <div className="flex flex-wrap gap-2 mt-2">
            {formData.languages.map((lang) => (
              <span
                key={lang}
                onClick={() => handleRemoveEntry("languages", lang)}
                className="bg-[#FFCD66] text-white font-bold px-3 py-1 rounded-full cursor-pointer"
              >
                {lang} ×
              </span>
            ))}
          </div>
          {errors.languages && (
            <p className="text-red-500 text-sm">
              Please add at least one language.
            </p>
          )}
        </div>

        {/* Astrologer Types (Specializations) */}
        <div className="mb-4">
          <label className="font-inter text-black">
            Specializations <span className="text-red-500">*</span>
          </label>
          {/* Read-only input to toggle dropdown */}
          <div className="relative">
            <input
              type="text"
              placeholder="Select a specialization"
              className={`form-input w-full rounded-md px-4 py-2 border ${
                errors.astrologerTypes ? "border-red-500" : "border-[#FFCD66]"
              }`}
              value=""
              onClick={toggleAstroTypesList}
              readOnly
            />
            {/* Dropdown list */}
            {showAstroTypesList && (
              <ul
                className="absolute left-0 w-full mt-1 bg-white border border-[#FFCD66] rounded-md shadow z-10 max-h-56 overflow-auto"
                onMouseLeave={() => setShowAstroTypesList(false)}
              >
                {allAstrologyTypes.map((type) => (
                  <li
                    key={type}
                    onClick={() => {
                      handleAddEntry("astrologerTypes", type);
                      setShowAstroTypesList(false);
                    }}
                    className="px-4 py-2 hover:bg-[#FFE7B8] cursor-pointer"
                  >
                    {type}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Display selected astrologer types */}
          <div className="flex flex-wrap gap-2 mt-2">
            {formData.astrologerTypes.map((type) => (
              <span
                key={type}
                onClick={() => handleRemoveEntry("astrologerTypes", type)}
                className="bg-[#FFCD66] text-white px-3 py-1 font-bold rounded-full cursor-pointer"
              >
                {type} ×
              </span>
            ))}
          </div>
          {errors.astrologerTypes && (
            <p className="text-red-500 text-sm">
              Please add at least one specialization.
            </p>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="btn mx-auto w-full bg-[#FFCD66] text-white font-inter py-2 rounded-md text-lg font-semibold mt-6"
        >
          Submit
        </button>
      </form>
    </div>
  );
};

export default Step3Form;
