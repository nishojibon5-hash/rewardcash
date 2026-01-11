import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Play, Plus, Trash2, Link as LinkIcon } from "lucide-react";
import StreamConnections from "@/components/StreamConnections";
import StreamViewer from "@/components/StreamViewer";

interface Platform {
  id: string;
  name: string;
  icon: string;
  connected: boolean;
  username?: string;
  pageId?: string;
  channelId?: string;
}

interface ActiveStream {
  id: string;
  videoUrl: string;
  platforms: string[];
  status: "idle" | "streaming" | "error";
  startedAt?: number;
  error?: string;
}

export default function Stream() {
  const [videoUrl, setVideoUrl] = useState("");
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [activeStream, setActiveStream] = useState<ActiveStream | null>(null);
  const [showConnections, setShowConnections] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [platforms, setPlatforms] = useState<Platform[]>([
    { id: "youtube", name: "YouTube", icon: "▶️", connected: false },
    { id: "facebook", name: "Facebook", icon: "f", connected: false },
    { id: "bilibili", name: "Bilibili", icon: "哔", connected: false },
    { id: "drive", name: "Google Drive", icon: "☁️", connected: false },
  ]);

  const validateUrl = (url: string): boolean => {
    try {
      new URL(url);
      const lowerUrl = url.toLowerCase();
      return (
        lowerUrl.includes("youtube") ||
        lowerUrl.includes("bilibili") ||
        lowerUrl.includes("facebook") ||
        lowerUrl.includes("drive.google") ||
        lowerUrl.includes("youtu.be") ||
        lowerUrl.match(/\.(mp4|webm|hls|m3u8)$/i)
      );
    } catch {
      return false;
    }
  };

  const handleStartStream = async () => {
    setError(null);

    if (!videoUrl.trim()) {
      setError("Please enter a video URL");
      return;
    }

    if (!validateUrl(videoUrl)) {
      setError(
        "Invalid video URL. Support: YouTube, Bilibili, Facebook, Google Drive, or direct MP4/HLS links"
      );
      return;
    }

    if (selectedPlatforms.length === 0) {
      setError("Please select at least one platform to stream to");
      return;
    }

    const unconnected = selectedPlatforms.filter(
      (p) => !platforms.find((pl) => pl.id === p && pl.connected)
    );

    if (unconnected.length > 0) {
      setError(
        `Please connect the following platforms first: ${unconnected.map((p) => platforms.find((pl) => pl.id === p)?.name).join(", ")}`
      );
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/stream/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          videoUrl,
          platforms: selectedPlatforms,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to start stream");
      }

      setActiveStream({
        id: data.streamId,
        videoUrl,
        platforms: selectedPlatforms,
        status: "streaming",
        startedAt: Date.now(),
      });

      setVideoUrl("");
      setSelectedPlatforms([]);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to start streaming"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleStopStream = async () => {
    if (!activeStream) return;

    try {
      await fetch(`/api/stream/stop`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ streamId: activeStream.id }),
      });

      setActiveStream(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to stop stream"
      );
    }
  };

  const handlePlatformToggle = (platformId: string) => {
    setSelectedPlatforms((prev) =>
      prev.includes(platformId)
        ? prev.filter((p) => p !== platformId)
        : [...prev, platformId]
    );
  };

  const handleConnectPlatform = async (
    platformId: string,
    credentials: Record<string, string>
  ) => {
    try {
      const response = await fetch("/api/stream/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          platform: platformId,
          ...credentials,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Connection failed");
      }

      setPlatforms((prev) =>
        prev.map((p) =>
          p.id === platformId
            ? {
                ...p,
                connected: true,
                username: credentials.username || credentials.channelId,
              }
            : p
        )
      );

      setError(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to connect platform"
      );
    }
  };

  const handleDisconnect = async (platformId: string) => {
    try {
      const response = await fetch("/api/stream/disconnect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ platform: platformId }),
      });

      if (!response.ok) {
        throw new Error("Disconnection failed");
      }

      setPlatforms((prev) =>
        prev.map((p) =>
          p.id === platformId
            ? { ...p, connected: false, username: undefined }
            : p
        )
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to disconnect"
      );
    }
  };

  if (activeStream && activeStream.status === "streaming") {
    return (
      <StreamViewer
        stream={activeStream}
        onStop={handleStopStream}
        onBack={() => setActiveStream(null)}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <section className="p-6 bg-gradient-to-r from-purple-50 via-blue-50 to-cyan-50 rounded-lg border border-purple-100">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-purple-900">
              🎬 Go Stream
            </h1>
            <p className="text-purple-700 mt-2">
              Stream videos from any source to YouTube, Facebook, Bilibili, and
              more — instantly and automatically
            </p>
          </div>
        </div>
      </section>

      {/* Platform Connections */}
      <section className="bg-white rounded-lg border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-slate-900">
            📡 Connected Platforms
          </h2>
          <Button
            onClick={() => setShowConnections(!showConnections)}
            variant="outline"
            className="gap-2"
          >
            <Plus className="w-4 h-4" />
            {showConnections ? "Hide" : "Connect"}
          </Button>
        </div>

        {showConnections && (
          <StreamConnections
            platforms={platforms}
            onConnect={handleConnectPlatform}
            onDisconnect={handleDisconnect}
          />
        )}

        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {platforms.map((platform) => (
            <div
              key={platform.id}
              className={`p-4 rounded-lg border-2 transition ${
                platform.connected
                  ? "border-emerald-300 bg-emerald-50"
                  : "border-slate-200 bg-slate-50"
              }`}
            >
              <div className="text-2xl mb-2">{platform.icon}</div>
              <p className="font-semibold text-sm text-slate-900">
                {platform.name}
              </p>
              {platform.connected ? (
                <>
                  <p className="text-xs text-emerald-600 mt-1">✓ Connected</p>
                  {platform.username && (
                    <p className="text-xs text-slate-600 mt-1 truncate">
                      {platform.username}
                    </p>
                  )}
                  <Button
                    onClick={() => handleDisconnect(platform.id)}
                    size="sm"
                    variant="ghost"
                    className="mt-2 w-full h-6 text-xs"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </>
              ) : (
                <p className="text-xs text-slate-500 mt-1">Not connected</p>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Video URL Input */}
      <section className="bg-white rounded-lg border border-slate-200 p-6">
        <h2 className="text-xl font-bold text-slate-900 mb-4">
          🎥 Video Source
        </h2>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Video URL
            </label>
            <div className="relative">
              <LinkIcon className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
              <Input
                type="url"
                placeholder="Enter video URL (YouTube, Bilibili, Facebook, Google Drive, MP4, HLS...)"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                className="pl-10 bg-white border-slate-300"
              />
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Supports: YouTube, Bilibili, Facebook, Google Drive, Direct MP4,
              HLS Streams
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Stream To (Select Platforms)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {platforms.map((platform) => (
                <button
                  key={platform.id}
                  onClick={() => handlePlatformToggle(platform.id)}
                  disabled={!platform.connected}
                  className={`p-3 rounded-lg border-2 text-sm font-medium transition ${
                    selectedPlatforms.includes(platform.id)
                      ? "border-blue-500 bg-blue-50 text-blue-900"
                      : platform.connected
                        ? "border-slate-200 bg-white hover:border-blue-300"
                        : "border-slate-200 bg-slate-50 text-slate-400 cursor-not-allowed opacity-50"
                  }`}
                >
                  {platform.icon} {platform.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Start Stream Button */}
      <div className="flex gap-3">
        <Button
          onClick={handleStartStream}
          disabled={loading || !videoUrl || selectedPlatforms.length === 0}
          className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold h-12 gap-2"
        >
          <Play className="w-5 h-5" />
          {loading ? "Starting Stream..." : "Start Streaming"}
        </Button>
      </div>

      {/* Info Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-lg border border-blue-200 bg-blue-50">
          <h3 className="font-semibold text-blue-900 mb-2">🚀 No Buffering</h3>
          <p className="text-sm text-blue-700">
            Direct streaming with optimized delivery for smooth playback across
            all platforms
          </p>
        </div>
        <div className="p-4 rounded-lg border border-emerald-200 bg-emerald-50">
          <h3 className="font-semibold text-emerald-900 mb-2">⚡ Multi-Platform</h3>
          <p className="text-sm text-emerald-700">
            Stream simultaneously to YouTube, Facebook, Bilibili, and more from
            a single source
          </p>
        </div>
        <div className="p-4 rounded-lg border border-orange-200 bg-orange-50">
          <h3 className="font-semibold text-orange-900 mb-2">🔐 Secure</h3>
          <p className="text-sm text-orange-700">
            Your credentials are encrypted and used only for streaming. Never
            shared or logged.
          </p>
        </div>
      </section>
    </div>
  );
}
