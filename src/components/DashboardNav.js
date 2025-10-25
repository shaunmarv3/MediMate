'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from './AuthProvider';
import { useTheme } from './ThemeProvider';
import {
  Heart,
  LayoutDashboard,
  Activity,
  Pill,
  Stethoscope,
  User,
  Settings,
  LogOut,
  Menu,
  X,
  Moon,
  Sun,
  Bell,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function DashboardNav() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, userData, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const pathname = usePathname();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Metrics', href: '/metrics', icon: Activity },
    { name: 'Medications', href: '/medications', icon: Pill },
    { name: 'Symptoms', href: '/symptoms', icon: Stethoscope },
    { name: 'Profile', href: '/profile', icon: User },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  return (
    <>
      {/* Top Navigation */}
      <nav className="glass border-b border-slate-200 dark:border-slate-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo & Mobile Menu Button */}
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
              
              <Link href="/dashboard" className="flex items-center space-x-2">
                <div className="bg-gradient-to-br from-cyan-500 to-purple-500 p-2 rounded-xl">
                  <Heart className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-display font-bold bg-gradient-to-r from-cyan-600 to-purple-600 bg-clip-text text-transparent hidden sm:block">
                  MediMate
                </span>
              </Link>
            </div>

            {/* Right Side */}
            <div className="flex items-center space-x-3">
              <button className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 relative">
                <Bell className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-danger-500 rounded-full"></span>
              </button>
              
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                {theme === 'dark' ? (
                  <Sun className="w-5 h-5 text-yellow-500" />
                ) : (
                  <Moon className="w-5 h-5 text-slate-600" />
                )}
              </button>

              <div className="flex items-center space-x-3 pl-3 border-l border-slate-300 dark:border-slate-600">
                <div className="hidden sm:block text-right">
                  <p className="text-sm font-medium text-slate-900 dark:text-white">
                    {userData?.displayName || 'User'}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {user?.email}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white font-semibold">
                  {userData?.displayName?.charAt(0) || 'U'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            />
            <motion.div
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              className="fixed left-0 top-0 bottom-0 w-72 bg-white dark:bg-slate-800 z-50 lg:hidden shadow-xl"
            >
              <div className="p-6">
                <div className="flex items-center space-x-2 mb-8">
                  <div className="bg-gradient-to-br from-cyan-500 to-purple-500 p-2 rounded-xl">
                    <Heart className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-2xl font-display font-bold bg-gradient-to-r from-cyan-600 to-purple-600 bg-clip-text text-transparent">
                    MediMate
                  </span>
                </div>

                <nav className="space-y-2">
                  {navigation.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={() => setSidebarOpen(false)}
                        className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
                          isActive
                            ? 'bg-cyan-500 text-white shadow-md'
                            : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                        }`}
                      >
                        <item.icon className="w-5 h-5" />
                        <span className="font-medium">{item.name}</span>
                      </Link>
                    );
                  })}

                  <button
                    onClick={signOut}
                    className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-danger-600 dark:text-danger-400 hover:bg-danger-50 dark:hover:bg-danger-900/20 transition-all"
                  >
                    <LogOut className="w-5 h-5" />
                    <span className="font-medium">Sign Out</span>
                  </button>
                </nav>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <div className="hidden lg:block fixed left-0 top-16 bottom-0 w-64 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 overflow-y-auto">
        <div className="p-6">
          <nav className="space-y-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
                    isActive
                      ? 'bg-cyan-500 text-white shadow-md'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.name}</span>
                </Link>
              );
            })}

            <button
              onClick={signOut}
              className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-danger-600 dark:text-danger-400 hover:bg-danger-50 dark:hover:bg-danger-900/20 transition-all mt-4"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Sign Out</span>
            </button>
          </nav>
        </div>
      </div>
    </>
  );
}
