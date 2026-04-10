import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import SignOutButton from "@/app/components/SignOutButton";
import ImageUploader from "@/app/components/ImageUploader";

export default async function UploadPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-pink-200 via-purple-200 to-sky-200 px-6 py-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-4">
          <Link
            href="/"
            className="rounded-full bg-white/80 px-4 py-2 text-sm font-semibold text-sky-700 hover:bg-white transition shadow"
          >
            ⬅ Home
          </Link>
          <Link
            href="/list"
            className="rounded-full bg-pink-500 px-4 py-2 text-sm font-semibold text-white hover:bg-pink-600 transition shadow"
          >
            Rate Captions
          </Link>
          <div className="text-sm text-white bg-black/20 px-4 py-2 rounded-full backdrop-blur">
            {user.email}
          </div>
          <SignOutButton />
        </div>

        <h1 className="text-3xl font-extrabold text-white mb-6 text-center drop-shadow-lg">
          Upload & Caption
        </h1>

        <div className="bg-white rounded-3xl shadow-2xl p-8">
          <ImageUploader />
        </div>
      </div>
    </main>
  );
}
