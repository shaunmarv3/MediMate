'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const { resetPassword } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await resetPassword(email);
      setSent(true);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md"
      >
        <div className="card p-8">
          {!sent ? (
            <>
              <div className="text-center mb-8">
                <h2 className="text-3xl font-display font-bold text-slate-900 dark:text-white mb-2">
                  Reset Password
                </h2>
                <p className="text-slate-600 dark:text-slate-400">
                  Enter your email to receive reset instructions
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="label">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="input-field pl-10"
                      placeholder="you@example.com"
                      required
                    />
                  </div>
                </div>

                <button type="submit" disabled={loading} className="w-full btn-primary">
                  {loading ? 'Sending...' : 'Send Reset Link'}
                </button>
              </form>

              <Link href="/login" className="flex items-center justify-center space-x-2 mt-6 text-cyan-600 dark:text-cyan-400 hover:underline">
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Sign In</span>
              </Link>
            </>
          ) : (
            <div className="text-center">
              <div className="w-16 h-16 bg-success-100 dark:bg-success-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-success-600 dark:text-success-400" />
              </div>
              <h2 className="text-2xl font-display font-bold text-slate-900 dark:text-white mb-2">
                Check Your Email
              </h2>
              <p className="text-slate-600 dark:text-slate-400 mb-6">
                We've sent password reset instructions to <strong>{email}</strong>
              </p>
              <Link href="/login" className="btn-primary inline-block">
                Return to Sign In
              </Link>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
