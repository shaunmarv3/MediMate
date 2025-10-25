import { Inter, Poppins } from "next/font/google";
import "./globals.css";
import { Toaster } from 'sonner';
import ThemeProvider from '@/components/ThemeProvider';

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: 'swap',
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

export const metadata = {
  title: "MediMate - Personal Health Tracker & Medication Manager",
  description: "Track your health metrics, manage medications, get symptom guidance, and stay on top of your wellness journey with MediMate.",
  keywords: "health tracker, medication reminder, symptom checker, health metrics, wellness app",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${poppins.variable} font-sans antialiased`}
      >
        <ThemeProvider>
          {children}
          <Toaster 
            position="top-right" 
            richColors 
            closeButton
            theme="system"
          />
        </ThemeProvider>
      </body>
    </html>
  );
}

