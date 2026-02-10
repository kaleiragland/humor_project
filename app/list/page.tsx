import Link from "next/link";
import { supabase } from "../../lib/supabaseClient";

export default async function ListPage() {
  const { data, error } = await supabase.from("bug_reports").select("*");

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-pink-200 via-purple-200 to-sky-200 px-6 py-12 flex items-center justify-center">
      <div className="w-full max-w-4xl rounded-3xl bg-white/80 p-10 shadow-2xl backdrop-blur">
        <h1 className="text-4xl font-extrabold text-zinc-900 mb-6 text-center">
          Bug Reports
        </h1>

        <table className="table-auto border-collapse border border-gray-300 w-full text-left">
          <thead className="bg-purple-100">
            <tr>
              <th className="border border-gray-300 px-4 py-2">ID</th>
              <th className="border border-gray-300 px-4 py-2">Subject</th>
              <th className="border border-gray-300 px-4 py-2">Message</th>
              <th className="border border-gray-300 px-4 py-2">Created</th>
            </tr>
          </thead>
          <tbody>
            {data?.map((row) => (
              <tr key={row.id} className="hover:bg-pink-50 transition">
                <td className="border border-gray-300 px-4 py-2">{row.id}</td>
                <td className="border border-gray-300 px-4 py-2 font-semibold text-purple-700">
                  {row.subject}
                </td>
                <td className="border border-gray-300 px-4 py-2">{row.message}</td>
                <td className="border border-gray-300 px-4 py-2">
                  {new Date(row.created_datetime_utc).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-8 text-center">
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
