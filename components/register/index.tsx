'use client'

import { useState } from 'react';
import { useSelector } from 'react-redux';
import Image from "next/image";
import Swal from 'sweetalert2';
import Link from 'next/link';

function RegisterComponent() {
    const [screen,setScreen]=useState('sendOtp');
    const [phone,setPhone]=useState('');
    const [userData,setUserData]= useState({name:"vishwas",status:"Clear",vcp:100,acp:200})
    const dataString:any ={
        Clear:"Congratulations! Your Interview is Completed – Welcome to the Sobhagya Family! Please Complete the Pending Documentation to Begin Your Journey as an Astrologer."

    }
    const handleSubmit = async (e:any) => {
        return true
    }
    return  (
        <div
            className="w-full m-auto min-h-screen flex items-center relative overflow-hidden"
            style={{
                backgroundImage: `
                url('/assets/images/circle.png')`,
                backgroundPosition: "bottom right",
                backgroundRepeat: "no-repeat, no-repeat",
                backgroundSize: " 15%, cover", // Adjust each size accordingly
            }}
        >
            {/* Flex container to hold logo and form side by side */}
            <div className="flex w-full justify-between relative">
                {/* Left side: Logo */}
                <div className="flex-shrink-0 max-w-[50%] ml-[15%] -mt-20">
                    <Image className="ml-[10%]"
                        src="/assets/images/monk-logo.png" // Path to your logo image
                        alt="Logo"
                        width={250}
                        height={100}
                        priority
                    />
                    <div className='flex items-center'>
                        <p className="text-black text-3xl font-inter font-bold pb-2">
                            Namaste {userData.name}
                        </p>
                        <div className="ml-3">
                            <Image
                                src="/assets/images/WavingHand.png" // Path to your image
                                alt="Logo"
                                width={40} // Matches the font size of the text (text-3xl)
                                height={40} // Matches the font size of the text
                                priority
                            />
                        </div>
                    </div>
                    <div className="bg-[#F5BC1C1A] font-inter font-bold w-[60%] h-auto min-h-[200px] border border-black rounded-lg p-6 mt-4">
                        <div className="mb-5 flex gap-10">
                            <span className="font-extrabold text-xl">Interview Status:</span> 
                            <span className="text-black font-extrabold text-lg">{userData.status}</span>
                        </div>
                        <div className="mb-5 flex gap-10">
                            <span className="font-extrabold text-xl">Video Call Price:</span> 
                            <span className="text-black font-extrabold text-lg">{userData.vcp}</span>
                        </div>
                        <div className="mb-5 flex gap-10">
                            <span className="font-extrabold text-xl">Audio Call Price:</span> 
                            <span className="text-black font-extrabold text-lg">{userData.acp}</span>
                        </div>
                    </div>
                    <div className='font-inter w-[60%]  my-5 '>{dataString[userData.status]}</div>
                    <div className="flex justify-start"> {/* Ensure flex starts content from the left */}
                        <Link href="/auth/kyc">
                            <button
                                type="button"
                                className="btn w-[200%]  text-white font-inter bg-[#FFCD66]"
                            >
                                Do Kyc
                            </button>
                        </Link>
                    </div>   
                </div>

                {/* Right side: Form */}
                <div className="w-full max-w-[50%] ml-6 mx-[10%]">
                    <Image
                            src="/assets/images/You.png" // Path to your image
                            alt="Logo"
                            width={500} // Matches the font size of the text (text-3xl)
                            height={400} // Matches the font size of the text
                            priority
                    />
                                            
                        
                </div>
            </div>
        </div>
    );
}

export default RegisterComponent;

