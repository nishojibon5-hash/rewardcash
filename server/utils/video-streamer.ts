/**
 * Video Streaming Engine - Extracts video from sources and streams to platforms
 * Supports: YouTube, Bilibili, Facebook, Instagram
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

    // Facebook
    if (hostname.includes("facebook.com")) {
      return {
        streamUrl: videoUrl,
        videoId: videoUrl.split("/").pop() || "video",
        title: `Facebook Video`,
      };
    }

    // Instagram
    if (hostname.includes("instagram.com")) {
      return {
        streamUrl: videoUrl,
        videoId: videoUrl.split("/").pop() || "video",
        title: `Instagram Video`,
      };
    }

    // Direct video file (MP4, WebM, etc.)
    if (/\.(mp4|webm|m3u8|flv|mkv|avi)$/i.test(videoUrl)) {
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
 */
export function generateRTMPDestinations(
  platforms: string[],
  credentials: Map<string, any>
): StreamDestination[] {
  const destinations: StreamDestination[] = [];

  for (const platform of platforms) {
    const cred = credentials.get(platform);
    if (!cred) {
      console.warn(`No credentials found for platform: ${platform}`);
      continue;
    }

    try {
      switch (platform) {
        case "youtube":
          if (cred.streamKey) {
            destinations.push({
              platform: "youtube",
              rtmpUrl: "rtmps://a.rtmp.youtube.com/live2/",
              streamKey: cred.streamKey,
            });
            console.log(`✅ YouTube RTMP destination added`);
          } else {
            console.warn("YouTube streamKey not found");
          }
          break;

        case "facebook":
          if (cred.pageId && cred.accessToken) {
            destinations.push({
              platform: "facebook",
              rtmpUrl: "rtmps://live-api-s.facebook.com:443/rtmp/",
              streamKey: `${cred.pageId}?access_token=${cred.accessToken}`,
            });
            console.log(`✅ Facebook RTMP destination added`);
          } else {
            console.warn("Facebook pageId or accessToken not found");
          }
          break;

        case "bilibili":
          if (cred.streamKey) {
            destinations.push({
              platform: "bilibili",
              rtmpUrl: "rtmp://live-push.bilivideo.com/live-bvc/",
              streamKey: cred.streamKey,
            });
            console.log(`✅ Bilibili RTMP destination added`);
          } else {
            console.warn("Bilibili streamKey not found");
          }
          break;

        case "instagram":
          if (cred.accessToken) {
            destinations.push({
              platform: "instagram",
              rtmpUrl: "rtmps://live-api-s.instagram.com:443/rtmp/",
              streamKey: cred.accessToken,
            });
            console.log(`✅ Instagram RTMP destination added`);
          } else {
            console.warn("Instagram accessToken not found");
          }
          break;

        case "twitch":
          if (cred.streamKey) {
            destinations.push({
              platform: "twitch",
              rtmpUrl: "rtmps://live-api.twitch.tv/app/",
              streamKey: cred.streamKey,
            });
            console.log(`✅ Twitch RTMP destination added`);
          } else {
            console.warn("Twitch streamKey not found");
          }
          break;

        default:
          console.warn(`Unknown platform: ${platform}`);
      }
    } catch (error) {
      console.error(`Error adding ${platform} destination:`, error);
    }
  }

  return destinations;
}

/**
 * Start streaming a video to multiple platforms
 */
export async function startStream(
  streamId: string,
  videoUrl: string,
  platforms: string[],
  credentials: Map<string, any>
): Promise<boolean> {
  try {
    console.log(`🎬 Starting stream ${streamId}...`);

    // Extract video source
    const videoInfo = await extractVideoStream(videoUrl);
    if (!videoInfo) {
      throw new Error("Unable to extract video stream from provided URL");
    }

    console.log(`📹 Video extracted:`, videoInfo.title);

    // Generate RTMP destinations
    const destinations = generateRTMPDestinations(platforms, credentials);
    if (destinations.length === 0) {
      throw new Error("No valid streaming destinations configured");
    }

    console.log(`🎯 Destination platforms: ${destinations.map((d) => d.platform).join(", ")}`);

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

    // Build FFmpeg command with multiple outputs
    const ffmpegArgs: string[] = ["-i", videoInfo.streamUrl];

    // Add re-streaming to each RTMP destination
    for (let i = 0; i < destinations.length; i++) {
      const dest = destinations[i];
      const rtmpUrl = `${dest.rtmpUrl}${dest.streamKey}`;

      // Video codec settings
      ffmpegArgs.push("-c:v", "libx264");
      ffmpegArgs.push("-preset", "veryfast");
      ffmpegArgs.push("-b:v", "4500k");
      ffmpegArgs.push("-maxrate", "4500k");
      ffmpegArgs.push("-bufsize", "9000k");

      // Audio codec settings
      ffmpegArgs.push("-c:a", "aac");
      ffmpegArgs.push("-b:a", "128k");

      // Format and output
      ffmpegArgs.push("-f", "flv");
      ffmpegArgs.push(rtmpUrl);

      console.log(`✅ Added output: ${dest.platform} → ${dest.rtmpUrl}...`);
    }

    console.log(`Running FFmpeg with ${destinations.length} output(s)`);

    // Spawn FFmpeg process
    const proc = spawn("ffmpeg", ffmpegArgs, {
      stdio: ["ignore", "pipe", "pipe"],
    });

    if (!proc) {
      throw new Error("Failed to spawn FFmpeg process");
    }

    session.process = proc;
    session.status = "active";

    let isError = false;

    // Handle process errors
    proc.stderr?.on("data", (data) => {
      const message = data.toString();
      console.log(`[FFmpeg ${streamId}]`, message.trim());

      if (message.toLowerCase().includes("error") && !isError) {
        isError = true;
        session.status = "error";
        session.error = message;
      }
    });

    proc.on("error", (error) => {
      console.error(`FFmpeg process error for ${streamId}:`, error);
      session.status = "error";
      session.error = error.message;
      isError = true;
    });

    proc.on("close", (code) => {
      console.log(`FFmpeg process ${streamId} closed with code ${code}`);
      session.status = code === 0 ? "stopped" : "error";
      activeSessions.delete(streamId);
    });

    console.log(`✅ Stream ${streamId} started successfully`);
    return true;
  } catch (error) {
    console.error(`Failed to start stream ${streamId}:`, error);
    return false;
  }
}

/**
 * Stop streaming
 */
export async function stopStream(streamId: string): Promise<boolean> {
  try {
    const session = activeSessions.get(streamId);
    if (!session) {
      return false;
    }

    if (session.process && !session.process.killed) {
      session.process.kill("SIGINT");
      session.status = "stopping";
      console.log(`Stopping stream ${streamId}`);
      return true;
    }

    return false;
  } catch (error) {
    console.error("Error stopping stream:", error);
    return false;
  }
}

/**
 * Get stream status
 */
export async function getStreamStatus(
  streamId: string
): Promise<Partial<StreamSession> | null> {
  const session = activeSessions.get(streamId);
  if (!session) return null;

  return {
    id: session.id,
    status: session.status,
    platforms: session.platforms,
    bitrate: session.bitrate,
    resolution: session.resolution,
    startTime: session.startTime,
    error: session.error,
  };
}

/**
 * Get all active streams
 */
export async function getActiveStreams(): Promise<Array<Partial<StreamSession>>> {
  const streams = Array.from(activeSessions.values()).map((session) => ({
    id: session.id,
    status: session.status,
    platforms: session.platforms,
    startTime: session.startTime,
  }));

  return streams;
}

/**
 * Check if FFmpeg is available
 */
export async function checkFFmpegAvailable(): Promise<boolean> {
  return new Promise((resolve) => {
    try {
      const proc = spawn("ffmpeg", ["-version"], {
        stdio: ["ignore", "pipe", "pipe"],
      });

      proc.on("close", (code) => {
        resolve(code === 0);
      });

      proc.on("error", () => {
        resolve(false);
      });

      // Timeout after 5 seconds
      setTimeout(() => {
        if (!proc.killed) {
          proc.kill();
        }
        resolve(false);
      }, 5000);
    } catch (error) {
      resolve(false);
    }
  });
}
