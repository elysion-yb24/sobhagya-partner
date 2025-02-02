"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const Step3Form = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    yoe: "",
    languages: [],
    astrologerTypes: [],
  });

  const [errors, setErrors] = useState({
    name: false,
    phone: false,
    yoe: false,
    languages: false,
    astrologerTypes: false,
  });

  const [showLanguagesList, setShowLanguagesList] = useState(false);
  const [showAstrologyTypesList, setShowAstrologyTypesList] = useState(false);

  const allLanguages = [
    "Hindi",
    "English",
    "Punjabi",
    "Bengali",
    "Marathi",
    "Tamil",
    "Telugu",
    "Bhojpuri",
    "Malayalam",
    "Kannada",
    "Gujarati",
    "Assamese",
    "Others",
  ];

  const allAstrologyTypes = [
    "Vedic",
    "Vastu",
    "Tarrot Reading",
    "Reiki Healing",
    "Palmistry",
    "KP",
    "Prashna",
    "Meditation & Mindfulness",
    "Yoga & Meditation",
    "Psychics",
    "Pranic Healing",
    "Feng Shui",
    "Fortune Telling",
    "Face Reading",
    "Numerology",
    "Others",
  ];

  // Pre-fill name and phone from localStorage
  useEffect(() => {
    const userDetails = localStorage.getItem("userDetails");
    if (userDetails) {
      const { name, phone } = JSON.parse(userDetails);
      setFormData((prevData) => ({ ...prevData, name, phone }));
    }
  }, []);

  const handleChange = (e) => {
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

  const handleAddEntry = (field, value) => {
    if (value.trim() === "" || formData[field].includes(value)) return;

    setFormData((prevData) => ({
      ...prevData,
      [field]: [...prevData[field], value.trim()],
    }));
    setErrors((prevErrors) => ({ ...prevErrors, [field]: false }));
  };

  const handleRemoveEntry = (field, value) => {
    setFormData((prevData) => ({
      ...prevData,
      [field]: prevData[field].filter((item) => item !== value),
    }));
  };

  const validateForm = () => {
    const newErrors = {
      name: formData.name === "",
      phone: formData.phone === "",
      yoe: formData.yoe === "" || formData.yoe < 0,
      languages: formData.languages.length === 0,
      astrologerTypes: formData.astrologerTypes.length === 0,
    };
    setErrors(newErrors);
    return !Object.values(newErrors).includes(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        const response = await fetch("/api/auth/cover-register/page3", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        });

        const result = await response.json();
        if (result.success) {
          router.push("/auth/register");
        } else {
          alert(result.message || "An error occurred");
        }
      } catch (error) {
        console.error("Error:", error);
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
        {/* Name Field */}
        <div className="mb-2">
          <label htmlFor="Name" className="font-inter text-black">
            Your Name <span className="text-red-500">*</span>
          </label>
          <input
            id="Name"
            name="name"
            type="text"
            placeholder="Enter Name"
            className={`form-input border-[#FFCD66] bg-gray-100 w-full mb-2 rounded-md px-4 py-2 ${
              errors.name ? "border-red-500" : ""
            }`}
            value={formData.name}
            disabled
          />
        </div>

        {/* Phone Number Field */}
        <div className="mb-2">
          <label htmlFor="phone" className="font-inter text-black">
            Your Phone Number <span className="text-red-500">*</span>
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            placeholder="Enter Your Phone Number"
            className={`form-input border-[#FFCD66] bg-gray-100 w-full rounded-md mb-2 px-4 py-2 ${
              errors.phone ? "border-red-500" : ""
            }`}
            value={formData.phone}
            disabled
          />
        </div>

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
          <label htmlFor="languages" className="font-inter text-black">
            Languages <span className="text-red-500">*</span>
          </label>
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
                  handleAddEntry("languages", e.target.value);
                  e.target.value = "";
                }
              }}
            />
            {showLanguagesList && (
              <ul className="absolute bg-white border border-gray-300 w-full max-h-40 overflow-y-auto mt-1 rounded-md shadow-lg z-10">
                {allLanguages.map((lang) => (
                  <li
                    key={lang}
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                    onMouseDown={() => handleAddEntry("languages", lang)}

                  >
                    {lang}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {formData.languages.map((lang) => (
              <span
                key={lang}
                className="bg-[#FFCD66] text-white px-3 py-1 rounded-full cursor-pointer"
                onClick={() => handleRemoveEntry("languages", lang)}
              >
                {lang} ×
              </span>
            ))}
          </div>
          {errors.languages && (
            <p className="text-red-500 text-sm">Please add at least one language.</p>
          )}
        </div>

        {/* Specializations Field */}
        <div className="mb-2">
          <label htmlFor="astrologerTypes" className="font-inter text-black">
            Specializations <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder="Add a specialization"
              className="form-input w-full rounded-md px-4 py-2 border-[#FFCD66]"
              onFocus={() => setShowAstrologyTypesList(true)}
              onBlur={() => setTimeout(() => setShowAstrologyTypesList(false), 200)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddEntry("astrologerTypes", e.target.value);
                  e.target.value = "";
                }
              }}
            />
            {showAstrologyTypesList && (
              <ul className="absolute bg-white border border-gray-300 w-full max-h-40 overflow-y-auto mt-1 rounded-md shadow-lg z-10">
                {allAstrologyTypes.map((type) => (
                  <li
                    key={type}
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                    onMouseDown={() => handleAddEntry("astrologerTypes", type)}

                  >
                    {type}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {formData.astrologerTypes.map((type) => (
              <span
                key={type}
                className="bg-[#FFCD66] text-white px-3 py-1 rounded-full cursor-pointer"
                onClick={() => handleRemoveEntry("astrologerTypes", type)}
              >
                {type} 
              </span>
            ))}
          </div>
          {errors.astrologerTypes && (
            <p className="text-red-500 text-sm">Please add at least one specialization.</p>
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
