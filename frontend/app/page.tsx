import Image from "next/image";

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold">
          Video Conference Platform
        </h1>

        <p className="mt-4 text-gray-600">
          Online classes and live seminars
        </p>

        <div className="mt-6 flex gap-4 justify-center">
          <a
            href="/login"
            className="rounded-lg bg-black px-5 py-3 text-white"
          >
            Login
          </a>

          <a
            href="/register"
            className="rounded-lg border px-5 py-3"
          >
            Register
          </a>
        </div>
      </div>
    </main>
  );
}