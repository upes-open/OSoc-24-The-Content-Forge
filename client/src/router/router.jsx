import { createBrowserRouter } from 'react-router-dom';
import AuthLayout from '../_auth/AuthLayout';
import ErrorPage from '../errorElement';
import Register from '../_auth/forms/Register';
import Login from '../_auth/forms/Login';
import App from '../App.jsx';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
  },
  {
    element: <AuthLayout />,
    errorElement: <ErrorPage />,
    children: [
      {
        path: '/register',
        element: <Register />,
      },
      {
        path: '/login',
        element: <Login />,
      },
    ],
  },
]);
