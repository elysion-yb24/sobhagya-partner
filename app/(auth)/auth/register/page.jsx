"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import RegisterComponent1 from "@/components/register/register1";
import RegisterComponent2 from "@/components/register/register2";
import RegisterComponent3 from "@/components/register/register3";
import RegisterComponent4 from "@/components/register/register4";
import RegisterComponent5 from "@/components/register/register5"; // Import RegisterComponent5

const Register = () => {
  // const [interviewStatus, setInterviewStatus] = useState(null);  // ✅ Removed TypeScript type here
  const [leadStatus, setLeadStatus] = useState(null);  // ✅ Removed TypeScript type here
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchAstrologerStatus = async () => {
      try {
        const response = await fetch("/api/auth/register/astrologerStatus", {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch astrologer status");
        }

        const data = await response.json();

        // Redirect if details aren't filled
        if (data?.success && data.isDetailsFilled === false) {
          router.replace("/auth/cover-register/page3");
          return;
        }

        // Store interviewStatus and leadStatus
        // setInterviewStatus(data?.interviewStatus || "Pending");
        setLeadStatus(data?.leadStatus || "NotOnboarded");

        console.log(data.leadStatus);
        console.log(data.interviewStatus);

      } catch (error) {
        console.error("Error fetching astrologer status:", error);
        // setInterviewStatus("Pending");
        setLeadStatus("NotOnboarded");
      } finally {
        setLoading(false);
      }
    };

    fetchAstrologerStatus();
  }, [router]);

  // Show loading indicator while fetching data
  if (loading) {
    return <p className="text-center"></p>;
  }

  // Render RegisterComponent5 if leadStatus is "Onboarded"
  if (leadStatus === "onboarded") {
    return <RegisterComponent5 />;
  }

  // Render components based on interviewStatus
  // if (interviewStatus === "Pending") {
  //   return <RegisterComponent1 />;
  // } else if (interviewStatus === "Clear") {
    return <RegisterComponent2 />;
  // } else if (interviewStatus === "Rejected") {
  //   return <RegisterComponent3 />;
  // } else if (interviewStatus === "Scheduled") {
  //   return <RegisterComponent4 />;
  // }

  // Default fallback
  // return <RegisterComponent1 />;
};

export default Register;
