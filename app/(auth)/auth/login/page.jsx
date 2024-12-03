import LoginComponent from '@/components/login/index';
import React from 'react';
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation';

const Login=()=>{
    const token=cookies().get('token');
    const access_token=cookies().get('access_token');

    if(token && access_token){
        if(access_token.value!="null") redirect('/');
    }
    return <LoginComponent/>
}
export default Login; 