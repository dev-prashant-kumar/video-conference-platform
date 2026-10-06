"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import { JitsiMeeting } from "@jitsi/react-sdk";
import { Loader2, AlertCircle, ArrowLeft, Video } from "lucide-react";

interface MeetingData {
  roomName: string;
  scheduledAt: string;
  duration: number | null;
}

export default function LiveClassPage() {
  const params = useParams();
  const router = useRouter();

  const id = params.id as string;

  const [meeting, setMeeting] = useState<MeetingData | null>(null);
  const [userName, setUserName] = useState<string>("Class Participant");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const joinClass = async () => {
      try {
        // Optional: If you have an endpoint that returns user profile info along with join data
        // You can fetch user info here or from a global auth state context if available.
        const response = await axios.post(
          `http://localhost:5000/api/classes/${id}/join`,
          {},
          { withCredentials: true }
        );

        setMeeting(response.data.meeting);
        if (response.data.user?.name) {
          setUserName(response.data.user.name);
        }
      } catch (err: any) {
        console.error("Join class error:", err);
        setError(
          err.response?.data?.message || "Unable to join this class session. Please check your access."
        );
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      joinClass();
    }
  }, [id]);

  if (loading) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-slate-50 via-indigo-50/30 to-slate-100 p-6">
        <div className="w-full max-w-sm rounded-2xl bg-white/80 backdrop-blur-xl border border-white/20 p-8 text-center shadow-xl shadow-indigo-500/10">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600/10 text-indigo-600">
            <Loader2 className="h-7 w-7 animate-spin" />
          </div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">
            Loading Classroom...
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Verifying authentication and connecting to secure server
          </p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-red-50/20 to-slate-100 p-6">
        <div className="w-full max-w-md rounded-2xl bg-white/80 backdrop-blur-xl border border-red-100 p-8 text-center shadow-xl shadow-red-500/5">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-100 text-red-600">
            <AlertCircle className="h-7 w-7" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Unable to Join
          </h1>
          <p className="mt-2 mb-6 text-sm text-slate-500">
            {error}
          </p>
          <button
            type="button"
            onClick={() => router.push("/classes")}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 py-3.5 px-4 text-sm font-semibold text-white shadow-lg shadow-slate-900/20 transition-all hover:bg-slate-800 active:scale-[0.98]"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Classes</span>
          </button>
        </div>
      </main>
    );
  }

  if (!meeting) {
    return null;
  }

  return (
    <main className="relative h-screen w-screen bg-slate-950 overflow-hidden">
      <JitsiMeeting
        domain="meet.jit.si"
        roomName={meeting.roomName}
        getIFrameRef={(iframeRef) => {
          iframeRef.style.height = "100%";
          iframeRef.style.width = "100%";
          iframeRef.style.backgroundColor = "#020617";
        }}
        configOverwrite={{
          startWithAudioMuted: false,
          startWithVideoMuted: false,
          prejoinPageEnabled: true,
          disableModeratorIndicator: true,
        }}
        interfaceConfigOverwrite={{
          TOOLBAR_BUTTONS: [
            "microphone",
            "camera",
            "closedcaptions",
            "desktop",
            "fullscreen",
            "fodeviceselection",
            "hangup",
            "chat",
            "raisehand",
            "videoquality",
            "filmstrip",
            "participants-pane",
          ],
        }}
        userInfo={{
          displayName: userName,
        }}
        onReadyToClose={() => {
          router.push("/classes");
        }}
      />
    </main>
  );
}