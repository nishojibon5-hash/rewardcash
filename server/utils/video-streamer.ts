/**
 * Video Streaming Engine - Extracts video from sources and streams to platforms
 * Supports: YouTube, Bilibili, Facebook, Google Drive
 */

import { ChildProcess, spawn } from "child_process";

interface StreamSession {
  id: string;
  videoUrl: string;
  platforms: string[];
  process?: ChildProcess;
  status: "starting" | "active" | "stopping" | "stopped" | "error";
  bitrate: string;
  resolution: string;
  startTime: number;
  error?: string;
}

interface StreamDestination {
  platform: string;
  rtmpUrl: string;
  streamKey: string;
}

const activeSessions = new Map<string, StreamSession>();

/**
 * Extract video stream URL from various sources
 */
export async function extractVideoStream(
  videoUrl: string
): Promise<{
  streamUrl: string;
  videoId: string;
  title: string;
} | null> {
  try {
    const url = new URL(videoUrl);
    const hostname = url.hostname.toLowerCase();

    // YouTube
    if (
      hostname.includes("youtube.com") ||
      hostname.includes("youtu.be")
    ) {
      let videoId = "";
      if (hostname.includes("youtu.be")) {
        videoId = url.pathname.slice(1);
      } else {
        videoId = url.searchParams.get("v") || "";
      }

      if (!videoId) return null;

      return {
        streamUrl: `https://www.youtube.com/watch?v=${videoId}`,
        videoId,
        title: `YouTube Video - ${videoId}`,
      };
    }

    // Bilibili
    if (hostname.includes("bilibili.com")) {
      const bvMatch = url.pathname.match(/\/video\/(BV\w+)/);
      if (!bvMatch) return null;

      const bv = bvMatch[1];
      return {
        streamUrl: `https://www.bilibili.com/video/${bv}`,
        videoId: bv,
        title: `Bilibili Video - ${bv}`,
      };
    }

    // Google Drive
    if (hostname.includes("drive.google.com")) {
      const fileIdMatch = url.pathname.match(/\/d\/([a-zA-Z0-9-_]+)/);
      if (!fileIdMatch) return null;

      const fileId = fileIdMatch[1];
      return {
        streamUrl: `https://drive.google.com/uc?export=download&id=${fileId}`,
        videoId: fileId,
        title: `Google Drive Video - ${fileId}`,
      };
    }

    // Direct video file (MP4, WebM, etc.)
    if (
      /\.(mp4|webm|m3u8|flv|mkv|avi)$/i.test(videoUrl)
    ) {
      return {
        streamUrl: videoUrl,
        videoId: videoUrl.split("/").pop() || "video",
        title: `Direct Video - ${videoUrl.split("/").pop()}`,
      };
    }

    return null;
  } catch (error) {
    console.error("Error extracting video stream:", error);
    return null;
  }
}

/**
 * Generate RTMP stream keys for various platforms
 * In production, these would come from platform APIs
 */
export function generateRTMPDestinations(
  platforms: string[],
  credentials: Map<string, any>
): StreamDestination[] {
  const destinations: StreamDestination[] = [];

  for (const platform of platforms) {
    const cred = credentials.get(platform);
    if (!cred) continue;

    switch (platform) {
      case "youtube":
        destinations.push({
          platform: "youtube",
          rtmpUrl: "rtmps://a.rtmp.youtube.com/live2",
          streamKey: cred.streamKey || cred.accessToken || "",
        });
        break;

      case "facebook":
        destinations.push({
          platform: "facebook",
          rtmpUrl: "rtmps://live-api-s.facebook.com:443/rtmp/",
          streamKey: `${cred.pageId}?access_token=${cred.accessToken}`,
        });
        break;

      case "bilibili":
        destinations.push({
          platform: "bilibili",
          rtmpUrl: "rtmp://live-push.bilivideo.com/live-bvc/",
          streamKey: cred.streamKey || "",
        });
        break;

      case "twitch":
        destinations.push({
          platform: "twitch",
          rtmpUrl: "rtmps://live-api.twitch.tv/app",
          streamKey: cred.streamKey || cred.accessToken || "",
        });
        break;
    }
  }

  return destinations;
}

/**
 * Start streaming a video to multiple platforms
 * Uses ffmpeg under the hood (needs to be installed on system)
 */
export async function startStream(
  streamId: string,
  videoUrl: string,
  platforms: string[],
  credentials: Map<string, any>
): Promise<boolean> {
  try {
    // Extract video source
    const videoInfo = await extractVideoStream(videoUrl);
    if (!videoInfo) {
      throw new Error("Unable to extract video stream from provided URL");
    }

    // Generate RTMP destinations
    const destinations = generateRTMPDestinations(
      platforms,
      credentials
    );
    if (destinations.length === 0) {
      throw new Error("No valid streaming destinations configured");
    }

    // Create session
    const session: StreamSession = {
      id: streamId,
      videoUrl,
      platforms,
      status: "starting",
      bitrate: "4500k",
      resolution: "1080p",
      startTime: Date.now(),
    };

    activeSessions.set(streamId, session);

    // Build FFmpeg command
    let ffmpegCmd =
      `ffmpeg -i "${videoInfo.streamUrl}" -c:v libx264 -preset veryfast ` +
      `-b:v 4500k -maxrate 4500k -bufsize 9000k -c:a aac -b:a 128k ` +
      `-f flv`;

    // Add RTMP outputs
    for (const dest of destinations) {
      const rtmpUrl = `${dest.rtmpUrl}${dest.streamKey}`;
      ffmpegCmd += ` "${rtmpUrl}"`;
    }

    console.log(`Starting stream ${streamId} with command:`, ffmpegCmd);

    // Spawn FFmpeg process
    const proc = spawn("ffmpeg", [
      "-i",
      videoInfo.streamUrl,
      "-c:v",
      "libx264",
      "-preset",
      "veryfast",
      "-b:v",
      "4500k",
      "-maxrate",
      "4500k",
      "-bufsize",
      "9000k",
      "-c:a",
      "aac",
      "-b:a",
      "128k",
      "-f",
      "flv",
      ...destinations.flatMap((d) => [
        "-f",
        "flv",
        `${d.rtmpUrl}${d.streamKey}`,
      ]),
    ]);

    session.process = proc;
    session.status = "active";

    // Handle process errors
    proc.stderr?.on("data", (data) => {
      const message = data.toString();
      console.log(`FFmpeg ${streamId}:`, message);

      if (message.includes("error") || message.includes("Error")) {
        session.status = "error";
        session.error = message;
      }
    });

    proc.on("close", (code) => {
      session.status = "stopped";
      console.log(`Stream ${streamId} ended with code ${code}`);
    });

    proc.on("error", (error) => {
      session.status = "error";
      session.error = error.message;
      console.error(`Stream ${streamId} error:`, error);
    });

    return true;
  } catch (error) {
    const session = activeSessions.get(streamId);
    if (session) {
      session.status = "error";
      session.error =
        error instanceof Error ? error.message : "Unknown error";
    }
    console.error(`Failed to start stream ${streamId}:`, error);
    return false;
  }
}

/**
 * Stop an active stream
 */
export async function stopStream(streamId: string): Promise<boolean> {
  try {
    const session = activeSessions.get(streamId);
    if (!session || !session.process) {
      return false;
    }

    session.status = "stopping";

    // Send SIGTERM to FFmpeg process
    if (session.process && !session.process.killed) {
      session.process.kill("SIGTERM");

      // Wait a bit, then force kill if necessary
      await new Promise((resolve) => setTimeout(resolve, 5000));
      if (session.process && !session.process.killed) {
        session.process.kill("SIGKILL");
      }
    }

    session.status = "stopped";
    return true;
  } catch (error) {
    console.error(`Failed to stop stream ${streamId}:`, error);
    return false;
  }
}

/**
 * Get stream status
 */
export function getStreamStatus(
  streamId: string
): StreamSession | null {
  return activeSessions.get(streamId) || null;
}

/**
 * Get all active streams
 */
export function getActiveStreams(): StreamSession[] {
  return Array.from(activeSessions.values()).filter(
    (s) => s.status === "active"
  );
}

/**
 * Check if FFmpeg is available
 */
export async function checkFFmpegAvailable(): Promise<boolean> {
  return new Promise((resolve) => {
    const proc = spawn("ffmpeg", ["-version"]);
    proc.on("error", () => resolve(false));
    proc.on("close", (code) => resolve(code === 0));
  });
}
