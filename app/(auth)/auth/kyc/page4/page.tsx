import React from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
// import Step1 from '@/components/kyc/component-kyc-adhaar';
import Step4 from '@/components/kyc/component-kyc-bank';

const KYC = () => {
    return (
        <div 
        className="
        flex
        flex-col
        min-h-screen
        items-center
        justify-center
        bg-white
        px-6
        py-10
        sm:px-16
        mt-8      /* Apply margin-top 6px by default */
        sm:mt-0   /* Remove or override margin-top on small screens (≥640px) */
        md:-mt-8
        relative
        overflow-hidden
      "
            style={{
                backgroundImage: "url('/assets/images/Group-1.svg')",
                backgroundPosition: "right bottom",
                backgroundRepeat: "no-repeat",
                backgroundSize: "20%",
            }}
        >
            <div className="relative flex flex-col w-full max-w-[667px] items-center justify-center gap-6 px-4 pb-16 pt-6 sm:px-6 flex-grow">
                <div className="w-full max-w-[440px] lg:mt-16 flex flex-col items-center justify-center transform translate-y-[-10%]">
                    <div className="mb-4 text-center"> 
                        <h1 className="text-xl font-extrabold font-inter">Sobhagya Registration</h1>
                    </div>
                    <Step4 />
                </div>
            </div>

            {/* Footer - Now Always Sticks to the Bottom on Mobile */}
            <p className="absolute bottom-10 left-0 w-full text-center text-[10px] dark:text-white md:text-xs md:bottom-5 ">
                © {new Date().getFullYear()}. Elysion Softwares All Rights Reserved.
            </p>
        </div>
    );
}

export default KYC;
