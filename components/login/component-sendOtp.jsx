'use client'

import { get, LoginSendOtp } from "@/utils";
import Image from "next/image";
import { useState } from "react";
import Swal from 'sweetalert2';
import Link from 'next/link';

function SendOtpComponent({ setScreen, setPhone }) {
    const [isChecked, setIsChecked] = useState(true);
    const Toast = Swal.mixin({
        toast: true,
        position: 'top',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
    });

    const handleSubmit = async (e) => {
        try {
            e.preventDefault();
            const regex = new RegExp("^[6-9]\\d{9}$");
            const phoneNumber = e.target[0].value;

            if (!regex.test(phoneNumber)) {
                Toast.fire({
                    icon: 'error',
                    title: 'Invalid Mobile Number'
                });
                setPhone('');
                e.target.reset();
                return;
            }

            // Check if user exists or not
            const existingData = await get(`/auth/check-if-exist?phone=${phoneNumber}`);
            if (existingData?.data) {
                if (existingData?.data?.isExist == false) {
                    Toast.fire({
                        icon: 'error',
                        title: "You are not authorized to login"
                    });
                    e.target.reset();
                    return;
                }
            } else {
                throw new Error("Internal Server Error");
            }

            const res = await LoginSendOtp("/auth/signup-login/send-otp", { phone: phoneNumber });
            if (res?.success) {
                Toast.fire({
                    icon: 'success',
                    title: res?.message
                });
                setPhone(phoneNumber);
                setScreen('verifyOtp');
            } else {
                Toast.fire({
                    icon: 'error',
                    title: res?.message
                });
                e.target.reset();
                setPhone('');
            }
        } catch (err) {
            Toast.fire({
                icon: 'info',
                title: "Something went wrong"
            });
        }

        return;
    };

    return (
        <div
            className="w-full m-auto min-h-screen flex items-center relative overflow-hidden"
            style={{
                backgroundImage: `
                url('/assets/images/Group-8.png'), 
                url('/assets/images/circle.png')`,
                backgroundPosition: "bottom left, bottom right",
                backgroundRepeat: "no-repeat, no-repeat",
                backgroundSize: "65%, 15%, cover", // Adjust each size accordingly
            }}
        >
            {/* Flex container to hold logo and form side by side */}
            <div className="flex w-full justify-between relative">
                {/* Left side: Logo */}
                <div className="flex-shrink-0 max-w-[30%] ml-[15%] -mt-20">
                    <Image className="ml-[10%]"
                        src="/assets/images/monk-logo.png" // Path to your logo image
                        alt="Logo"
                        width={300}
                        height={100}
                        priority
                    />
                    <p className="text-black text-4xl font-inter font-bold pb-2">
                        Welcome to Sobhagya
                    </p>
                    <p className="text-black text-2xl font-inter font font-semibold tracking-[-0.06em]">
                        India's emerging astrology app. Guiding your destiny is our Sobhagya!
                    </p>
                </div>

                {/* Right side: Form */}
                <div className="w-full max-w-[25%] ml-6 mx-[10%]">
                    <h1 className="text-4xl my-[5%] text-black font-inter font-bold">Happy to see you again!</h1>
                    <form onSubmit={handleSubmit}>
                        <label className="font-inter text-[#5B5B5B] font-inter">
                            Sign In
                        </label>
                        <input
                            type="tel"
                            placeholder="Enter your Phone Number"
                            className="form-input  border-black focus:ring-0 focus:border-black" // Black border and no ring
                            required
                        />
                        <label className="flex items-center cursor-pointer my-4">
                            <input
                                type="checkbox"
                                className="form-checkbox text-black bg-white border-black checked:bg-black checked:border-black focus:outline-none"
                                defaultChecked
                                onChange={(e) => setIsChecked(e.target.checked)}
                            />
                            <span className="text-[#5B5B5B] font-inter">
                                By clicking, you are agreeing to our Privacy Policy & Terms of Service
                            </span>
                        </label>
                        <button
                            type="submit"
                            className="btn  my-2 w-full bg-black text-white hover:bg-gray-800 border-2 border-black focus:outline-none font-inter focus:ring-0 focus:border-black"
                            disabled={!isChecked}
                        >
                            Sign In
                        </button>
                        <div className="font-inter justify-center flex">
                            OR
                        </div>                        
                        <Link href="/auth/cover-register"> {/* Replace with the target route */}
                            <button
                                type="button" // Prevent form submission
                                className="btn  my-2 w-full bg-white text-black hover:bg-white-800  font-inter border-black focus:outline-none focus:ring-0 focus:border-black"
                                disabled={!isChecked}
                            >
                                Astrologer Registration
                            </button>
                        </Link>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default SendOtpComponent;
