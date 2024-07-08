import { Outlet } from 'react-router-dom';

const AuthLayout = () => {
  return (
    <div className="bg-[#0B0909] text-white min-h-screen w-full flex items-center justify-center">
      <Outlet />
    </div>
  );
};

export default AuthLayout;
