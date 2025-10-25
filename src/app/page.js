'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
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
  Sun
} from 'lucide-react';
import { useTheme } from '@/components/ThemeProvider';

export default function Home() {
  const { theme, toggleTheme } = useTheme();

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
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Navigation */}
      <nav className="glass border-b border-slate-200 dark:border-slate-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center space-x-2"
            >
              <div className="bg-gradient-to-br from-cyan-500 to-purple-500 p-2 rounded-xl">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-display font-bold bg-gradient-to-r from-cyan-600 to-purple-600 bg-clip-text text-transparent">
                MediMate
              </span>
            </motion.div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? (
                  <Sun className="w-5 h-5 text-yellow-500" />
                ) : (
                  <Moon className="w-5 h-5 text-slate-600" />
                )}
              </button>
              <Link 
                href="/login"
                className="text-slate-600 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-cyan-400 font-medium transition-colors"
              >
                Sign In
              </Link>
              <Link 
                href="/signup"
                className="btn-primary"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center space-x-2 bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300 px-4 py-2 rounded-full mb-6">
                <Sparkles className="w-4 h-4" />
                <span className="text-sm font-medium">Your Personal Health Companion</span>
              </div>
              
              <h1 className="text-5xl lg:text-6xl font-display font-bold text-slate-900 dark:text-white mb-6 leading-tight">
                Take Control of Your{' '}
                <span className="bg-gradient-to-r from-cyan-600 to-purple-600 bg-clip-text text-transparent">
                  Health Journey
                </span>
              </h1>
              
              <p className="text-xl text-slate-600 dark:text-slate-300 mb-8 leading-relaxed">
                Track medications, monitor health metrics, and get AI-powered symptom guidance — all in one beautiful, secure platform.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/signup" className="btn-primary text-center">
                  Start Free Today
                </Link>
                <Link href="/login?demo=true" className="btn-outline text-center">
                  Try Demo
                </Link>
              </div>

              <div className="mt-8 flex items-center space-x-6 text-sm text-slate-600 dark:text-slate-400">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-5 h-5 text-success-500" />
                  <span>No credit card required</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-5 h-5 text-success-500" />
                  <span>100% Private & Secure</span>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <div className="relative z-10 card p-8">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gradient-to-br from-cyan-500 to-cyan-600 p-6 rounded-xl text-white">
                    <Activity className="w-8 h-8 mb-2" />
                    <div className="text-3xl font-bold">98%</div>
                    <div className="text-sm opacity-90">Adherence Rate</div>
                  </div>
                  <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-xl text-white">
                    <Pill className="w-8 h-8 mb-2" />
                    <div className="text-3xl font-bold">24/7</div>
                    <div className="text-sm opacity-90">Reminders</div>
                  </div>
                  <div className="bg-gradient-to-br from-success-500 to-success-600 p-6 rounded-xl text-white">
                    <TrendingUp className="w-8 h-8 mb-2" />
                    <div className="text-3xl font-bold">10+</div>
                    <div className="text-sm opacity-90">Health Metrics</div>
                  </div>
                  <div className="bg-gradient-to-br from-warning-500 to-warning-600 p-6 rounded-xl text-white">
                    <Heart className="w-8 h-8 mb-2" />
                    <div className="text-3xl font-bold">AI</div>
                    <div className="text-sm opacity-90">Symptom Check</div>
                  </div>
                </div>
              </div>
              
              {/* Decorative elements */}
              <div className="absolute -top-4 -right-4 w-72 h-72 bg-cyan-200 dark:bg-cyan-900/20 rounded-full blur-3xl opacity-50"></div>
              <div className="absolute -bottom-4 -left-4 w-72 h-72 bg-purple-200 dark:bg-purple-900/20 rounded-full blur-3xl opacity-50"></div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white dark:bg-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-display font-bold text-slate-900 dark:text-white mb-4">
              Everything You Need to Stay Healthy
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
                className="card p-6 hover:shadow-medium transition-all duration-300 group"
              >
                <div className={`${feature.color} mb-4 group-hover:scale-110 transition-transform`}>
                  <feature.icon className="w-12 h-12" />
                </div>
                <h3 className="text-xl font-display font-semibold text-slate-900 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-slate-600 dark:text-slate-300">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="card p-12 bg-gradient-to-br from-cyan-500 to-purple-600">
            <h2 className="text-4xl font-display font-bold text-white mb-4">
              Ready to Start Your Health Journey?
            </h2>
            <p className="text-xl text-cyan-50 mb-8">
              Join thousands of users taking control of their wellness
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/signup" 
                className="bg-white text-cyan-600 hover:bg-cyan-50 font-medium px-8 py-3 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Create Free Account
              </Link>
              <Link 
                href="/login?demo=true" 
                className="border-2 border-white text-white hover:bg-white/10 font-medium px-8 py-3 rounded-xl transition-all duration-200"
              >
                View Demo
              </Link>
            </div>
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

