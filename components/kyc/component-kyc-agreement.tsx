"use client";

import React, { useState, useEffect, useRef } from "react";
import SignatureCanvas from "react-signature-canvas";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const AgreementComponent = () => {
  const [astrologerData, setAstrologerData] = useState({
    name: "Loading...",
    date: "Loading...",
  });

  const agreementRef = useRef(null);
  const signatureRef = useRef(null);

  // ✅ Remove overflow-hidden when the component mounts & restore on unmount
  useEffect(() => {
    document.documentElement.classList.remove("overflow-hidden");
    document.body.classList.remove("overflow-hidden");

    return () => {
      document.documentElement.classList.add("overflow-hidden");
      document.body.classList.add("overflow-hidden");
    };
  }, []);

  useEffect(() => {
    const fetchAstrologerDetails = async () => {
      try {
        const response = await fetch("/api/kyc/agreement", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        });

        const result = await response.json();
        if (result.success) {
          setAstrologerData({
            name: result.data.name,
            date: result.data.date,
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

  const clearSignature = () => {
    signatureRef.current.clear();
  };

  // ✅ Fix: Ensure the Entire Agreement is Downloaded Across Multiple Pages
  const downloadPDF = async () => {
    if (!agreementRef.current) return;

    // Hide buttons before capturing the PDF
    const buttons = document.getElementById("action-buttons");
    if (buttons) buttons.style.display = "none";

    setTimeout(async () => {
      const canvas = await html2canvas(agreementRef.current, {
        scale: 3,
        useCORS: true,
        windowWidth: document.documentElement.offsetWidth,
        windowHeight: agreementRef.current.scrollHeight,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const imgWidth = 210;
      const pageHeight = 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let y = 0;

      while (y < imgHeight) {
        pdf.addImage(imgData, "PNG", 0, -y, imgWidth, imgHeight);
        y += pageHeight;
        if (y < imgHeight) pdf.addPage();
      }

      pdf.save("agreement.pdf");

      // Show buttons again after download
      if (buttons) buttons.style.display = "flex";
    }, 500);
  };

  const handleSignOut = async () => {
    try {
      const response = await fetch("/api/auth/logout/logout", {
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
    <div className="flex flex-col items-center w-full min-h-screen py-8">
      {/* Wrapper with auto height adjustment */}
      <div className="flex flex-col w-full max-w-[900px]">
        {/* Scrollable Agreement Container */}
        <div
          className="bg-white shadow-lg rounded-lg p-6 md:p-12 text-gray-800 h-[75vh] overflow-y-auto scrollbar-hide"
          ref={agreementRef}
        >
          {/* Header */}
          <div className="flex items-center px-4 py-4 md:py-6 text-lg md:text-2xl font-bold rounded-xl border border-black border-solid bg-amber-400 bg-opacity-10 max-md:px-3 w-full">
            <div className="w-16 h-16 md:w-24 md:h-24 rounded-full overflow-hidden mr-4">
              <img
                src="/assets/images/monk-logo.png"
                alt="Logo"
                className="w-full h-full object-cover"
              />
            </div>
            <span className="text-[#252525] text-base md:text-3xl font-bold">
              Sobhagya - Astrology & Horoscope
            </span>
          </div>

          {/* Title */}
          <h2 className="mt-4 md:mt-6 text-lg md:text-2xl font-bold text-center">
            AGREEMENT BETWEEN ASTROLOGER AND SOBHAGYA APP
          </h2>

          {/* Agreement Content */}
          {[
            {
              title: "1. Confidentiality",
              content: [
                "Not share any details, including user information, pricing structures, or confidential business information of the Company, with any third party.",
                "Maintain the confidentiality of the Company's proprietary information during the term of this Agreement and after its termination.",
              ],
            },
            {
              title: "2. Exit Notice and Payment",
              content: [
                "The Astrologer agrees to provide a written notice to the Company at least 15 days prior to their intended date of exit.",
                "Upon exit, the payment for the Astrologer's work will be processed and credited within 45 days from the date of exit.",
              ],
            },

            {
              title: "3. Immediate Termination",
              content: [
                "If the Astrologer is found misbehaving with any user of the Sobhagya App.",
                "If the Astrologer discloses confidential details or violates any terms of this Agreement.",
                "If the Astrologer's actions harm the reputation or operations of the Company.",
              ],
            },
            {
              title: "4. General Terms",
              content: [
                "This Agreement becomes effective on the Astrologer's date of joining 10-Dec-2024.",
                "This Agreement is governed by the laws of India.",
                "Any disputes arising out of or relating to this Agreement shall be resolved in the courts of Delhi.",
              ],
            },
          ].map((section, index) => (
            <div key={index} className="mt-6 md:mt-8">
              <h2 className="text-base md:text-xl font-bold">{section.title}</h2>
              <ul className="mt-2 md:mt-3 space-y-2 md:space-y-3 text-sm md:text-base text-gray-700 leading-relaxed">
                {section.content.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>
          ))}

          {/* Signature Section */}
          <div className="mt-10 text-sm md:text-lg font-semibold">
            <h2 className="text-base md:text-xl font-bold">5. Signatures</h2>
            <p className="mt-2 md:mt-3 font-medium">
              By signing this Agreement, both parties agree to abide by the terms and conditions set forth herein.
            </p>
          </div>

          {/* Signature Fields */}
          <div className="flex flex-col md:flex-row justify-between mt-6 md:mt-8 text-sm md:text-lg font-semibold">
            <div className="w-full md:w-1/2">
              <p className="font-bold">For Sobhagya App:</p>
              <p className="mt-2">Name: Xyx</p>
              <p className="mt-1">Position: Manager</p>
              <p className="mt-1">Date: 10-Dec-2024</p>
              <p className="mt-1">Signature: _____________</p>
            </div>

            <div className="w-full md:w-1/2 mt-4 md:mt-0">
              <p className="font-bold">For Astrologer:</p>
              <p className="mt-2">Name: {astrologerData.name}</p>
              <p className="mt-1">Date: {astrologerData.date}</p>
              <SignatureCanvas ref={signatureRef} penColor="black" canvasProps={{ width: 300, height: 100, className: "border border-gray-300 rounded-lg mt-2" }} />
              <button onClick={clearSignature} className="text-blue-500 text-sm mt-2">Clear Signature</button>
            </div>
          </div>
        </div>

        {/* Buttons Section - Always Visible Below Agreement */}
        <div id="action-buttons" className="flex justify-between mt-6">
          <button onClick={downloadPDF} className="w-[48%] py-2 px-4 bg-[#FFCD66] text-white font-inter rounded-lg shadow-lg">Download Agreement</button>
          <button onClick={handleSignOut} className="w-[48%] py-2 px-4 bg-[#FFCD66] text-white font-inter rounded-lg shadow-lg">Sign Out</button>
        </div>
      </div>
    </div>
  );
};

export default AgreementComponent;
