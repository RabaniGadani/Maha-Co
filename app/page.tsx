import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export default function LandingPage() {
  return (
    <div className="bg-slate-900 text-white min-h-screen flex flex-col">
      <Header />

      <main className="flex-grow flex items-center justify-center">
        {/* Simple Hero Section */}
        <section className="container mx-auto px-4 py-20 text-center">
          {/* Logo */}
          <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-xl shadow-emerald-500/30">
            <span className="text-4xl font-bold text-white">M</span>
          </div>

          {/* Title */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6">
            Maha LPG & Co
          </h1>

          {/* Subtitle */}
          <p className="text-lg sm:text-xl text-slate-400 mb-10 max-w-xl mx-auto">
            Your trusted partner for reliable LPG supply.
            Safe, fast, and convenient delivery to your doorstep.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-8 rounded-lg transition-all duration-200"
            >
              Sign In
            </Link>
            <Link
              href="#"
              className="w-full sm:w-auto inline-flex items-center justify-center bg-slate-800 hover:bg-slate-700 text-white font-semibold py-3 px-8 rounded-lg border border-slate-700 transition-all duration-200"
            >
              Create Account
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
