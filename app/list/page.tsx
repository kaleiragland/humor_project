import Link from "next/link";
import { supabase } from "../../lib/supabaseClient";

export default async function ListPage() {
  const { data, error } = await supabase
    .from("bug_reports")
    .select("*")
    .order("id", { ascending: true }); // Add this line

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-pink-200 via-purple-200 to-sky-200 px-6 py-12 flex items-center justify-center">
      <div className="w-full max-w-6xl rounded-3xl bg-white/80 p-10 shadow-2xl backdrop-blur">
        <h1 className="text-4xl font-extrabold text-zinc-900 mb-8 text-center">
          Bug Reports
        </h1>

        <table className="table-auto border-collapse border-2 border-gray-400 w-full text-left rounded-lg overflow-hidden">
          <thead className="bg-purple-100">
            <tr>
              <th className="border border-gray-300 px-4 py-2">ID</th>
              <th className="border border-gray-300 px-4 py-2">Subject</th>
              <th className="border border-gray-300 px-4 py-2">Message</th>
              <th className="border border-gray-300 px-4 py-2">Created</th>
              <th className="border border-gray-300 px-4 py-2">Modified</th>
              <th className="border border-gray-300 px-4 py-2">Profile ID</th>
            </tr>
          </thead>
          <tbody>
            {data?.map((row) => (
              <tr key={row.id} className="hover:bg-pink-50 transition">
                <td className="border border-gray-300 px-4 py-2">{row.id}</td>
                <td className="border border-gray-300 px-4 py-2 font-semibold text-purple-700">
                  {row.subject || "—"}
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  {row.message || (
                    <span className="text-gray-400 italic">(no message)</span>
                  )}
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  {new Date(row.created_datetime_utc).toLocaleString()}
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  {row.modified_datetime_utc
                    ? new Date(row.modified_datetime_utc).toLocaleString()
                    : "—"}
                </td>
                <td className="border border-gray-300 px-4 py-2 text-xs text-zinc-600">
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
        </div>
      </div>
    </main>
  );
}
