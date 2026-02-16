import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import SignOutButton from "@/app/components/SignOutButton";

export default async function ListPage() {
  const supabase = await createClient();
  
  // Check if user is authenticated
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect('/');
  }

  const { data, error } = await supabase
    .from("bug_reports")
    .select("*")
    .order("id", { ascending: true });

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-pink-200 via-purple-200 to-sky-200 px-6 py-12 flex items-center justify-center">
      <div className="w-full max-w-6xl rounded-3xl bg-white/80 p-10 shadow-2xl backdrop-blur">
        <div className="flex justify-end mb-2">
          <div className="text-sm text-zinc-700">
            Signed in as: <span className="font-semibold">{user.email}</span>
          </div>
        </div>
        
        <h1 className="text-4xl font-extrabold text-zinc-900 mb-8 text-center">
          Bug Reports
        </h1>

        <table className="table-auto border-collapse border-2 border-gray-400 w-full text-left rounded-lg overflow-hidden shadow-lg">
          <thead className="bg-purple-100">
            <tr>
              <th className="border border-gray-300 px-4 py-2" style={{ color: '#000' }}>ID</th>
              <th className="border border-gray-300 px-4 py-2" style={{ color: '#000' }}>Subject</th>
              <th className="border border-gray-300 px-4 py-2" style={{ color: '#000' }}>Message</th>
              <th className="border border-gray-300 px-4 py-2" style={{ color: '#000' }}>Created</th>
              <th className="border border-gray-300 px-4 py-2" style={{ color: '#000' }}>Modified</th>
              <th className="border border-gray-300 px-4 py-2" style={{ color: '#000' }}>Profile ID</th>
            </tr>
          </thead>
          <tbody className="bg-white">
            {data?.map((row) => (
              <tr key={row.id} className="hover:bg-pink-50 transition">
                <td className="border border-gray-300 px-4 py-2" style={{ color: '#000' }}>{row.id}</td>
                <td className="border border-gray-300 px-4 py-2 font-semibold text-purple-700">
                  {row.subject || "—"}
                </td>
                <td className="border border-gray-300 px-4 py-2" style={{ color: '#000' }}>
                  {row.message || (
                    <span className="italic" style={{ color: '#666' }}>(no message)</span>
                  )}
                </td>
                <td className="border border-gray-300 px-4 py-2" style={{ color: '#000' }}>
                  {new Date(row.created_datetime_utc).toLocaleString()}
                </td>
                <td className="border border-gray-300 px-4 py-2" style={{ color: '#000' }}>
                  {row.modified_datetime_utc
                    ? new Date(row.modified_datetime_utc).toLocaleString()
                    : "—"}
                </td>
                <td className="border border-gray-300 px-4 py-2 text-xs" style={{ color: '#333' }}>
                  {row.profile_id || "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-10 flex justify-center gap-4">
          <Link
            href="/"
            className="inline-block rounded-full bg-sky-100 px-6 py-2 text-sm font-semibold text-sky-700 hover:bg-sky-200 transition"
          >
            ⬅ Back to Home
          </Link>
          <SignOutButton />
        </div>
      </div>
    </main>
  );
}
