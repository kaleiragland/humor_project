'use client';

import { createClient } from '@/lib/supabase/client';

export default function SignInButton() {
  const handleSignIn = async () => {
    const supabase = createClient();
    
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  return (
    <button
      onClick={handleSignIn}
      className="rounded-full bg-purple-500 px-6 py-3 text-sm font-semibold text-white hover:bg-purple-600 transition shadow-lg"
    >
      Sign in with Google
    </button>
  );
}
