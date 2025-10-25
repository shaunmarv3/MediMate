'use client';

import Link from 'next/link';
import { motion, useScroll, useTransform } from 'framer-motion';
import { 
  Heart, 
  Pill, 
  Activity, 
  Clock, 
  Shield, 
  TrendingUp,
  CheckCircle2,
  Sparkles,
  Moon,
  Sun,
  Star,
  Users,
  ArrowRight
} from 'lucide-react';
import { useTheme } from '@/components/ThemeProvider';

export default function Home() {
  const { theme, toggleTheme } = useTheme();
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  const stats = [
    { icon: Users, value: '10K+', label: 'Active Users' },
    { icon: Pill, value: '500K+', label: 'Medications Tracked' },
    { icon: Activity, value: '1M+', label: 'Health Records' },
    { icon: Star, value: '4.9', label: 'User Rating' }
  ];

  const features = [
    {
      icon: Pill,
      title: 'Medication Management',
      description: 'Never miss a dose with smart reminders and adherence tracking',
      color: 'text-cyan-500'
    },
    {
      icon: Activity,
      title: 'Health Metrics',
      description: 'Track weight, blood pressure, glucose, heart rate, and more',
      color: 'text-purple-500'
    },
    {
      icon: Heart,
      title: 'Symptom Checker',
      description: 'AI-powered guidance for common symptoms and conditions',
      color: 'text-danger-500'
    },
    {
      icon: TrendingUp,
      title: 'Analytics & Insights',
      description: 'Visualize your health trends with beautiful charts',
      color: 'text-success-500'
    },
    {
      icon: Clock,
      title: 'Smart Reminders',
      description: 'Push and email notifications for medications',
      color: 'text-warning-500'
    },
    {
      icon: Shield,
      title: 'Secure & Private',
      description: 'Your health data is encrypted and belongs only to you',
      color: 'text-cyan-700'
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          style={{ y }}
          className="absolute top-20 left-10 w-72 h-72 bg-cyan-300/20 dark:bg-cyan-500/10 rounded-full blur-3xl"
        />
        <motion.div 
          style={{ y: useTransform(scrollYProgress, [0, 1], ['0%', '80%']) }}
          className="absolute top-40 right-20 w-96 h-96 bg-purple-300/20 dark:bg-purple-500/10 rounded-full blur-3xl"
        />
        <motion.div 
          style={{ y: useTransform(scrollYProgress, [0, 1], ['0%', '30%']) }}
          className="absolute bottom-20 left-1/2 w-80 h-80 bg-pink-300/20 dark:bg-pink-500/10 rounded-full blur-3xl"
        />
      </div>

      {/* Navigation */}
      <nav className="glass border-b border-slate-200 dark:border-slate-700 sticky top-0 z-50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center space-x-2"
            >
              <motion.div 
                whileHover={{ rotate: 360, scale: 1.1 }}
                transition={{ duration: 0.6 }}
                className="bg-gradient-to-br from-cyan-500 to-purple-500 p-2 rounded-xl shadow-lg"
              >
                <Heart className="w-6 h-6 text-white" />
              </motion.div>
              <span className="text-2xl font-display font-bold bg-gradient-to-r from-cyan-600 to-purple-600 bg-clip-text text-transparent">
                MediMate
              </span>
            </motion.div>
            
            <div className="flex items-center space-x-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={toggleTheme}
                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? (
                  <Sun className="w-5 h-5 text-yellow-500" />
                ) : (
                  <Moon className="w-5 h-5 text-slate-600" />
                )}
              </motion.button>
              <Link 
                href="/login"
                className="text-slate-600 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-cyan-400 font-medium transition-colors"
              >
                Sign In
              </Link>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link 
                  href="/signup"
                  className="btn-primary inline-flex items-center space-x-2"
                >
                  <span>Get Started</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </motion.div>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              style={{ opacity }}
            >
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center space-x-2 bg-gradient-to-r from-cyan-100 to-purple-100 dark:from-cyan-900/30 dark:to-purple-900/30 text-cyan-700 dark:text-cyan-300 px-4 py-2 rounded-full mb-6 border border-cyan-200 dark:border-cyan-800"
              >
                <Sparkles className="w-4 h-4 animate-pulse" />
                <span className="text-sm font-medium">Your Personal Health Companion</span>
              </motion.div>
              
              <h1 className="text-5xl lg:text-7xl font-display font-bold text-slate-900 dark:text-white mb-6 leading-tight">
                Take Control of Your{' '}
                <span className="bg-gradient-to-r from-cyan-600 via-purple-600 to-pink-600 bg-clip-text text-transparent animate-gradient">
                  Health Journey
                </span>
              </h1>
              
              <p className="text-xl text-slate-600 dark:text-slate-300 mb-8 leading-relaxed">
                Track medications, monitor health metrics, and get AI-powered symptom guidance — all in one beautiful, secure platform.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link href="/signup" className="btn-primary text-center inline-flex items-center justify-center space-x-2 group">
                    <span>Start Free Today</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link href="/login" className="btn-outline text-center inline-flex items-center justify-center space-x-2">
                    <span>Sign In</span>
                  </Link>
                </motion.div>
              </div>

              <div className="mt-8 flex flex-wrap items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
                <motion.div 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                  className="flex items-center space-x-2"
                >
                  <CheckCircle2 className="w-5 h-5 text-success-500" />
                  <span>No credit card required</span>
                </motion.div>
                <motion.div 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                  className="flex items-center space-x-2"
                >
                  <CheckCircle2 className="w-5 h-5 text-success-500" />
                  <span>100% Private & Secure</span>
                </motion.div>
                <motion.div 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 }}
                  className="flex items-center space-x-2"
                >
                  <CheckCircle2 className="w-5 h-5 text-success-500" />
                  <span>Free forever</span>
                </motion.div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <div className="relative z-10">
                <motion.div 
                  whileHover={{ y: -5 }}
                  transition={{ duration: 0.3 }}
                  className="card p-8 shadow-2xl"
                >
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { icon: Activity, gradient: 'from-cyan-500 to-cyan-600', value: '98%', label: 'Adherence Rate' },
                      { icon: Pill, gradient: 'from-purple-500 to-purple-600', value: '24/7', label: 'Reminders' },
                      { icon: TrendingUp, gradient: 'from-success-500 to-success-600', value: '10+', label: 'Health Metrics' },
                      { icon: Heart, gradient: 'from-pink-500 to-pink-600', value: 'AI', label: 'Symptom Check' }
                    ].map((item, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3 + idx * 0.1 }}
                        whileHover={{ scale: 1.05, rotate: 2 }}
                        className={`bg-gradient-to-br ${item.gradient} p-6 rounded-xl text-white shadow-lg hover:shadow-xl transition-all`}
                      >
                        <item.icon className="w-8 h-8 mb-2" />
                        <div className="text-3xl font-bold">{item.value}</div>
                        <div className="text-sm opacity-90">{item.label}</div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              </div>
              
              {/* Enhanced Decorative elements */}
              <div className="absolute -top-6 -right-6 w-72 h-72 bg-gradient-to-br from-cyan-200 to-cyan-300 dark:from-cyan-900/30 dark:to-cyan-800/30 rounded-full blur-3xl opacity-60 animate-pulse"></div>
              <div className="absolute -bottom-6 -left-6 w-72 h-72 bg-gradient-to-br from-purple-200 to-purple-300 dark:from-purple-900/30 dark:to-purple-800/30 rounded-full blur-3xl opacity-60 animate-pulse" style={{ animationDelay: '1s' }}></div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white/50 dark:bg-slate-800/30 backdrop-blur-sm relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className="text-center"
              >
                <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-cyan-500 to-purple-500 rounded-xl mb-3">
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <div className="text-3xl font-bold text-slate-900 dark:text-white mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="inline-block"
            >
              <span className="inline-flex items-center space-x-2 bg-gradient-to-r from-cyan-100 to-purple-100 dark:from-cyan-900/30 dark:to-purple-900/30 text-cyan-700 dark:text-cyan-300 px-4 py-2 rounded-full mb-4 text-sm font-medium border border-cyan-200 dark:border-cyan-800">
                <Sparkles className="w-4 h-4" />
                <span>Powerful Features</span>
              </span>
            </motion.div>
            <h2 className="text-4xl lg:text-5xl font-display font-bold text-slate-900 dark:text-white mb-4">
              Everything You Need to{' '}
              <span className="bg-gradient-to-r from-cyan-600 to-purple-600 bg-clip-text text-transparent">
                Stay Healthy
              </span>
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              Powerful features designed to make health management simple and effective
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ y: -8, scale: 1.02 }}
                className="card p-8 hover:shadow-2xl transition-all duration-300 group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className={`${feature.color} mb-4 group-hover:scale-110 transition-transform relative z-10`}>
                  <feature.icon className="w-12 h-12" strokeWidth={1.5} />
                </div>
                <h3 className="text-xl font-display font-semibold text-slate-900 dark:text-white mb-2 relative z-10">
                  {feature.title}
                </h3>
                <p className="text-slate-600 dark:text-slate-300 relative z-10">
                  {feature.description}
                </p>
                <div className="mt-4 flex items-center text-cyan-600 dark:text-cyan-400 font-medium text-sm opacity-0 group-hover:opacity-100 transition-opacity relative z-10">
                  Learn more
                  <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            whileHover={{ scale: 1.02 }}
            className="card p-12 bg-gradient-to-br from-cyan-500 via-purple-500 to-pink-500 relative overflow-hidden group shadow-2xl"
          >
            {/* Animated background pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0" style={{ 
                backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
                backgroundSize: '30px 30px'
              }} />
            </div>
            
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="relative z-10"
            >
              <div className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-6 text-white">
                <Sparkles className="w-4 h-4" />
                <span className="text-sm font-medium">Limited Time Offer</span>
              </div>
              
              <h2 className="text-4xl lg:text-5xl font-display font-bold text-white mb-4">
                Ready to Start Your Health Journey?
              </h2>
              <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
                Join thousands of users taking control of their wellness with MediMate
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link 
                    href="/signup" 
                    className="inline-flex items-center space-x-2 bg-white text-cyan-600 hover:bg-cyan-50 font-semibold px-8 py-4 rounded-xl transition-all duration-200 shadow-xl hover:shadow-2xl"
                  >
                    <span>Create Free Account</span>
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link 
                    href="/login" 
                    className="inline-flex items-center space-x-2 border-2 border-white text-white hover:bg-white/10 backdrop-blur-sm font-semibold px-8 py-4 rounded-xl transition-all duration-200"
                  >
                    <span>Sign In</span>
                  </Link>
                </motion.div>
              </div>
              
              <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-white/90 text-sm">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Free forever</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-5 h-5" />
                  <span>No credit card</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Setup in 2 minutes</span>
                </div>
              </div>
            </motion.div>

            {/* Floating elements */}
            <motion.div
              animate={{ 
                y: [0, -10, 0],
                rotate: [0, 5, 0]
              }}
              transition={{ 
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute top-10 right-10 w-20 h-20 bg-white/10 backdrop-blur-sm rounded-full"
            />
            <motion.div
              animate={{ 
                y: [0, 10, 0],
                rotate: [0, -5, 0]
              }}
              transition={{ 
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute bottom-10 left-10 w-16 h-16 bg-white/10 backdrop-blur-sm rounded-full"
            />
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 dark:bg-slate-950 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="bg-gradient-to-br from-cyan-500 to-purple-500 p-2 rounded-xl">
                  <Heart className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-display font-bold">MediMate</span>
              </div>
              <p className="text-slate-400 text-sm">
                Your trusted companion for better health management.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li><Link href="#" className="hover:text-white transition-colors">Features</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Pricing</Link></li>
                <li><Link href="/help" className="hover:text-white transition-colors">Help Center</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li><Link href="#" className="hover:text-white transition-colors">About</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Privacy</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Terms</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Connect</h3>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li><Link href="#" className="hover:text-white transition-colors">Twitter</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">GitHub</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Contact</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-slate-800 pt-8">
            <p className="text-center text-slate-400 text-sm">
              © 2025 MediMate. All rights reserved.
            </p>
            <p className="text-center text-slate-500 text-xs mt-2">
              ⚕️ MediMate provides informational guidance only and is not a substitute for professional medical advice, diagnosis, or treatment.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

