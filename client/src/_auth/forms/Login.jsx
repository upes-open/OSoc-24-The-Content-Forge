import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router-dom';
import {
  getAuth,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithCustomToken,
} from 'firebase/auth';
import axios from 'axios';
import Cookies from 'js-cookie';
import { initializeApp } from 'firebase/app';

const firebaseConfig = {
  apiKey: 'AIzaSyBQ9G0cDaPjPWBaP50UErRQa78XXI0PtiY',
  authDomain: 'thecontenthub-34cc3.firebaseapp.com',
  projectId: 'thecontenthub-34cc3',
  storageBucket: 'thecontenthub-34cc3.appspot.com',
  messagingSenderId: '819354162885',
  appId: '1:819354162885:web:ae687c82231f9d758302ac',
  measurementId: 'G-0YVJ4S0RW6',
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const schema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
  password: z
    .string()
    .min(8, { message: 'Password must be at least 8 characters long' }),
});

const Login = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
  });

  const handleEmailPasswordLogin = async (data) => {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        data.email,
        data.password
      );
      const idToken = await userCredential.user.getIdToken();

      Cookies.set('idToken', idToken, { expires: 7 }); // Expires in 7 days

      // Handle successful login
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('Backend login failed:', error.response?.data);
      } else {
        console.error('Firebase login error:', error.message);
      }
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const idToken = await result.user.getIdToken();

      Cookies.set('idToken', idToken, { expires: 7 });

      // Handle successful login
    } catch (error) {
      console.error('Google sign-in error:', error.message);
      setError(error.message);
    }
  };

  const onSubmit = (data) => {
    console.log(data);
  };

  return (
    <div className="w-screen min-h-screen bg-[#09090b] text-white flex items-center justify-center fixed">
      <div className="border-[#27272a] border rounded-md p-8 flex flex-col lg:w-[450px] space-y-3 w-full mx-4">
        <p className="font-bold text-2xl">Login</p>
        <i className="text-[#a1a1aa]">
          Don't have an account?{' '}
          <Link to="/register" className="text-blue-400">
            Register
          </Link>{' '}
        </i>
        <form
          onSubmit={handleSubmit(handleEmailPasswordLogin)}
          className="flex flex-col w-full gap-2"
        >
          <div>
            <p className="">Email</p>
            <input
              type="email"
              {...register('email')}
              className="w-full bg-transparent border border-[#27272a] rounded-md py-3 px-2 outline-none focus:border-white transition-all"
              placeholder="abc@example.com"
            />
            {errors.email && (
              <p className="text-red-500 text-sm">{errors.email.message}</p>
            )}
          </div>

          <div>
            <p className="">Password</p>
            <input
              type="password"
              {...register('password')}
              className="w-full bg-transparent border border-[#27272a] rounded-md py-3 px-2 outline-none focus:border-white transition-all"
              placeholder="********"
            />
            {errors.password && (
              <p className="text-red-500 text-sm">{errors.password.message}</p>
            )}
          </div>

          <button
            type="submit"
            className="w-full mt-3 bg-white hover:bg-[#E2E2E2] text-black py-2 px-4 rounded transition-all"
          >
            Login
          </button>
        </form>
        <button
          onClick={handleGoogleLogin}
          className="w-full mt-3 bg-none border border-[#27272a] hover:bg-[#27272A] text-white py-2 px-4 rounded transition-all"
        >
          Login with Google
        </button>
      </div>
    </div>
  );
};

export default Login;
