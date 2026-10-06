"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Mail, Lock, Eye, EyeOff, ArrowRight, Loader2, ShieldCheck } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await axios.post(
        "http://localhost:5000/api/auth/login",
        { email, password },
        { withCredentials: true }
      );
      router.push("/classes");
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || "Invalid email or password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-slate-50 via-indigo-50/30 to-slate-100 p-4 lg:p-8">
      {/* Background Decorative Blobs */}
      <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-indigo-300/20 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-blue-300/20 blur-3xl pointer-events-none" />

      <main className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white/80 backdrop-blur-xl border border-white/20 shadow-2xl shadow-indigo-500/10">
        
        {/* Top Accent Gradient Bar */}
        <div className="h-2 w-full bg-gradient-to-r from-indigo-500 via-blue-600 to-indigo-700" />

        <div className="p-8 sm:p-10">
          
          {/* Header Section */}
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 to-blue-500 text-white shadow-lg shadow-indigo-500/30">
              <ShieldCheck className="h-7 w-7" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              Welcome Back
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Please enter your credentials to access your classes
            </p>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 animate-shake">
              <span className="mt-0.5 flex h-2 w-2 shrink-0 rounded-full bg-red-500" />
              <div className="flex-1">{error}</div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-5">
            
            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600">
                Email Address
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
                  <Mail className="h-5 w-5" />
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white/50 py-3.5 pl-11 pr-4 text-sm text-slate-800 placeholder-slate-400 transition-all focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10"
                  placeholder="name@example.com"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600">
                  Password
                </label>
                {/* Optional: Add Forgot Password link if needed */}
              </div>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
                  <Lock className="h-5 w-5" />
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white/50 py-3.5 pl-11 pr-12 text-sm text-slate-800 placeholder-slate-400 transition-all focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-slate-600 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="group relative mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 py-3.5 px-4 text-sm font-semibold text-white shadow-lg shadow-indigo-600/25 transition-all hover:from-indigo-500 hover:to-blue-500 hover:shadow-indigo-600/40 active:scale-[0.98] disabled:opacity-70 disabled:pointer-events-none"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Logging in...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </button>
          </form>

          {/* Footer Register Link */}
          <div className="mt-8 text-center">
            <p className="text-sm text-slate-500">
              Don’t have an account yet?{" "}
              <button
                type="button"
                onClick={() => router.push("/register")}
                className="font-semibold text-indigo-600 hover:text-indigo-700 hover:underline transition-colors"
              >
                Create account
              </button>
            </p>
          </div>

        </div>
      </main>
    </div>
  );
}