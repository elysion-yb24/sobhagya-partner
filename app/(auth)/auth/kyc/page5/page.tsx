import React from "react";
import AgreementComponent from "@/components/kyc/component-kyc-agreement"; // Importing correctly

const KYC = () => {
    return (
        <div
            className="min-h-screen bg-white relative overflow-hidden flex justify-center items-center px-6 py-10"
            style={{
                backgroundImage: "url('/assets/images/Group-1.svg')",
                backgroundPosition: "right bottom",
                backgroundRepeat: "no-repeat",
                backgroundSize: "20%",
            }}
        >
            <div className="w-full max-w-[800px] mx-auto">
                <AgreementComponent />
            </div>
        </div>
    );
};

export default KYC;
