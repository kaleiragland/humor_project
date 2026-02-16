'use client';

import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export default function SignOutButton() {
  const router = useRouter();

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  return (
    <button
      onClick={handleSignOut}
      className="inline-block rounded-full bg-red-500 px-6 py-2 text-sm font-semibold text-white hover:bg-red-600 transition"
    >
      Sign Out
    </button>
  );
}
