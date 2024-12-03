'use client'

import { get, LoginSendOtp } from "@/utils";
import Image from "next/image";
import { useState } from "react";
import Swal from 'sweetalert2';

function SendOtpComponent({ setScreen, setPhone }) {
    const [isChecked, setIsChecked] = useState(true);
    const Toast = Swal.mixin({
        toast: true,
        position: 'top',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
    })
    const handleSubmit = async (e) => {

        try {
            e.preventDefault();
            const regex = new RegExp("^[6-9]\\d{9}$");
            const phoneNumber = e.target[0].value

            if (!regex.test(phoneNumber)) {
                Toast.fire({
                    icon: 'error',
                    title: 'Invalid Mobile Number'
                })
                setPhone('');
                e.target.reset();
                return;
            }

            //check if user exists or not
            const existingData = await get(`/auth/check-if-exist?phone=${phoneNumber}`);
            if (existingData?.data) {
                if(existingData?.data?.isExist==false){
                    Toast.fire({
                        icon:'error',
                        title:"You are not authorized to login"
                    })
                    e.target.reset();
                    return
                }
            }else {
                throw new Error("Internal Server Error");
            }

            const res = await LoginSendOtp("/auth/signup-login/send-otp", { phone: phoneNumber });
            if (res?.success) {
                Toast.fire({
                    icon: 'success',
                    title: res?.message
                })
                setPhone(phoneNumber);
                setScreen('verifyOtp');
            }
            else {
                Toast.fire({
                    icon: 'error',
                    title: res?.message
                })
                e.target.reset();
                setPhone('');
            }
        } catch (err) {
            Toast.fire({
                icon:'info',
                title:"Something went wrong"
            })
        }

        return;
    }
    return (
        <div className="max-w-[400px] m-auto min-h-screen flex justify-center items-center">
            <div>
                <Image src={'/assets/images/sobhagya-send-otp.png'} width={400} height={200} alt="logo" priority />
                <h1 className="text-3xl font-semibold my-4">Login</h1>
                <form onSubmit={handleSubmit}>
                    <input type="tel" placeholder="Enter Mobile Number here" className="form-input" required />
                    <label className="flex items-center cursor-pointer my-4">
                        <input type="checkbox" className="form-checkbox" defaultChecked onChange={(e) => {
                            setIsChecked(e.target.checked)
                        }} />
                        <span className=" text-white-dark">By clicking ,you are agreeing to our Privacy Policy & Terms of Service</span>
                    </label>
                    <button type="submit" className="btn btn-primary my-2 w-full" disabled={!isChecked}>
                        Continue
                    </button>
                </form>
            </div>
        </div>
    );
}

export default SendOtpComponent;