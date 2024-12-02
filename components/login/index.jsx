'use client'
import SendOtpComponent from '@/components/login/component-sendOtp';
import VerifyOtpComponent from '@/components/login/component-verifyOtp'
import { useState } from 'react';
import { useSelector } from 'react-redux';
function LoginComponent() {
    const [screen,setScreen]=useState('sendOtp');
    const [phone,setPhone]=useState('');
    
    return (
        <div className='max-h-screen px-2'>
        {
            screen=='sendOtp' ? <SendOtpComponent setScreen={setScreen} setPhone={setPhone}/>
             :
            <VerifyOtpComponent phone={phone}/>
        }
        </div>
    );
}

export default LoginComponent;