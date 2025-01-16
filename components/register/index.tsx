'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

function RegisterComponent() {
    const [userData, setUserData] = useState({
        name: 'Vishwas',
        status: 'Pending',
        vcp: 'Not Decided',
        acp: 'Not Decided',
    });

    const dataString: any = {
        Pending:
            'We are in the process of scheduling your telephonic interview as part of the onboarding process...',
    };

    return (
        <div
            className="w-full m-auto min-h-screen flex items-center relative overflow-hidden flex-col md:flex-row"
            style={{
                backgroundImage: `
                url('/assets/images/circle.png')`,
                backgroundPosition: 'bottom right',
                backgroundRepeat: 'no-repeat, no-repeat',
                backgroundSize: '15%, cover',
            }}
        >
            {/* Left Section */}
            <div className="flex-shrink-0 w-full md:max-w-[50%] flex flex-col items-center md:items-start text-center md:text-left ml-0 md:ml-[15%] -mt-0 md:-mt-20 px-4">
                {/* Logo */}
                <Image
                    className="mx-auto md:ml-[10%]"
                    src="/assets/images/monk-logo.png"
                    alt="Logo"
                    width={200}
                    height={100}
                    priority
                />
                {/* Onboarding Text */}
                <p className="text-black text-2xl md:text-3xl font-inter font-bold my-4">
                    Onboarding in Progress...
                </p>
                {/* User Greeting */}
                <div className="flex items-center justify-center md:justify-start">
                    <p className="text-black text-3xl font-inter font-bold">
                        Namaste {userData.name}
                    </p>
                    <div className="ml-2">
                        <Image
                            src="/assets/images/WavingHand.png"
                            alt="Waving Hand"
                            width={30}
                            height={30}
                            priority
                        />
                    </div>
                </div>
                {/* Status Box */}
                <div className="bg-[#FFF9E6] font-inter font-bold w-full md:w-[70%] h-auto min-h-[150px] border border-gray-300 rounded-lg p-4 mt-4 shadow-sm">
                    <div className="flex justify-between mb-3">
                        <span className="font-extrabold text-base md:text-xl">Interview Status:</span>
                        <span className="text-black font-medium text-base md:text-lg">{userData.status}</span>
                    </div>
                    <div className="flex justify-between mb-3">
                        <span className="font-extrabold text-base md:text-xl">Video Call Price:</span>
                        <span className="text-black font-medium text-base md:text-lg">{userData.vcp}</span>
                    </div>
                    <div className="flex justify-between mb-3">
                        <span className="font-extrabold text-base md:text-xl">Audio Call Price:</span>
                        <span className="text-black font-medium text-base md:text-lg">{userData.acp}</span>
                    </div>
                </div>
                {/* Information Text */}
                <div className="font-inter w-full md:w-[70%] my-4 text-sm md:text-base text-center md:text-left">
                    {dataString[userData.status]}{' '}
                    <span className="text-gray-500 cursor-pointer">Read More</span>
                </div>
                {/* Button */}
                <div className="flex justify-center md:justify-start w-full">
                    <Link href="/auth/kyc">
                        <button
                            type="button"
                            className="btn mx-auto text-white font-inter  bg-[#FFCD66] my-5 px-20"
                        >
                            DO KYC
                        </button>
                    </Link>
                </div>
            </div>

            {/* Right Section (hidden on mobile) */}
            <div className="hidden md:block w-full max-w-[50%] ml-6 mx-[10%]">
                <Image
                    src="/assets/images/You.png"
                    alt="Illustration"
                    width={500}
                    height={400}
                    priority
                />
            </div>
        </div>
    );
}

export default RegisterComponent;
