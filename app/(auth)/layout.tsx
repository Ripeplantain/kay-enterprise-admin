import React from "react";
import { GalleryVerticalEnd } from "lucide-react";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="h-screen grid lg:grid-cols-5">
      <div className="flex flex-col lg:col-span-3 bg-white">
        <div className="flex flex-1 items-center justify-center px-8 md:px-12">
          <div className="w-full max-w-md">{children}</div>
        </div>
      </div>
      
      <div className="relative hidden lg:flex flex-col items-center justify-center bg-gradient-to-br from-blue-800 via-blue-900 to-slate-900 lg:col-span-2">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 32 32%27 width=%2732%27 height=%2732%27 fill=%27none%27 stroke=%27rgb(148 163 184 / 0.05)%27%3e%3cpath d=%27m0 .5 32 0M.5 0v32%27/%3e%3c/svg%3e')]" />
        
        <div className="relative z-10 text-center px-6">
          <div className="flex flex-col items-center mb-6">
            <div className="bg-white/10 backdrop-blur-sm text-white flex w-14 h-14 items-center justify-center rounded-xl shadow-lg border border-white/20 mb-3">
              <GalleryVerticalEnd className="w-7 h-7" />
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              KayEnterprise Admin
            </h2>
          </div>
          
          <div className="max-w-xs mx-auto">
            <h1 className="text-2xl font-bold text-white leading-tight mb-3">
              Admin Portal Access
            </h1>
            <p className="text-blue-100 mb-4">
              Please log in with your administrator credentials to continue.
            </p>
            <p className="text-xs text-blue-200/80 bg-blue-900/30 rounded-lg px-3 py-2 border border-blue-700/50">
              🔒 Unauthorized access is prohibited. All activity is monitored.
            </p>
          </div>
        </div>
        
        <div className="absolute top-8 right-8 w-16 h-16 bg-white/5 rounded-full blur-lg"></div>
        <div className="absolute bottom-12 left-12 w-24 h-24 bg-blue-600/10 rounded-full blur-xl"></div>
      </div>
    </div>
  );
};

export default Layout;