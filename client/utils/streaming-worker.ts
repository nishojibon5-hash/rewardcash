/**
 * Streaming Method Detection and Management
 * Works on both mobile and desktop
 */

export interface StreamingMethod {
  type: "wasm" | "ffmpeg" | "passthrough";
  name: string;
  supportsClient: boolean;
  supportsServer: boolean;
  description: string;
}

export const STREAMING_METHODS: Record<string, StreamingMethod> = {
  WASM_FFMPEG: {
    type: "wasm",
    name: "Browser FFmpeg (WebAssembly)",
    supportsClient: true,
    supportsServer: false,
    description:
      "Pure client-side FFmpeg in browser - works on mobile without server",
  },

  SERVER_FFMPEG: {
    type: "ffmpeg",
    name: "Server FFmpeg",
    supportsClient: false,
    supportsServer: true,
    description: "Server-side FFmpeg - requires FFmpeg installed on server",
  },

  PASSTHROUGH: {
    type: "passthrough",
    name: "Direct Stream",
    supportsClient: true,
    supportsServer: true,
    description:
      "Stream directly without transcoding - fastest, lowest quality",
  },
};

/**
 * Detect best streaming method based on platform
 */
export function detectStreamingMethod(
  isServer: boolean,
  ffmpegAvailable: boolean
): StreamingMethod {
  // Server-side: prefer server FFmpeg
  if (isServer) {
    if (ffmpegAvailable) {
      return STREAMING_METHODS.SERVER_FFMPEG;
    }
    return STREAMING_METHODS.PASSTHROUGH;
  }

  // Client-side (mobile/desktop browser)
  // Try WebAssembly FFmpeg first
  if (typeof window !== "undefined" && "Worker" in window) {
    return STREAMING_METHODS.WASM_FFMPEG;
  }

  // Fallback to passthrough
  return STREAMING_METHODS.PASSTHROUGH;
}

/**
 * Check if FFmpeg is available on server
 */
export async function checkFFmpegAvailable(): Promise<boolean> {
  try {
    const response = await fetch("/api/stream/check-ffmpeg");
    const data = await response.json();
    return data.ffmpegAvailable === true;
  } catch {
    return false;
  }
}

/**
 * Get recommended streaming method
 */
export async function getRecommendedMethod(): Promise<StreamingMethod> {
  const isServer = typeof window === "undefined";
  const ffmpegAvailable = await checkFFmpegAvailable();
  return detectStreamingMethod(isServer, ffmpegAvailable);
}

/**
 * Extract video metadata
 */
export async function extractVideoMetadata(
  videoUrl: string
): Promise<{
  title: string;
  duration?: number;
  resolution?: string;
  format?: string;
} | null> {
  try {
    const response = await fetch("/api/stream/extract", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ videoUrl }),
    });

    const data = await response.json();
    return data.videoInfo || null;
  } catch {
    return null;
  }
}
