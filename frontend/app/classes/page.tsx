"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { 
  Calendar, 
  Clock, 
  User, 
  MapPin, 
  Video, 
  CheckCircle2, 
  Loader2, 
  BookOpen,
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

export default function ClassesPage() {
  const router = useRouter();

  const [classes, setClasses] = useState<ClassData[]>([]);
  const [user, setUser] = useState<UserData | null>(null);

  const [loading, setLoading] = useState(true);
  const [registeringId, setRegisteringId] = useState<number | null>(null);
  const [registeredClasses, setRegisteredClasses] = useState<number[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userResponse = await axios.get(
          "http://localhost:5000/api/auth/me",
          { withCredentials: true }
        );
        const currentUser = userResponse.data.user;
        setUser(currentUser);

        const classesResponse = await axios.get(
          "http://localhost:5000/api/classes",
          { withCredentials: true }
        );
        setClasses(classesResponse.data.classes);

        if (currentUser.role === "STUDENT") {
          try {
            const registeredResponse = await axios.get(
              "http://localhost:5000/api/classes/registered",
              { withCredentials: true }
            );

            const registrationsArray = registeredResponse.data.registrations || [];
            const registeredIds = registrationsArray
              .map((item: any) => item.class?.id)
              .filter(Boolean);

            setRegisteredClasses(registeredIds);
          } catch (err) {
            console.error("Failed to load registered classes:", err);
          }
        }
      } catch (err: any) {
        console.error("Failed to load classes:", err);
        if (err.response?.status === 401) {
          router.push("/login");
          return;
        }
        setError(err.response?.data?.message || "Failed to load classes");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  const handleRegister = async (classId: number) => {
    try {
      setRegisteringId(classId);
      await axios.post(
        `http://localhost:5000/api/classes/${classId}/register`,
        {},
        { withCredentials: true }
      );
      setRegisteredClasses((prev) => [...prev, classId]);
    } catch (err: any) {
      console.error("Registration error:", err);

      if (err.response?.status === 409) {
        setRegisteredClasses((prev) => 
          prev.includes(classId) ? prev : [...prev, classId]
        );
        return;
      }

      alert(err.response?.data?.message || "Failed to register for the class");
    } finally {
      setRegisteringId(null);
    }
  };

  const handleJoin = (classId: number) => {
    router.push(`/classes/${classId}/live`);
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 p-6 md:p-12">
        <div className="mx-auto max-w-7xl animate-pulse">
          <div className="mb-8 h-8 w-48 rounded bg-slate-200" />
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-64 rounded-2xl bg-white p-6 shadow-sm border border-slate-100" />
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
              <h3 className="font-semibold">Unable to load classes</h3>
              <p className="text-sm text-red-600 mt-1">{error}</p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50/50 p-6 md:p-12">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200/60 pb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              Available Classes
            </h1>
            {user && (
              <p className="mt-1 text-slate-500">
                Welcome back, <span className="font-medium text-slate-700">{user.name}</span>
              </p>
            )}
          </div>

          {user && (
            <div className="self-start sm:self-auto inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-1.5 text-xs font-semibold tracking-wide text-white shadow-sm">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              {user.role}
            </div>
          )}
        </div>

        {/* Content */}
        {classes.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center shadow-sm">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-500 mb-4">
              <BookOpen className="h-6 w-6" />
            </div>
            <h2 className="text-lg font-semibold text-slate-900">
              No classes available
            </h2>
            <p className="mt-1 text-sm text-slate-500 max-w-sm mx-auto">
              There are currently no scheduled classes. Check back later for updates from your instructors.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {classes.map((classItem) => {
              const isRegistered = registeredClasses.includes(classItem.id);

              return (
                <div
                  key={classItem.id}
                  className="group relative flex flex-col rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md"
                >
                  {/* Top Status & Room */}
                  <div className="mb-4 flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 border border-emerald-200/60">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      {classItem.status}
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs text-slate-500 font-medium">
                      <MapPin className="h-3.5 w-3.5 text-slate-400" />
                      {classItem.roomName}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <h2 className="text-lg font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                    {classItem.title}
                  </h2>
                  <p className="mt-2 mb-6 flex-1 text-sm text-slate-600 line-clamp-2">
                    {classItem.description || "No description provided for this class."}
                  </p>

                  {/* Class Meta info */}
                  <div className="mb-6 space-y-2.5 rounded-xl bg-slate-50 p-3.5 text-xs text-slate-600 border border-slate-100">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-slate-400 shrink-0" />
                      <span className="truncate">Instructor: <strong className="text-slate-800">{classItem.instructor.name}</strong></span>
                    </div>
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
                  </div>

                  {/* Action Buttons */}
                  {user?.role === "STUDENT" ? (
                    isRegistered ? (
                      <button
                        type="button"
                        onClick={() => handleJoin(classItem.id)}
                        className="inline-flex items-center justify-center gap-2 w-full rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-emerald-700 active:scale-[0.98]"
                      >
                        <Video className="h-4 w-4" />
                        Join Class
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleRegister(classItem.id)}
                        disabled={registeringId === classItem.id}
                        className="inline-flex items-center justify-center gap-2 w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-blue-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {registeringId === classItem.id ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Registering...
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="h-4 w-4" />
                            Register Now
                          </>
                        )}
                      </button>
                    )
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleJoin(classItem.id)}
                      className="inline-flex items-center justify-center gap-2 w-full rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-emerald-700 active:scale-[0.98]"
                    >
                      <Video className="h-4 w-4" />
                      Join Class (Host)
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}