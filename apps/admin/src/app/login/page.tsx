'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { login } from '@/lib/admin-api';
import { setAccessToken } from '@/lib/auth';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('admin@example.com');
  const [password, setPassword] = useState('Admin@123456');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await login(email, password);
      setAccessToken(response.accessToken);
      router.replace('/dashboard');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed';
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-[conic-gradient(at_80%_20%,#f8d8a8,#f2eee8,#f8d8a8)] px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-3xl border border-stone-300/70 bg-white/90 p-8 shadow-lg backdrop-blur"
      >
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-stone-500">
          Lego Shop
        </p>
        <h1 className="mt-2 text-3xl font-semibold text-stone-900">Admin Login</h1>
        <p className="mt-2 text-sm text-stone-600">
          Sign in to manage products, templates, orders, and payment settings.
        </p>

        <div className="mt-6 space-y-4">
          <label className="block text-sm">
            <span className="mb-1 block text-stone-700">Email</span>
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-stone-300 bg-white px-3 py-2 outline-none focus:border-stone-500"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block text-stone-700">Password</span>
            <input
              required
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-stone-300 bg-white px-3 py-2 outline-none focus:border-stone-500"
            />
          </label>
        </div>

        {error ? (
          <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={loading}
          className="mt-6 w-full rounded-xl bg-stone-900 px-4 py-2.5 text-sm font-semibold text-stone-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? 'Signing in...' : 'Sign in'}
        </button>
      </form>
    </main>
  );
}
