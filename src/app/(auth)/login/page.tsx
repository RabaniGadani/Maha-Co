import Link from 'next/link';
import { LoginForm } from '@/components/auth/LoginForm';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

export default function LoginPage() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-900">
      <Header showAuthButtons={false} />

      <main className="flex-grow flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-block">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-emerald-500/30">
                <span className="text-3xl font-bold text-white">M</span>
              </div>
              <span className="text-2xl font-bold text-white">Hamood LPG Co</span>
            </Link>
          </div>

          {/* Login Card */}
          <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6 sm:p-8">
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold text-white mb-2">Welcome back</h1>
              <p className="text-slate-400">Sign in to your account</p>
            </div>

            <LoginForm />

            <div className="mt-6 text-center space-y-3">
              <p className="text-slate-400 text-sm">
                Don't have an account?{' '}
                <Link href="#" className="text-emerald-400 hover:text-emerald-300 font-medium">
                  Register
                </Link>
              </p>
              <Link href="#" className="text-sm text-slate-500 hover:text-slate-400">
                Forgot your password?
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
