import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import Swal from 'sweetalert2';

type Mode = "signin" | "signup";

interface AuthProps {
  onSuccess: () => void;
  initialMode?: Mode;
}

const Auth = ({ onSuccess, initialMode = "signin" }: AuthProps) => {
  const { signIn, signUp } = useAuth();

  const [mode, setMode] = useState<Mode>(initialMode);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

const handleSubmit = async () => {
  setError("");
  setLoading(true);

  try {
    if (mode === "signup") {
      const { error } = await signUp(email, password, name);
      if (error) throw error;
      await Swal.fire({
        icon: 'info',
        title: 'Email Confirmation Required',
        html: `We've sent a confirmation link to <strong>${email}</strong>.<br/>Please check your inbox (and spam folder) and click the link to activate your account.`,
        confirmButtonText: 'Got it',
        confirmButtonColor: '#1e3a8a',
      });
      onSuccess();
    } else {
      const { error } = await signIn(email, password);
      if (error) throw error;
      onSuccess();
    }
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "An error occurred";
    setError(errorMessage);
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 w-full max-w-md p-8">
      <div className="text-center mb-8">
        <h1 className="text-[26px] font-extrabold text-(--color-primary-navy) tracking-tight">
          MyRight
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          {mode === "signin" ? "Welcome back" : "Create your account"}
        </p>
      </div>

      <div className="flex flex-col gap-4">
        {mode === "signup" && (
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">Full Name</label>
            <input
              type="text"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-(--color-primary-navy) transition-colors"
            />
          </div>
        )}

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-(--color-primary-navy) transition-colors"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700">Password</label>
          <input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-(--color-primary-navy) transition-colors"
          />
        </div>

        {error && (
          <p className="text-red-500 text-sm bg-red-50 px-4 py-2.5 rounded-lg">{error}</p>
        )}

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-(--color-primary-navy) text-white rounded-xl py-3 text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed mt-1"
        >
          {loading ? "Please wait..." : mode === "signin" ? "Sign In" : "Create Account"}
        </button>

        <p className="text-center text-sm text-gray-500">
          {mode === "signin"
            ? "Don't have an account? "
            : "Already have an account? "}
          <button
            onClick={() => {
              setMode(mode === "signin" ? "signup" : "signin");
              setError("");
            }}
            className="text-(--color-primary-navy) font-semibold hover:underline"
          >
            {mode === "signin" ? "Sign Up" : "Sign In"}
          </button>
        </p>
      </div>
    </div>
  );
};

export default Auth;