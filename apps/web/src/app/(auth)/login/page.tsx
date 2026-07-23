"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { browserApiClient } from "@/lib/api/browser-client";
import { useAuthStore } from "@/features/auth/store";
import { ROUTES } from "@/config/routes";
import { formControlClassName } from "@/components/ui/form-control";
import { useI18n } from "@/lib/i18n/useI18n";

export default function LoginPage() {
  const router = useRouter();
  const { dictionary } = useI18n();
  const copy = dictionary.auth;
  const setAuth = useAuthStore((state) => state.setAuth);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await browserApiClient.auth.userLogin({ email, password });
      setAuth(data.accessToken, data.user);
      router.push(ROUTES.home);
    } catch (err) {
      setError(err instanceof Error ? err.message : copy.login.failed);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-surface">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-sm border border-border">
        <h1 className="text-2xl font-black text-center mb-6">
          {copy.login.title}
        </h1>
        {error && (
          <div className="p-3 mb-4 text-sm text-red-500 bg-red-50 rounded-lg">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              {copy.email}
            </label>
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={formControlClassName({ className: "px-4" })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              {copy.password}
            </label>
            <input
              required
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={formControlClassName({ className: "px-4" })}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-white py-3 rounded-lg font-bold hover:bg-primary-dark transition disabled:opacity-50"
          >
            {loading ? copy.processing : copy.login.title}
          </button>
        </form>
        <div className="mt-6 text-center text-sm text-text-muted">
          {copy.login.noAccount}{" "}
          <Link
            href="/register"
            className="text-primary font-bold hover:underline"
          >
            {copy.login.registerNow}
          </Link>
        </div>
      </div>
    </div>
  );
}
