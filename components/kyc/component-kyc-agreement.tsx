"use client";

import React, { useState, useEffect, useRef } from "react";
import SignatureCanvas from "react-signature-canvas";
import jsPDF from "jspdf";
import { useRouter } from "next/navigation";
import html2canvas from "html2canvas";

interface AstrologerData {
  name: string;
  date: string;
}

const AgreementComponent: React.FC = () => {
  const router = useRouter();
  const [astrologerData, setAstrologerData] = useState<AstrologerData>({
    name: "Loading...",
    date: "Loading...",
  });

  const agreementRef = useRef<HTMLDivElement | null>(null);
  const signatureRef = useRef<SignatureCanvas | null>(null);

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
        if (result?.success && result?.data) {
          setAstrologerData({
            name: result.data.name || "N/A",
            date: result.data.date || new Date().toLocaleDateString(),
          });
        } else {
          console.error("Failed to fetch astrologer details:", result?.message);
        }
      } catch (error) {
        console.error("Error fetching astrologer details:", error);
      }
    };

    fetchAstrologerDetails();
  }, []);

  const clearSignature = () => {
    if (signatureRef.current) {
      signatureRef.current.clear();
    }
  };

  const downloadPDF = async () => {
    if (!agreementRef.current) return;
  
    const buttons = document.getElementById("action-buttons");
    if (buttons) buttons.style.display = "none";
  
    setTimeout(async () => {
      window.scrollTo(0, 0); // Scroll to top to capture header
      const canvas = await html2canvas(agreementRef.current as HTMLElement, {
        scale: 3,
        useCORS: true,
        scrollY: -window.scrollY, // Capture the header as well
        windowWidth: document.documentElement.offsetWidth,
        windowHeight: agreementRef.current?.scrollHeight || 1000,
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
  
      if (buttons) buttons.style.display = "flex";
    }, 500);
  };
  

  const handleContinue = () => {
    router.push("/auth/kyc/page6");
  };
  

  return (
    <div className="flex flex-col items-center w-full min-h-screen py-8">
      <div className="flex flex-col w-full max-w-[900px]">
        <div
          className="bg-white shadow-lg rounded-lg p-6 md:p-12 text-gray-800 h-[75vh] overflow-y-auto scrollbar-hide"
          ref={agreementRef}
        >
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

          <h2 className="mt-4 md:mt-6 text-lg md:text-2xl font-bold text-center">
            AGREEMENT BETWEEN ASTROLOGER AND SOBHAGYA APP
          </h2>

          {[{ title: "1. Confidentiality", content: ["Not share any details, including user information, pricing structures, or confidential business information of the Company, with any third party.", "Maintain the confidentiality of the Company's proprietary information during the term of this Agreement and after its termination."] },
            { title: "2. Exit Notice and Payment", content: ["The Astrologer agrees to provide a written notice to the Company at least 15 days prior to their intended date of exit.", "Upon exit, the payment for the Astrologer's work will be processed and credited within 45 days from the date of exit."] },
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
            }]
            .map((section, index) => (
            <div key={index} className="mt-6 md:mt-8">
              <h2 className="text-base md:text-xl font-bold">{section.title}</h2>
              <ul className="mt-2 md:mt-3 space-y-2 md:space-y-3 text-sm md:text-base text-gray-700 leading-relaxed">
                {section.content.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>
          ))}

          <div className="mt-10 text-sm md:text-lg font-semibold">
            <h2 className="text-base md:text-xl font-bold">5. Signatures</h2>
            <p className="mt-2 md:mt-3 font-medium">
              By signing this Agreement, both parties agree to abide by the terms and conditions set forth herein.
            </p>
          </div>

          <div className="flex flex-col md:flex-row justify-between mt-6 md:mt-8 text-sm md:text-lg font-semibold">
            <div className="w-full md:w-1/2">
              <p className="font-bold">For Sobhagya App:</p>
              <p className="mt-2">Name: Xyx</p>
              <p className="mt-1">Position: Manager</p>
              <p className="mt-1">Date: 10-Dec-2024</p>
              
            </div>

            <div className="w-full md:w-1/2 mt-4 md:mt-0 relative">
  <p className="font-bold">For Astrologer:</p>
  <p className="mt-2">Name: {astrologerData.name}</p>
  <p className="mt-1">Date: {astrologerData.date}</p>
  
  <div className="relative">
    <SignatureCanvas
      ref={signatureRef}
      penColor="black"
      canvasProps={{
        width: 300,
        height: 100,
        className: "border border-gray-300 rounded-lg mt-2"
      }}
    />
    {!signatureRef.current?.isEmpty() || (
      <span className="absolute top-1/2 left-1/2 text-gray-400 text-sm -translate-x-1/2 -translate-y-1/2 pointer-events-none">
        Sign Here
      </span>
    )}
  </div>
  
  <button onClick={clearSignature} className="text-blue-500 text-sm mt-2">
    Clear Signature
  </button>
</div>

          </div>
        </div>

        <div id="action-buttons" className="flex justify-between mt-6">
          <button onClick={downloadPDF} className="btn w-[48%] bg-[#FFCD66] text-white font-bold">Download Agreement</button>
          <button onClick={handleContinue} className="btn w-[48%] bg-[#FFCD66] text-white font-bold">Continue</button>
        </div>
      </div>
    </div>
  );
};

export default AgreementComponent;
