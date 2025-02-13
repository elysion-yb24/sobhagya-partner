"use client";

import React, { useEffect, useState } from "react";
import RegisterComponent1 from "@/components/register/register1";
import RegisterComponent2 from "@/components/register/register2";
import RegisterComponent3 from "@/components/register/register3";
import { useRouter } from "next/navigation";

const Register = () => {
  const [interviewStatus, setInterviewStatus] = useState(null); // No default status
  const [loading, setLoading] = useState(true); // Loading state
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
        

        if (data?.interviewStatus) {
         
          setInterviewStatus(data.interviewStatus);
        } else {
          
          setInterviewStatus("Pending"); // Default if response is empty
        }
      } catch (error) {
        
        setInterviewStatus("Pending"); // Default on error
      } finally {
        setLoading(false); // Stop loading
      }
    };

    fetchInterviewStatus();
  }, []);

  // Wait for API response before rendering
  if (loading) {
    return <p className="text-center"></p>;
  }

 

  if (interviewStatus === "Pending") {
    return <RegisterComponent1 />;
  } else if (interviewStatus === "Interviewed") {
    return <RegisterComponent2 />;
  } else if (interviewStatus === "Rejected") {
    return <RegisterComponent3 />;
  }

  return <RegisterComponent1 />; // Fallback to Pending component
};

export default Register;
