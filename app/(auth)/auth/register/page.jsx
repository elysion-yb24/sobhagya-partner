"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import RegisterComponent1 from "@/components/register/register1";
import RegisterComponent2 from "@/components/register/register2";
import RegisterComponent3 from "@/components/register/register3";

const Register = () => {
  const [interviewStatus, setInterviewStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchInterviewStatus = async () => {
      try {
        const response = await fetch("/api/auth/register/astrologerStatus", {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch interview status");
        }

        const data = await response.json();
        // Example API Response:
        // {
        //   success: true,
        //   interviewStatus: "Pending" | "Interviewed" | "Rejected",
        //   isDetailsFilled: true | false
        // }

        // 1. If the API indicates details aren't filled, redirect immediately
        if (data?.success && data.isDetailsFilled === false) {
          router.replace("/auth/cover-register/page3");
          return; // Prevent further processing
        }

        // 2. If we have a valid interviewStatus, store it
        if (data?.interviewStatus) {
          setInterviewStatus(data.interviewStatus);
        } else {
          setInterviewStatus("Pending"); // Default fallback
        }
      } catch (error) {
        // If any error occurs, default to "Pending"
        setInterviewStatus("Pending");
      } finally {
        setLoading(false);
      }
    };

    fetchInterviewStatus();
  }, [router]);

  // Show loading indicator or blank while fetching data
  if (loading) {
    return <p className="text-center"></p>;
  }

  // Render components based on interviewStatus
  if (interviewStatus === "Pending") {
    return <RegisterComponent1 />;
  } else if (interviewStatus === "Interviewed") {
    return <RegisterComponent2 />;
  } else if (interviewStatus === "Rejected") {
    return <RegisterComponent3 />;
  }

  // Fallback to "Pending" if none of the above
  return <RegisterComponent1 />;
};

export default Register;
