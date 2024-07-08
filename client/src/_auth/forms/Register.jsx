import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router-dom';
import { initializeApp } from 'firebase/app';
import { useNavigate } from 'react-router-dom';
import { api } from '../../util/api';
import Cookies from 'js-cookie';
import {
  getAuth,
  setPersistence,
  browserLocalPersistence,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithCustomToken,
} from 'firebase/auth';

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
setPersistence(auth, browserLocalPersistence);

const schema = z
  .object({
    username: z.string().min(1, { message: 'Username is required' }),
    email: z.string().email({ message: 'Invalid email address' }),
    password: z
      .string()
      .min(8, { message: 'Password must be at least 8 characters long' }),
    confirmPassword: z.string().min(8, {
      message: 'Confirm Password must be at least 8 characters long',
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

const Register = () => {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
  });

  const handleEmailPasswordRegister = async (data) => {
    try {
      const userCredentials = await createUserWithEmailAndPassword(
        auth,
        data.email,
        data.password
      );
      const idToken = await userCredentials.user.getIdToken();

      const response = await api.post('/customRegister', {
        idToken,
        username: data.username,
        email: data.email,
        password: data.password,
        role: 'user',
      });

      // TODO: On success
      console.log(response);

      const newIdToken = await auth.currentUser.getIdToken();

      Cookies.set('idToken', newIdToken, { expires: 7 });
    } catch (err) {
      if (axios.isAxiosError(err)) {
        console.error('Backend registration failed:', err.response?.data);
      } else {
        console.error('Firebase registration error:', err.message);
      }
    }
  };

  const handleGoogleRegister = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const idToken = await result.user.getIdToken();

      const response = await api.post('/oauthRegister', {
        idToken,
        role: 'user',
      });

      // TODO: On Success
      console.log(response);

      const newIdToken = await auth.currentUser.getIdToken();

      Cookies.set('idToken', newIdToken, { expires: 7 });
    } catch (err) {
      if (axios.isAxiosError(err)) {
        console.error('Backend registration failed:', err.response?.data);
      } else {
        console.error('Google sign-in error:', err.message);
      }
    }
  };

  const onSubmit = (data) => {
    // console.log(data);
  };

  return (
    <div className="w-screen min-h-screen bg-[#09090b] text-white flex items-center justify-center fixed">
      <div className="border-[#27272a] border rounded-md p-8 flex flex-col lg:w-[450px] space-y-3 w-full mx-4">
        <p className="font-bold text-2xl">Register</p>
        <i className="text-[#a1a1aa]">
          Already have and account?{' '}
          <Link to="/login" className="text-blue-400">
            Login
          </Link>{' '}
        </i>
        <form
          onSubmit={handleSubmit(handleEmailPasswordRegister)}
          className="flex flex-col w-full gap-2"
        >
          <div>
            <p className="">Username</p>
            <input
              type="text"
              {...register('username')}
              className="w-full bg-transparent border border-[#27272a] rounded-md py-3 px-2 outline-none focus:border-white transition-all"
              placeholder="abc"
            />
            {errors.username && (
              <p className="text-red-500 text-sm">{errors.username.message}</p>
            )}
          </div>
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
          <div>
            <p className="">Confirm Password</p>
            <input
              type="password"
              {...register('confirmPassword')}
              className="w-full bg-transparent border border-[#27272a] rounded-md py-3 px-2 outline-none focus:border-white transition-all"
              placeholder="********"
            />
            {errors.confirmPassword && (
              <p className="text-red-500 text-sm">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>
          <button
            type="submit"
            className="w-full mt-3 bg-white hover:bg-[#E2E2E2] text-black py-2 px-4 rounded transition-all"
          >
            Register
          </button>
        </form>
        <button
          onClick={handleGoogleRegister}
          className="w-full mt-3 bg-none border border-[#27272a] hover:bg-[#27272A] text-white py-2 px-4 rounded transition-all"
        >
          Register with Google
        </button>
      </div>
    </div>
  );
};

export default Register;
