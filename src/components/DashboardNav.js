'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from './AuthProvider';
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
  Bell,
  Clock,
  AlertTriangle,
  Calendar,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { getUpcomingDosesForToday } from '@/lib/notifications';
import { 
  setupNotificationMonitoring, 
  requestNotificationPermission 
} from '@/lib/notificationManager';
import InteractionHistory from './InteractionHistory';

export default function DashboardNav() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [medications, setMedications] = useState([]);
  const [upcomingDoses, setUpcomingDoses] = useState([]);
  const [warnings, setWarnings] = useState({ lowStock: [], expiring: [] });
  const [criticalAlerts, setCriticalAlerts] = useState([]);
  const { user, userData, signOut } = useAuth();
  const pathname = usePathname();

  // Setup comprehensive notification monitoring
  useEffect(() => {
    if (!user) return;

    // Request notification permission
    requestNotificationPermission();

    // Handle incoming critical notifications
    const handleNotification = (notification) => {
      setCriticalAlerts(prev => {
        const updated = [notification, ...prev];
        // Keep only the last 10 critical alerts
        return updated.slice(0, 10);
      });
    };

    // Setup monitoring for all critical events
    const cleanup = setupNotificationMonitoring(user.uid, handleNotification);

    return cleanup;
  }, [user]);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'users', user.uid, 'medications'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const meds = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMedications(meds);

      // Calculate upcoming doses
      const upcoming = getUpcomingDosesForToday(meds);
      setUpcomingDoses(upcoming);

      // Calculate warnings
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const sevenDaysFromNow = new Date();
      sevenDaysFromNow.setDate(today.getDate() + 7);

      const lowStock = meds.filter(med => 
        med.daysRemaining !== null && med.daysRemaining <= 7 && med.daysRemaining > 0
      );

      const expiring = meds.filter(med => {
        if (!med.expirationDate) return false;
        const expDate = new Date(med.expirationDate + 'T23:59:59');
        return expDate <= sevenDaysFromNow && expDate >= today;
      });

      setWarnings({ lowStock, expiring });
    });

    return unsubscribe;
  }, [user]);

  const totalNotifications = upcomingDoses.length + warnings.lowStock.length + warnings.expiring.length + criticalAlerts.length;

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
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Left Side - Logo & Mobile Menu Button */}
            <div className="flex items-center space-x-3 shrink-0">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>

              <Link href="/dashboard" className="flex items-center space-x-2">
                <div className="bg-linear-to-br from-cyan-500 to-purple-500 p-2 rounded-xl">
                  <Heart className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-display font-bold bg-linear-to-r from-cyan-600 to-purple-600 bg-clip-text text-transparent">
                  MediMate
                </span>
              </Link>
            </div>

            {/* Right Side - Notifications & User Profile */}
            <div className="flex items-center space-x-3 shrink-0">
              <div className="relative">
                <button
                  onClick={() => setNotificationOpen(!notificationOpen)}
                  className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 relative"
                >
                  <Bell className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                  {totalNotifications > 0 && (
                    <span className="absolute top-1 right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 bg-danger-500 text-white text-[10px] font-bold rounded-full">
                      {totalNotifications > 9 ? '9+' : totalNotifications}
                    </span>
                  )}
                </button>

                {/* Notification Dropdown */}
                <AnimatePresence>
                  {notificationOpen && (
                    <>
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setNotificationOpen(false)}
                        className="fixed inset-0 z-40"
                      />
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-800 rounded-xl shadow-large border border-slate-200 dark:border-slate-700 z-50 max-h-96 overflow-y-auto"
                      >
                        <div className="p-4 border-b border-slate-200 dark:border-slate-700">
                          <h3 className="font-semibold text-slate-900 dark:text-white">
                            Notifications
                          </h3>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            {totalNotifications} notification{totalNotifications !== 1 ? 's' : ''}
                          </p>
                        </div>

                        {/* Critical Alerts Section */}
                        {criticalAlerts.length > 0 && (
                          <div className="border-b border-slate-200 dark:border-slate-700">
                            <div className="px-4 py-2 bg-red-50 dark:bg-red-900/20">
                              <p className="text-xs font-semibold text-red-800 dark:text-red-300 uppercase tracking-wide">
                                🚨 Critical Alerts
                              </p>
                            </div>
                            <div className="p-2">
                              {criticalAlerts.map((alert, index) => (
                                <div
                                  key={index}
                                  className={`p-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-lg transition-colors mb-1 ${
                                    alert.severity === 'critical' ? 'bg-red-50 dark:bg-red-900/10' :
                                    alert.severity === 'warning' ? 'bg-yellow-50 dark:bg-yellow-900/10' :
                                    ''
                                  }`}
                                >
                                  <div className="flex items-start space-x-3">
                                    <div className={`text-lg ${
                                      alert.severity === 'critical' ? 'text-red-500' :
                                      alert.severity === 'warning' ? 'text-yellow-500' :
                                      'text-blue-500'
                                    }`}>
                                      {alert.type === 'expiring' && '⚠️'}
                                      {alert.type === 'low-stock' && '📦'}
                                      {alert.type === 'out-of-stock' && '🚨'}
                                      {alert.type === 'missed' && '💊'}
                                      {alert.type === 'critical-metric' && '🏥'}
                                      {alert.type === 'low-adherence' && '📊'}
                                    </div>
                                    <div className="flex-1">
                                      <p className="font-medium text-slate-900 dark:text-white text-sm">
                                        {alert.title}
                                      </p>
                                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                                        {alert.message}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Warnings Section */}
                        {(warnings.lowStock.length > 0 || warnings.expiring.length > 0) && (
                          <div className="border-b border-slate-200 dark:border-slate-700">
                            <div className="px-4 py-2 bg-warning-50 dark:bg-warning-900/20">
                              <p className="text-xs font-semibold text-warning-800 dark:text-warning-300 uppercase tracking-wide">
                                ⚠️ Alerts
                              </p>
                            </div>
                            <div className="p-2">
                              {/* Low Stock Warnings */}
                              {warnings.lowStock.map((med) => (
                                <div
                                  key={`low-${med.id}`}
                                  className="p-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-lg transition-colors mb-1"
                                >
                                  <div className="flex items-start space-x-3">
                                    <div className="p-2 bg-warning-100 dark:bg-warning-900/30 rounded-lg">
                                      <AlertTriangle className="w-4 h-4 text-warning-600 dark:text-warning-400" />
                                    </div>
                                    <div className="flex-1">
                                      <p className="font-medium text-slate-900 dark:text-white text-sm">
                                        Low Stock: {med.name}
                                      </p>
                                      <p className="text-xs text-warning-700 dark:text-warning-400 mt-1">
                                        Only {med.daysRemaining} day{med.daysRemaining !== 1 ? 's' : ''} remaining
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              ))}

                              {/* Expiration Warnings */}
                              {warnings.expiring.map((med) => {
                                const today = new Date();
                                today.setHours(0, 0, 0, 0);
                                const expDate = new Date(med.expirationDate + 'T23:59:59');
                                const daysUntilExpiry = Math.ceil((expDate - today) / (1000 * 60 * 60 * 24));
                                
                                return (
                                  <div
                                    key={`exp-${med.id}`}
                                    className="p-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-lg transition-colors mb-1"
                                  >
                                    <div className="flex items-start space-x-3">
                                      <div className="p-2 bg-danger-100 dark:bg-danger-900/30 rounded-lg">
                                        <Calendar className="w-4 h-4 text-danger-600 dark:text-danger-400" />
                                      </div>
                                      <div className="flex-1">
                                        <p className="font-medium text-slate-900 dark:text-white text-sm">
                                          Expiring: {med.name}
                                        </p>
                                        <p className="text-xs text-danger-700 dark:text-danger-400 mt-1">
                                          Expires in {daysUntilExpiry} day{daysUntilExpiry !== 1 ? 's' : ''}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* Upcoming Doses Section */}
                        {upcomingDoses.length > 0 && (
                          <>
                            <div className="px-4 py-2 bg-cyan-50 dark:bg-cyan-900/20">
                              <p className="text-xs font-semibold text-cyan-800 dark:text-cyan-300 uppercase tracking-wide">
                                📅 Upcoming Doses Today
                              </p>
                            </div>
                            <div className="p-2">
                              {upcomingDoses.map((dose, index) => {
                                // Convert 24h to 12h format with AM/PM
                                const [hours, minutes] = dose.time.split(':');
                                const hour = parseInt(hours);
                                const ampm = hour >= 12 ? 'PM' : 'AM';
                                const displayHour = hour % 12 || 12;
                                const displayTime = `${displayHour}:${minutes} ${ampm}`;

                                return (
                                  <div
                                    key={index}
                                    className="p-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-lg transition-colors"
                                  >
                                    <div className="flex items-start space-x-3">
                                      <div className="p-2 bg-cyan-100 dark:bg-cyan-900/30 rounded-lg">
                                        <Pill className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                                      </div>
                                      <div className="flex-1">
                                        <p className="font-medium text-slate-900 dark:text-white text-sm">
                                          {dose.medicationName}
                                        </p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">
                                          {dose.dosage}
                                        </p>
                                        {dose.instructions && (
                                          <p className="text-xs text-slate-500 dark:text-slate-400 italic mt-1">
                                            {dose.instructions}
                                          </p>
                                        )}
                                        <div className="flex items-center space-x-1 mt-2 text-xs text-slate-600 dark:text-slate-300">
                                          <Clock className="w-3 h-3" />
                                          <span>{displayTime}</span>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </>
                        )}

                        {totalNotifications === 0 && (
                          <div className="p-8 text-center">
                            <Bell className="w-12 h-12 mx-auto mb-3 text-slate-300 dark:text-slate-600" />
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                              No notifications
                            </p>
                          </div>
                        )}

                        <div className="p-3 border-t border-slate-200 dark:border-slate-700">
                          <Link
                            href="/medications"
                            onClick={() => setNotificationOpen(false)}
                            className="block text-center text-sm text-cyan-600 dark:text-cyan-400 hover:underline"
                          >
                            View All Medications
                          </Link>
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>

              <div className="flex items-center space-x-3 pl-3 border-l border-slate-300 dark:border-slate-600">
                <div className="hidden md:block text-right">
                  <p className="text-sm font-medium text-slate-900 dark:text-white truncate max-w-[150px]">
                    {userData?.displayName || 'User'}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-[150px]">
                    {user?.email}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-full bg-linear-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white font-semibold shrink-0">
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
                        className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${isActive
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
                  className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${isActive
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
