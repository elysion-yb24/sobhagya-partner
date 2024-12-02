'use client'

import Lottie from "lottie-react";
import phoneOtpAnimation from "./phoneOtp.json";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";
import { LoginSendOtp, LoginVerifyOtp } from "@/utils";
import dynamic from "next/dynamic";
import { useTimeouts } from "yet-another-react-lightbox";
import { useTimer } from "react-timer-hook";
const OTPInput = dynamic(() => import("react-otp-input"), { ssr: false });
function VerifyOtpComponent({phone}) {
    const [disable,setDisable]=useState(false);
    const time = new Date();
    const {
        seconds,
        isRunning,
        start,
        restart
    }=useTimer({expiryTimestamp:time.setSeconds(time.getSeconds()+30),autoStart:false})
    const router=useRouter();
    
    const Toast=Swal.mixin({
        toast: true,
        position: 'top',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
    })
    const [otp, setOtp] = useState('');
    const handleSubmit=async(e)=>{
        e.preventDefault();
        const res=await LoginVerifyOtp("/auth/signup-login/verify-otp",{phone:phone,otp:otp,notifyToken:'web-login'})

        if(res?.success){
            Toast.fire({
                icon: 'success',
                title: res?.message
            })
            router.replace('/');
            router.refresh()
        }
        else{
            Toast.fire({
                icon: 'error',
                title: res?.message
            })
            e.target.reset();
        }
        
        return;

    }

    const handleResendOtp=async()=>{
        try{
            setDisable(true);
            const res=await LoginSendOtp("/auth/signup-login/send-otp",{phone});
            if(res?.success){
                Toast.fire({
                    icon: 'success',
                    title: 'OTP resent successfully'
                })
                const time = new Date();
                time.setSeconds(time.getSeconds() + 30);
                restart(time)
            }
            else{
                Toast.fire({
                    icon: 'error',
                    title: res?.message
                })
            }
        }catch(err){
            console.log(err);
            Toast.fire({
                icon: 'error',
                title: 'Something went wrong'
            })
        }finally{
            setDisable(false);
        }
        
        
        return;
    }
    useEffect(()=>{
        const time = new Date();
        time.setSeconds(time.getSeconds() + 30);
        start(time);
    },[])
    return (
        <div className="max-w-[400px] m-auto min-h-screen flex justify-center items-center">
            <div>
            <Lottie animationData={phoneOtpAnimation}/>
            <h1 className="text-lg font-semibold my-4">Enter OTP send on {phone}</h1>
            <form onSubmit={handleSubmit}>
                <OTPInput
                    value={otp}
                    onChange={setOtp}
                    numInputs={4}
                    renderSeparator={<span className="px-2">-</span>}
                    renderInput={(props) => <input {...props} className="w-1/4 h-14  border border-gray-300 rounded text-center font-bold text-lg"/>}
                    shouldAutoFocus
                    skipDefaultStyles
                />
                {isRunning
                ?
                <div className="my-4 text-sm">Resend Otp in {seconds} secs</div>
                :
                <div className="my-4 text-sm text-blue-500 font-bold cursor-pointer" onClick={handleResendOtp} disabled={disable}>Resend Now</div>
                }
                <button type="submit" className="btn btn-primary my-8 w-full" disabled={!otp ||otp.length!=4}>
                    Verify Otp
                </button>
            </form>
            </div>
        </div>
    );
}

export default VerifyOtpComponent;