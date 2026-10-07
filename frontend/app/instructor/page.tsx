"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { 
  Plus, 
  Video, 
  Calendar, 
  Clock, 
  MapPin, 
  Layers, 
  CheckCircle2, 
  AlertCircle 
} from "lucide-react";

interface ClassData {
  id: number;
  title: string;
  description: string | null;
  scheduledAt: string;
  duration: number | null;
  roomName: string;
  status: string;
  instructor: {
    id: number;
    name: string;
    email: string;
  };
}

interface UserData {
  id: number;
  name: string;
  email: string;
  role: "ADMIN" | "INSTRUCTOR" | "STUDENT";
}

export default function InstructorDashboard() {
  const router = useRouter();

  const [user, setUser] = useState<UserData | null>(null);
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const userResponse = await axios.get(
          "http://localhost:5000/api/auth/me",
          { withCredentials: true }
        );

        const currentUser = userResponse.data.user;

        if (currentUser.role !== "INSTRUCTOR") {
          router.push("/classes");
          return;
        }

        setUser(currentUser);

        // Fetch instructor-specific classes
        const classesResponse = await axios.get(
          "http://localhost:5000/api/classes/instructor",
          { withCredentials: true }
        );

        setClasses(classesResponse.data.classes);
      } catch (err: any) {
        console.error(err);

        if (err.response?.status === 401) {
          router.push("/login");
          return;
        }

        setError(
          err.response?.data?.message || "Failed to load dashboard"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [router]);

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 p-6 md:p-12">
        <div className="mx-auto max-w-6xl animate-pulse">
          <div className="mb-8 h-8 w-64 rounded bg-slate-200" />
          <div className="mb-8 grid gap-4 md:grid-cols-3">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-28 rounded-2xl bg-white p-6 shadow-sm border border-slate-100" />
            ))}
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-slate-50 p-6 md:p-12">
        <div className="mx-auto max-w-xl">
          <div className="flex items-center gap-3 rounded-2xl border border-red-100 bg-red-50 p-6 text-red-700 shadow-sm">
            <AlertCircle className="h-6 w-6 shrink-0" />
            <div>
              <h3 className="font-semibold">Instructor Dashboard Error</h3>
              <p className="text-sm text-red-600 mt-1">{error}</p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  const scheduledCount = classes.filter((item) => item.status === "SCHEDULED").length;
  const completedCount = classes.filter((item) => item.status === "COMPLETED").length;

  return (
    <main className="min-h-screen bg-slate-50/50 p-6 md:p-12">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200/60 pb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              Instructor Dashboard
            </h1>
            {user && (
              <p className="mt-1 text-slate-500">
                Welcome back, <span className="font-medium text-slate-700">{user.name}</span>
              </p>
            )}
          </div>

          <button
            onClick={() => router.push("/instructor/classes/create")}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-blue-700 active:scale-[0.98]"
          >
            <Plus className="h-4 w-4" />
            Create Class
          </button>
        </div>

        {/* Stats */}
        <div className="mb-10 grid gap-5 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-sm font-medium">Total Classes</span>
              <Layers className="h-5 w-5 text-blue-500" />
            </div>
            <p className="text-3xl font-bold tracking-tight text-slate-900">
              {classes.length}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-sm font-medium">Scheduled</span>
              <Calendar className="h-5 w-5 text-emerald-500" />
            </div>
            <p className="text-3xl font-bold tracking-tight text-slate-900">
              {scheduledCount}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-sm font-medium">Completed</span>
              <CheckCircle2 className="h-5 w-5 text-slate-400" />
            </div>
            <p className="text-3xl font-bold tracking-tight text-slate-900">
              {completedCount}
            </p>
          </div>
        </div>

        {/* Classes List */}
        <div>
          <h2 className="mb-6 text-xl font-bold tracking-tight text-slate-900">
            My Classes
          </h2>

          {classes.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center shadow-sm">
              <p className="text-slate-500">
                You haven&apos;t created any classes yet.
              </p>
              <button
                onClick={() => router.push("/instructor/classes/create")}
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
              >
                <Plus className="h-4 w-4" />
                Create Your First Class
              </button>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {classes.map((classItem) => (
                <div
                  key={classItem.id}
                  className="group flex flex-col rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md"
                >
                  <div className="mb-4 flex items-start justify-between">
                    <h3 className="text-lg font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                      {classItem.title}
                    </h3>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 border border-emerald-200/60">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      {classItem.status}
                    </span>
                  </div>

                  <p className="mb-6 flex-1 text-sm text-slate-600 line-clamp-2">
                    {classItem.description || "No description provided for this class."}
                  </p>

                  <div className="mb-6 space-y-2.5 rounded-xl bg-slate-50 p-3.5 text-xs text-slate-600 border border-slate-100">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-slate-400 shrink-0" />
                      <span className="truncate">{new Date(classItem.scheduledAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}</span>
                    </div>
                    {classItem.duration && (
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-slate-400 shrink-0" />
                        <span>{classItem.duration} minutes</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-slate-400 shrink-0" />
                      <span>Room: <strong className="text-slate-800">{classItem.roomName}</strong></span>
                    </div>
                  </div>

                  <button
                    onClick={() => router.push(`/classes/${classItem.id}/live`)}
                    className="inline-flex items-center justify-center gap-2 w-full rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-emerald-700 active:scale-[0.98]"
                  >
                    <Video className="h-4 w-4" />
                    Join Class (Host)
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}