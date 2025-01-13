import KYCRegisterForm from '@/components/kyc/index';
import React from 'react';
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation';

const KYC=()=>{
    return (
        <div 
        className="flex min-h-screen items-center justify-center bg-white px-6 py-10 sm:px-16 relative overflow-hidden"
        style={{
            backgroundImage: "url('/assets/images/Group-1.svg')", // Background image path
            backgroundPosition: "right bottom", // Adjust position
            backgroundRepeat: "no-repeat", // Prevent tiling
            backgroundSize: "20%", // Adjust size as needed (e.g., 15%)
        }}>
            <div className="relative flex w-full max-w-[667px] flex-col items-center justify-center gap-6 px-4 pb-16 pt-6 sm:px-6">
            <div className="w-full max-w-[440px] lg:mt-16 flex flex-col items-center justify-center transform translate-y-[-10%]">
                <div className="mb-4 text-center"> 
                    <h1 className="text-xl font-extrabold font-inter">Sobhagya Registration</h1>
                </div>
                <KYCRegisterForm/>
            </div>
                <p className="absolute bottom-20 w-full text-center dark:text-white">
                    © {new Date().getFullYear()}. Elysion Softwares All Rights Reserved.
                </p>
            </div>
        </div>
    );
}
export default KYC; 