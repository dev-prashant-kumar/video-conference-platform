"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

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

export default function ClassesPage() {
  const router = useRouter();

  const [classes, setClasses] = useState<ClassData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/api/classes",
          {
            withCredentials: true,
          }
        );

        setClasses(response.data.classes);
      } catch (err) {
        console.error(err);
        setError("Failed to load classes");
      } finally {
        setLoading(false);
      }
    };

    fetchClasses();
  }, []);

  if (loading) {
    return (
      <main className="p-8">
        <h1 className="mb-6 text-2xl font-bold">Classes</h1>
        <p>Loading classes...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="p-8">
        <h1 className="mb-6 text-2xl font-bold">Classes</h1>
        <p className="text-red-500">{error}</p>
      </main>
    );
  }

  return (
    <main className="p-8">
      <h1 className="mb-6 text-2xl font-bold">Available Classes</h1>

      {classes.length === 0 ? (
        <p>No classes available.</p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {classes.map((classItem) => (
            <div
              key={classItem.id}
              className="rounded-xl border p-6 shadow-sm"
            >
              <h2 className="mb-2 text-xl font-semibold">
                {classItem.title}
              </h2>

              <p className="mb-4 text-gray-600">
                {classItem.description || "No description"}
              </p>

              <div className="mb-4 space-y-1 text-sm">
                <p>
                  <strong>Instructor:</strong>{" "}
                  {classItem.instructor.name}
                </p>

                <p>
                  <strong>Date:</strong>{" "}
                  {new Date(classItem.scheduledAt).toLocaleString()}
                </p>

                {classItem.duration && (
                  <p>
                    <strong>Duration:</strong>{" "}
                    {classItem.duration} minutes
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={() =>
                  router.push(`/classes/${classItem.id}/live`)
                }
                className="rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700"
              >
                Join Class
              </button>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}