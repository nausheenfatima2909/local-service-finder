import React, { useState } from "react";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendEmailVerification,
} from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import { User } from "../types";

interface LoginProps {
  onLogin: (user: User) => void;
  users?: User[];
}

function nameFromEmail(email: string): string {
  return email
    .split("@")[0]
    .replace(/[._]/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function Login({ onLogin }: LoginProps) {
  const navigate = useNavigate();

  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [selectedRole, setSelectedRole] = useState<"Customer" | "Provider" | "Admin">("Customer");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState(""); // non-error status messages
  const [loading, setLoading] = useState(false);
  // Stores the email of a signed-up but unverified user so Resend button works
  const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null);
  const [resendLoading, setResendLoading] = useState(false);

  const switchMode = (next: "signin" | "signup") => {
    setMode(next);
    setError("");
    setInfo("");
    setPassword("");
    setConfirmPassword("");
    // NOTE: intentionally do NOT clear unverifiedEmail here —
    // it must survive the signup→signin mode switch so the Resend button stays visible
  };

  // ── Isolated signup function with its own try/catch and console logs ───────
  const handleSignup = async (): Promise<boolean> => {
    try {
      console.log("Signup attempt for:", email);

      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      console.log("User created in Firebase:", userCredential.user.uid);

      // Send verification email immediately — this is the critical step
      await sendEmailVerification(userCredential.user);
      console.log("Verification email sent to:", email);

      // Sign out so the unverified user cannot access the app
      await auth.signOut();

      setUnverifiedEmail(email);
      setInfo("Verification email sent! Please check your inbox (and spam folder), verify your email, then sign in.");
      switchMode("signin");
      return true;

    } catch (error: unknown) {
      console.error("Signup error:", error);
      const msg = error instanceof Error ? error.message : String(error);

      if (msg.includes("email-already-in-use")) {
        setError("This email is already registered. Please sign in instead.");
      } else if (msg.includes("invalid-email")) {
        setError("Please enter a valid email address.");
      } else if (msg.includes("weak-password")) {
        setError("Password must be at least 6 characters.");
      } else {
        setError("Signup failed. Please try again.");
      }
      return false;
    }
  };

  // ── Resend verification email to the most recently signed-up address ───────
  const handleResend = async () => {
    const target = unverifiedEmail;
    if (!target) return;

    setResendLoading(true);
    setError("");
    setInfo("");

    try {
      // Re-authenticate silently to get a fresh user object, then send
      const credential = await signInWithEmailAndPassword(auth, target, password);
      await sendEmailVerification(credential.user);
      await auth.signOut();
      console.log("Verification email resent to:", target);
      setInfo("Verification email resent! Check your inbox and spam folder.");
    } catch (error: unknown) {
      console.error("Resend error:", error);
      const msg = error instanceof Error ? error.message : String(error);
      if (msg.includes("too-many-requests")) {
        setError("Too many requests. Please wait a few minutes before resending.");
      } else {
        setError("Could not resend email. Please try signing up again.");
      }
    } finally {
      setResendLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setInfo("");

    // ── Signup-only client-side checks ──────────────────────────────────────
    if (mode === "signup") {
      if (password.length < 6) {
        setError("Password must be at least 6 characters.");
        return;
      }
      if (password !== confirmPassword) {
        setError("Passwords do not match.");
        return;
      }
      setLoading(true);
      await handleSignup();
      setLoading(false);
      return;
    }

    // ── SIGN IN ─────────────────────────────────────────────────────────────
    setLoading(true);
    try {
      const credential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = credential.user;

      // Block login if email is not verified
      if (!firebaseUser.emailVerified) {
        await auth.signOut();
        setUnverifiedEmail(firebaseUser.email ?? email);
        setError("Please verify your email before logging in. Check your inbox for the verification link.");
        return;
      }

      const user: User = {
        id: firebaseUser.uid,
        name: firebaseUser.displayName || nameFromEmail(firebaseUser.email ?? email),
        email: firebaseUser.email ?? email,
        role: selectedRole,
      };

      onLogin(user);
      setUnverifiedEmail(null); // clean up — user is now fully authenticated
      navigate("/dashboard");

    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);

      if (msg.includes("invalid-credential") || msg.includes("wrong-password") || msg.includes("user-not-found")) {
        setError("Invalid email or password.");
      } else if (msg.includes("invalid-email")) {
        setError("Please enter a valid email address.");
      } else if (msg.includes("too-many-requests")) {
        setError("Too many attempts. Please try again later.");
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 bg-slate-50">
      <div className="max-w-md w-full bg-white p-12 rounded-[3rem] shadow-2xl border border-slate-100 relative overflow-hidden">

        {/* Back button */}
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition-colors mb-6 group"
        >
          <div className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center group-hover:border-indigo-200 group-hover:bg-indigo-50 transition-all">
            ←
          </div>
          <span className="text-sm font-semibold tracking-wide">Go Back</span>
        </button>

        {/* Header */}
        <div className="text-center mb-10">
          <div className="text-5xl mb-6 inline-block bg-indigo-50 p-4 rounded-3xl">🔑</div>
          <h1 className="text-3xl font-black text-slate-800">
            {mode === "signin" ? "Welcome Back" : "Create Account"}
          </h1>
          {/* Clarity hint under heading */}
          <p className="text-xs text-slate-400 font-medium mt-2">
            {mode === "signin"
              ? "New user? Switch to Sign Up below to create an account."
              : "Already have an account? Switch to Sign In below."}
          </p>
        </div>

        {/* Sign In / Sign Up toggle */}
        <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-100 rounded-2xl mb-6">
          {(["signin", "signup"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => switchMode(m)}
              className={`py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${
                mode === m ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500"
              }`}
            >
              {m === "signin" ? "Sign In" : "Sign Up"}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Role selector */}
          <div className="grid grid-cols-3 gap-2 p-1.5 bg-slate-100 rounded-2xl">
            {(["Customer", "Provider", "Admin"] as const).map((role) => (
              <button
                key={role}
                type="button"
                onClick={() => setSelectedRole(role)}
                className={`py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${
                  selectedRole === role
                    ? "bg-white text-indigo-600 shadow-sm"
                    : "text-slate-500"
                }`}
              >
                {role}
              </button>
            ))}
          </div>

          {/* Credentials */}
          <div className="space-y-4">
            <input
              required
              type="email"
              placeholder="Email (e.g. mark@example.com)"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setUnverifiedEmail(null); }}
              className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <input
              required
              type="password"
              placeholder="Password (min 6 characters)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500"
            />
            {/* Confirm password — signup only */}
            {mode === "signup" && (
              <input
                required
                type="password"
                placeholder="Confirm password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500"
              />
            )}
          </div>

          {/* Error message */}
          {error && (
            <p className="text-rose-500 text-xs font-bold text-center">⚠️ {error}</p>
          )}

          {/* Resend verification button — shown when user exists but hasn't verified */}
          {unverifiedEmail && (
            <button
              type="button"
              onClick={handleResend}
              disabled={resendLoading}
              className="w-full bg-slate-100 text-slate-700 py-3 rounded-2xl text-xs font-bold hover:bg-slate-200 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {resendLoading ? "Resending…" : `Resend verification email to ${unverifiedEmail}`}
            </button>
          )}

          {/* Info / success message (e.g. verification email sent) */}
          {info && (
            <p className="text-emerald-600 text-xs font-bold text-center bg-emerald-50 border border-emerald-100 rounded-2xl px-4 py-3">
              ✅ {info}
            </p>
          )}

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-bold text-lg hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading
              ? mode === "signin" ? "Signing in…" : "Creating account…"
              : mode === "signin" ? "Sign In" : "Create Account"}
          </button>

          {/* Clarity hint below button */}
          <p className="text-center text-xs text-slate-400 font-medium">
            {mode === "signin" ? (
              <>
                New user?{" "}
                <button
                  type="button"
                  onClick={() => switchMode("signup")}
                  className="text-indigo-600 font-bold hover:underline"
                >
                  Create an account using Sign Up
                </button>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => switchMode("signin")}
                  className="text-indigo-600 font-bold hover:underline"
                >
                  Sign In here
                </button>
              </>
            )}
          </p>

        </form>
      </div>
    </div>
  );
}
