'use client';

import { useState } from 'react';
import { signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';

export default function ResetPasswordModal() {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleReset = async () => {
    setLoading(true);

    const res = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });

    setLoading(false);

    if (res.ok) {
      // 🔥 IMPORTANT: destroy old session
      await signOut({
        callbackUrl: '/login', // redirect to login
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-lg font-semibold mb-4">
          Reset Your Password
        </h2>

        <input
          type="password"
          className="w-full border p-2 rounded mb-4"
          placeholder="New password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <Button
          className="w-full"
          onClick={handleReset}
          disabled={loading || password.length < 6}
        >
          {loading ? 'Updating...' : 'Update Password'}
        </Button>
      </div>
    </div>
  );
}
