import ComponentsAuthRegisterForm from '@/components/auth/components-auth-register-form';
import LanguageDropdown from '@/components/language-dropdown';
import { Metadata } from 'next';
import Link from 'next/link';
import React, { useState } from 'react';
import Image from "next/image";
import Step3Form from '@/components/auth/cover-register/components-auth-register-page3';

export const metadata: Metadata = {
    title: 'Register Cover',
};

const CoverRegister = () => {
    
    return (
        <div 
        className="flex min-h-screen items-center justify-center bg-white px-6 sm:px-16 relative overflow-scroll"
        style={{
            backgroundImage: "url('/assets/images/Group-1.svg')", // Background image path
            backgroundPosition: "right bottom 5%", // Adjust position
            backgroundRepeat: "no-repeat", // Prevent tiling
            backgroundSize: "20%", // Adjust size as needed (e.g., 15%)
        }}>
            <div className="relative flex w-full max-w-[667px] flex-col items-center justify-center gap-6 px-4 pb-16 mt-16 sm:px-6">
            <div className="w-full max-w-[440px] lg:mt-16 flex flex-col items-center justify-center transform translate-y-[-10%]">
                <div className="mb-4 text-center"> 
                    <h1 className="text-xl font-extrabold font-inter mt-10 md:-mt-8">Sobhagya Registration</h1>
                </div>
                <Step3Form />
            </div>
                {/* <p className="absolute bottom-0 w-full text-center dark:text-white">
                    © {new Date().getFullYear()}. Elysion Softwares All Rights Reserved.
                </p> */}
            </div>
        </div>
    );
};

export default CoverRegister;
