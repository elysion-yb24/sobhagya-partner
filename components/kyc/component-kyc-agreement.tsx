"use client";

import React, { useState, useEffect, useRef } from "react";
import SignatureCanvas from "react-signature-canvas";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { useRouter } from "next/navigation";

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
  const buttonsRef = useRef<HTMLDivElement | null>(null);
  const clearBtnRef = useRef<HTMLButtonElement | null>(null);

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
    signatureRef.current?.clear();
  };

  const generatePdf = async () => {
    if (!agreementRef.current) return;

    // Hide action buttons and Clear Signature before capturing
    if (buttonsRef.current) buttonsRef.current.style.display = "none";
    if (clearBtnRef.current) clearBtnRef.current.style.display = "none";

    // Temporarily remove fixed height so html2canvas captures all content
    const agreementElem = agreementRef.current;
    const previousHeight = agreementElem.style.height;
    agreementElem.style.height = "auto";

    try {
      // Allow reflow
      window.scrollTo(0, 0);
      await new Promise((resolve) => setTimeout(resolve, 300));

      // Capture the entire content (including signature)
      const canvas = await html2canvas(agreementElem, {
        scale: 2,
        useCORS: true,
      });

      // Create jsPDF and define margins
      const pdf = new jsPDF("p", "mm", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 10; // Adjust if needed
      const pdfWidth = pageWidth - margin * 2;
      const pdfHeight = pageHeight - margin * 2;

      const canvasWidth = canvas.width;
      const canvasHeight = canvas.height;

      // Scale factor to fit the canvas width into the PDF width
      const scale = pdfWidth / canvasWidth;
      // How many vertical canvas pixels we can place on one PDF page
      const sliceHeightInCanvasPx = pdfHeight / scale;

      let yPosition = 0;
      let pageCount = 0;

      // Slicing the canvas for multi-page
      while (yPosition < canvasHeight) {
        if (pageCount !== 0) {
          pdf.addPage();
        }

        // Create a temporary canvas for each slice
        const pageCanvas = document.createElement("canvas");
        pageCanvas.width = canvasWidth;
        pageCanvas.height = Math.min(
          sliceHeightInCanvasPx,
          canvasHeight - yPosition
        );

        const pageCtx = pageCanvas.getContext("2d");
        if (pageCtx) {
          pageCtx.drawImage(
            canvas,
            0,
            yPosition,
            canvasWidth,
            pageCanvas.height,
            0,
            0,
            canvasWidth,
            pageCanvas.height
          );
        }

        // Convert slice to PNG and add to PDF
        const pageData = pageCanvas.toDataURL("image/png");
        pdf.addImage(
          pageData,
          "PNG",
          margin,
          margin,
          pdfWidth,
          pageCanvas.height * scale
        );

        yPosition += sliceHeightInCanvasPx;
        pageCount++;
      }

      pdf.save("agreement.pdf");
    } catch (error) {
      console.error("Error generating PDF:", error);
    } finally {
      // Restore original height
      agreementElem.style.height = previousHeight;

      // Show action buttons and Clear Signature again
      if (buttonsRef.current) buttonsRef.current.style.display = "flex";
      if (clearBtnRef.current) clearBtnRef.current.style.display = "inline-block";
    }
  };

  const handleContinue = () => {
    router.push("/auth/kyc/page6");
  };

  return (
    <div className="flex flex-col items-center w-full min-h-screen py-8">
      <div className="flex flex-col w-full max-w-[900px]">
        {/* Agreement Content */}
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

          {/* Agreement Sections */}
          {[
            {
              title: "1. Confidentiality",
              content: [
                "Not share any details, including user information, pricing structures, or confidential business information.",
                "Maintain confidentiality during and after this Agreement.",
              ],
            },
            {
              title: "2. Exit Notice and Payment",
              content: [
                "Provide 15 days’ notice before exit.",
                "Payment processed within 45 days after exit.",
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

          {/* Signatures Section */}
          <div className="mt-10 text-sm md:text-lg font-semibold">
            <h2 className="text-base md:text-xl font-bold">5. Signatures</h2>
            <p className="mt-2 md:mt-3 font-medium">
              By signing this Agreement, both parties agree to abide by the terms.
            </p>
          </div>

          {/*
            In small screens: stacked (flex-col).
            In medium+ screens: side-by-side (flex-row).
          */}
          <div className="flex flex-col md:flex-row md:items-start md:space-x-6 mt-6 md:mt-8 text-sm md:text-lg font-semibold">
            {/* Astrologer Info */}
            <div className="mb-4 md:mb-0">
              <p className="font-bold">For Astrologer:</p>
              <p>Name: {astrologerData.name}</p>
              <p>Date: {astrologerData.date}</p>
            </div>

            {/* Signature Box */}
            <div>
              <SignatureCanvas
                ref={signatureRef}
                penColor="black"
                canvasProps={{
                  width: 300,
                  height: 100,
                  className: "border border-gray-300 rounded-lg mt-2",
                }}
              />
              <button
                ref={clearBtnRef}
                onClick={clearSignature}
                data-html2canvas-ignore="true"
                className="text-blue-500 text-sm mt-2"
              >
                Clear Signature
              </button>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div ref={buttonsRef} className="flex justify-between mt-6">
          <button
            onClick={generatePdf}
            className="btn w-[48%] bg-[#fec758] text-white font-bold"
          >
            Download Agreement
          </button>
          <button
            onClick={handleContinue}
            className="btn w-[48%] bg-[#fec758] text-white font-bold"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
};

export default AgreementComponent;
