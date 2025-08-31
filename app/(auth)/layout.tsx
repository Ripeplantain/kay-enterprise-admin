import React from "react";
import { GalleryVerticalEnd } from "lucide-react";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="h-screen grid lg:grid-cols-5 font-sans">
      {/* Left: Auth Form Section */}
      <div className="flex flex-col lg:col-span-3 bg-white">
        <div className="flex flex-1 items-center justify-center px-6 md:px-10 lg:px-16">
          <div className="w-full max-w-md">
            {children}
          </div>
        </div>
      </div>

      {/* Right: Branding / Hero Section */}
      <div className="relative hidden lg:flex flex-col items-center justify-center bg-gradient-to-br from-blue-800 via-blue-900 to-slate-900 lg:col-span-2 overflow-hidden">
        {/* Background grid pattern */}
        <div className="absolute inset-0 opacity-40 bg-[url('data:image/svg+xml,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 32 32%27 width=%2732%27 height=%2732%27 fill=%27none%27 stroke=%27rgb(148 163 184 / 0.08)%27%3e%3cpath d=%27m0 .5 32 0M.5 0v32%27/%3e%3c/svg%3e')]"></div>

        {/* Content */}
        <div className="relative z-10 text-center px-8 max-w-sm">
          {/* Logo + Title */}
          <div className="flex flex-col items-center mb-8">
            <div className="bg-white/10 backdrop-blur-md text-white flex w-16 h-16 items-center justify-center rounded-2xl shadow-xl border border-white/20 mb-4">
              <GalleryVerticalEnd className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-semibold text-white tracking-tight">
              Kay Express Admin
            </h2>
            <p className="text-sm text-blue-200 mt-1">
              Secure Admin Portal
            </p>
          </div>

          {/* Headline */}
          <h1 className="text-3xl font-bold text-white leading-snug mb-4">
            Welcome Back, Administrator
          </h1>
          <p className="text-blue-100 mb-6">
            Sign in with your credentials to manage and monitor the platform.
          </p>

          {/* Security Notice */}
          <p className="text-xs text-blue-200/90 bg-blue-900/30 rounded-lg px-3 py-2 border border-blue-700/50 leading-relaxed">
            🔒 Unauthorized access is strictly prohibited.  
            Activities are logged and monitored.
          </p>
        </div>

        {/* Accent Glows */}
        <div className="absolute top-10 right-12 w-24 h-24 bg-blue-400/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-16 left-16 w-40 h-40 bg-blue-600/20 rounded-full blur-2xl"></div>
      </div>
    </div>
  );
};

export default Layout;
