import './globals.css';
import type { Metadata } from 'next';
import { AuthProvider } from '@/lib/context/auth-context';
import { Inter } from 'next/font/google';
import { ThemeProvider } from '@/components/theme-provider';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import { Toaster } from '@/components/ui/toaster';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'NewsVoice - Voice-First News Assistant',
  description: 'Get personalized news summaries with voice interaction',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <AuthProvider>
          
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <div className="flex min-h-screen flex-col">
            {/* <Header /> */}
            <main className="flex-1">{children}</main>
            {/* <Footer /> */}
          </div>
          <Toaster />
        </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}