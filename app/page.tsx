import Link from "next/link";
import SignInButton from "./components/SignInButton";
import { createClient } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-pink-200 via-purple-200 to-sky-200 px-6">
      <div className="w-full max-w-md rounded-3xl bg-white/80 p-10 text-center shadow-2xl backdrop-blur">
        <h1 className="text-5xl font-extrabold tracking-tight text-zinc-900">
          Hello World <span className="inline-block"></span>
        </h1>

        <p className="mt-4 text-lg text-zinc-700">👋</p>

        {user ? (
          <div className="mt-8 space-y-4">
            <p className="text-sm text-zinc-600">
              Signed in as: <span className="font-semibold">{user.email}</span>
            </p>
            <Link
              href="/list"
              className="inline-block rounded-full bg-pink-500 px-6 py-3 text-sm font-semibold text-white hover:bg-pink-600 transition shadow-lg"
            >
              Go to Bug Reports
            </Link>
          </div>
        ) : (
          <div className="mt-8 space-y-4">
            <p className="text-sm text-zinc-600">Please sign in to view bug reports</p>
            <SignInButton />
          </div>
        )}
        
        <div className="mt-8 flex justify-center gap-3">
         <span className="rounded-full bg-pink-100 px-4 py-2 text-sm font-semibold text-pink-700">
          
         </span>
         <span className="rounded-full bg-purple-100 px-4 py-2 text-sm font-semibold text-purple-700">
          
         </span>
         <span className="rounded-full bg-sky-100 px-4 py-2 text-sm font-semibold text-sky-700">
          
         </span>
       </div>
      </div>
    </main>
  );
}
