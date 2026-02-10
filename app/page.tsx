import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-pink-200 via-purple-200 to-sky-200 px-6">
      <div className="w-full max-w-md rounded-3xl bg-white/80 p-10 text-center shadow-2xl backdrop-blur">
        <h1 className="text-5xl font-extrabold tracking-tight text-zinc-900">
          Hello World <span className="inline-block"></span>
        </h1>

        <p className="mt-4 text-lg text-zinc-700">👋</p>

        <div className="mt-8 flex justify-center gap-3">
          <Link
            href="/list"
            className="rounded-full bg-pink-100 px-4 py-2 text-sm font-semibold text-pink-700 hover:bg-pink-200 transition"
          >
            Go to Bug Reports
          </Link>
        </div>
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
