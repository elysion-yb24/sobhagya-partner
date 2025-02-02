import RegisterComponent1 from '@/components/register/register1';
import React from 'react';
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation';

const Register=()=>{
    return <RegisterComponent1/>
}
export default Register;