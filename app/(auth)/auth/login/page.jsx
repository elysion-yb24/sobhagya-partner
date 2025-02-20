import LoginComponent from '@/components/login/index';
import React from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

const Login = () => {
  // Extract token from cookies
  const token = cookies().get('token');

  // Check if token exists and is not null
  if (token && token.value !== "null") {
    // Redirect to "/auth/register" if token exists
    redirect('/auth/register');
  }

  // Render the LoginComponent if no token is found
  return <LoginComponent />;
};

export default Login; 