import RegisterComponent from '@/components/register/index';
import React from 'react';
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation';

const Register=()=>{
    return <RegisterComponent/>
}
export default Register; 