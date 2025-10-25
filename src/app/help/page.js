import Link from 'next/link';
import { Heart, Shield, FileText, Mail } from 'lucide-react';

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <nav className="glass border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center space-x-2">
              <div className="bg-gradient-to-br from-cyan-500 to-purple-500 p-2 rounded-xl">
                <Heart className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-display font-bold bg-gradient-to-r from-cyan-600 to-purple-600 bg-clip-text text-transparent">
                MediMate
              </span>
            </Link>
            <Link href="/dashboard" className="text-cyan-600 dark:text-cyan-400 hover:underline">
              Dashboard
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-display font-bold text-slate-900 dark:text-white mb-4">
          Help Center
        </h1>
        <p className="text-xl text-slate-600 dark:text-slate-400 mb-12">
          Everything you need to know about using MediMate
        </p>

        <div className="space-y-8">
          <div className="card p-8">
              <div className="flex items-start space-x-4">
                <Shield className="w-8 h-8 text-cyan-600 dark:text-cyan-400 flex-shrink-0" />
                <div>
                <h2 className="text-2xl font-display font-bold text-slate-900 dark:text-white mb-4">
                  Privacy & Security
                </h2>
                <div className="prose dark:prose-invert max-w-none">
                  <p className="text-slate-600 dark:text-slate-400 mb-4">
                    Your health data is encrypted and stored securely using industry-standard Firebase infrastructure.
                    We never share your personal health information with third parties.
                  </p>
                  <ul className="list-disc list-inside text-slate-600 dark:text-slate-400 space-y-2">
                    <li>End-to-end encryption for all health data</li>
                    <li>Secure Firebase Authentication</li>
                    <li>HIPAA-compliant data storage practices</li>
                    <li>You own and control your data</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="card p-8">
              <div className="flex items-start space-x-4">
                <FileText className="w-8 h-8 text-purple-600 dark:text-purple-400 flex-shrink-0" />
                <div>
                <h2 className="text-2xl font-display font-bold text-slate-900 dark:text-white mb-4">
                  Medical Disclaimer
                </h2>
                <div className="bg-warning-50 dark:bg-warning-900/20 border border-warning-200 dark:border-warning-800 rounded-xl p-4 mb-4">
                  <p className="text-warning-900 dark:text-warning-200 font-medium">
                    ⚠️ Important Information
                  </p>
                </div>
                <div className="prose dark:prose-invert max-w-none text-slate-600 dark:text-slate-400">
                  <p className="mb-4">
                    MediMate is a health tracking and informational tool <strong>NOT</strong> a substitute for professional medical advice, diagnosis, or treatment.
                  </p>
                  <p className="mb-4">
                    Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition.
                  </p>
                  <p className="mb-4">
                    Never disregard professional medical advice or delay in seeking it because of something you have read in MediMate.
                  </p>
                  <p>
                    If you think you may have a medical emergency, call your doctor or emergency services immediately.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="card p-8">
            <div className="flex items-start space-x-4">
              <Mail className="w-8 h-8 text-success-600 dark:text-success-400 flex-shrink-0" />
              <div>
                <h2 className="text-2xl font-display font-bold text-slate-900 dark:text-white mb-4">
                  Contact Support
                </h2>
                <p className="text-slate-600 dark:text-slate-400 mb-4">
                  Need help? Our support team is here to assist you.
                </p>
                <a href="mailto:support@medimate.app" className="btn-primary inline-block">
                  Email Support
                </a>
              </div>
            </div>
          </div>

          <div className="card p-8">
            <h2 className="text-2xl font-display font-bold text-slate-900 dark:text-white mb-4">
              Frequently Asked Questions
            </h2>
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
                  How do I export my health data?
                </h3>
                <p className="text-slate-600 dark:text-slate-400">
                  Go to Settings → Data Export to download all your health metrics and medication logs as a CSV file.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
                  Can I use MediMate on multiple devices?
                </h3>
                <p className="text-slate-600 dark:text-slate-400">
                  Yes! Your data syncs automatically across all devices where you're signed in.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
                  How do medication reminders work?
                </h3>
                <p className="text-slate-600 dark:text-slate-400">
                  You'll receive browser push notifications and optional email reminders based on your medication schedule.
                  Make sure to allow notifications when prompted.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <footer className="bg-slate-900 dark:bg-slate-950 text-white py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-slate-400 text-sm">
            © 2025 MediMate. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
