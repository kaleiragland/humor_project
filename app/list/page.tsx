import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import SignOutButton from "@/app/components/SignOutButton";
import CaptionCard from "@/app/components/CaptionCard";

export default async function ListPage() {
  const supabase = await createClient();

  // Check if user is authenticated
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  // Fetch the current user's existing votes
  const { data: votesData } = await supabase
    .from('caption_votes')
    .select('caption_id, vote_value')
    .eq('profile_id', user.id);

  const userVotes: Record<string, number> = {};
  for (const v of votesData ?? []) {
    userVotes[String(v.caption_id)] = v.vote_value;
  }

  // Fetch captions with their associated images
  const { data, error } = await supabase
    .from("captions")
    .select(`
      id,
      content,
      created_datetime_utc,
      image_id,
      images:image_id (
        id,
        url
      )
    `)
    .eq("is_public", true)
    .not("content", "is", null)
    .order("created_datetime_utc", { ascending: false });

  if (error) {
    console.error("Supabase error:", error);
    return (
      <main className="min-h-screen bg-gradient-to-br from-pink-200 via-purple-200 to-sky-200 px-6 py-6 flex items-center justify-center">
        <div className="bg-white rounded-3xl shadow-2xl p-12 text-center max-w-md">
          <p className="text-xl text-zinc-800 font-semibold mb-2">
            We couldn&apos;t load captions right now.
          </p>
          <p className="text-sm text-zinc-500 mb-4">
            Please try again in a moment. If the problem persists, contact the site admin.
          </p>
          <Link href="/" className="inline-block text-sky-600 hover:underline">
            Go back
          </Link>
        </div>
      </main>
    );
  }

  type Caption = {
    id: string;
    content: string;
    created_datetime_utc: string;
    image_id: string;
    images: {
      id: string;
      url: string;
    };
  };

  const captions: Caption[] = (data ?? [])
    .map((row) => {
      const image = Array.isArray(row.images) ? row.images[0] : row.images;
      if (!image) return null;

      return {
        id: String(row.id),
        content: String(row.content),
        created_datetime_utc: String(row.created_datetime_utc),
        image_id: String(row.image_id),
        images: {
          id: String(image.id),
          url: String(image.url),
        },
      };
    })
    .filter((row): row is Caption => row !== null);

  // Debug: Check if we have data
  if (captions.length === 0) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-pink-200 via-purple-200 to-sky-200 px-6 py-6 flex items-center justify-center">
        <div className="bg-white rounded-3xl shadow-2xl p-12 text-center">
          <p className="text-xl text-zinc-600">No captions found!</p>
          <Link href="/" className="mt-4 inline-block text-sky-600 hover:underline">
            Go back
          </Link>
        </div>
      </main>
    );
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
            href="/upload"
            className="rounded-full bg-purple-500 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-600 transition shadow"
          >
            Upload Image
          </Link>
          <div className="text-sm text-white bg-black/20 px-4 py-2 rounded-full backdrop-blur">
            {user.email}
          </div>
          <SignOutButton />
        </div>
        
        <h1 className="text-3xl font-extrabold text-white mb-4 text-center drop-shadow-lg">
          Rate Captions
        </h1>

        <CaptionCard captions={captions} userId={user.id} />
      </div>
    </main>
  );
}
