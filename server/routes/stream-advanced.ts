import { RequestHandler } from "express";
import {
  startStream,
  stopStream,
  getStreamStatus,
  getActiveStreams,
  extractVideoStream,
  checkFFmpegAvailable,
} from "../utils/video-streamer";
import {
  saveCredential,
  getCredential,
  getAllCredentials,
  deleteCredential,
  logStreamEvent,
  getStreamLogs,
  initializeGoogleSheets,
} from "../utils/google-sheets";

// Initialize Google Sheets on startup
initializeGoogleSheets();

interface StreamingCredentials {
  [platform: string]: any;
}

// In-memory storage for session credentials
const sessionCredentials = new Map<string, StreamingCredentials>();

export const handleStartStreamAdvanced: RequestHandler = async (req, res) => {
  const { videoUrl, platforms, sessionId } = req.body;

  try {
    if (!videoUrl || typeof videoUrl !== "string") {
      return res.status(400).json({ error: "Invalid or missing videoUrl" });
    }

    if (!platforms || !Array.isArray(platforms) || platforms.length === 0) {
      return res
        .status(400)
        .json({ error: "Please select at least one platform" });
    }

    // Validate video URL
    const videoInfo = await extractVideoStream(videoUrl);
    if (!videoInfo) {
      return res.status(400).json({
        error:
          "Unable to extract video. Supported: YouTube, Bilibili, Facebook, Google Drive, Direct MP4/HLS",
      });
    }

    // Get credentials for selected platforms
    const credentials = new Map<string, any>();
    for (const platform of platforms) {
      const cred = await getCredential(platform);
      if (!cred) {
        return res.status(400).json({
          error: `Platform ${platform} not configured. Please connect first.`,
        });
      }
      credentials.set(platform, cred);
    }

    // Generate stream ID
    const streamId = `stream_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Store session credentials
    const sessionCreds: StreamingCredentials = {};
    for (const [platform, cred] of credentials) {
      sessionCreds[platform] = cred;
    }
    sessionCredentials.set(sessionId || streamId, sessionCreds);

    // Log stream event
    await logStreamEvent({
      streamId,
      videoUrl,
      platforms: platforms.join(","),
      status: "active",
      startTime: new Date().toISOString(),
    });

    // Start streaming
    const success = await startStream(streamId, videoUrl, platforms, credentials);

    if (!success) {
      return res.status(500).json({ error: "Failed to start stream" });
    }

    res.json({
      ok: true,
      streamId,
      sessionId: sessionId || streamId,
      videoInfo,
      message: `Stream started successfully. Broadcasting to ${platforms.join(", ")}`,
    });
  } catch (error) {
    console.error("Stream start error:", error);
    res.status(500).json({
      error: error instanceof Error ? error.message : "Failed to start stream",
    });
  }
};

export const handleStopStreamAdvanced: RequestHandler = async (req, res) => {
  const { streamId } = req.body;

  try {
    if (!streamId || typeof streamId !== "string") {
      return res.status(400).json({ error: "Invalid or missing streamId" });
    }

    const stream = getStreamStatus(streamId);
    if (!stream) {
      return res.status(404).json({ error: "Stream not found" });
    }

    // Stop the stream
    const success = await stopStream(streamId);

    if (!success) {
      return res.status(500).json({ error: "Failed to stop stream" });
    }

    // Log stream end
    await logStreamEvent({
      streamId,
      videoUrl: stream.videoUrl,
      platforms: stream.platforms.join(","),
      status: "stopped",
      endTime: new Date().toISOString(),
    });

    res.json({
      ok: true,
      message: "Stream stopped successfully",
      duration: Math.floor((Date.now() - stream.startTime) / 1000),
    });
  } catch (error) {
    console.error("Stream stop error:", error);
    res.status(500).json({
      error: error instanceof Error ? error.message : "Failed to stop stream",
    });
  }
};

export const handleConnectPlatformAdvanced: RequestHandler = async (
  req,
  res
) => {
  const { platform, ...credentials } = req.body;

  try {
    if (!platform || typeof platform !== "string") {
      return res.status(400).json({ error: "Invalid or missing platform" });
    }

    // Validate credentials
    const requiredFields: Record<string, string[]> = {
      youtube: ["channelId", "apiKey"],
      facebook: ["pageId", "accessToken"],
      bilibili: ["username", "streamKey"],
      twitch: ["streamKey"],
    };

    const required = requiredFields[platform];
    if (!required) {
      return res.status(400).json({ error: `Unsupported platform: ${platform}` });
    }

    const missing = required.filter((field) => !credentials[field]);
    if (missing.length > 0) {
      return res.status(400).json({
        error: `Missing required fields: ${missing.join(", ")}`,
      });
    }

    // Save to Google Sheets
    const saved = await saveCredential({
      platform,
      ...credentials,
      createdAt: new Date().toISOString(),
    });

    if (!saved) {
      return res.status(500).json({
        error: "Failed to save credentials. Check your Google Sheets setup.",
      });
    }

    res.json({
      ok: true,
      message: `Successfully connected to ${platform}`,
      platform,
    });
  } catch (error) {
    console.error("Platform connection error:", error);
    res.status(500).json({
      error: error instanceof Error ? error.message : "Failed to connect platform",
    });
  }
};

export const handleDisconnectPlatformAdvanced: RequestHandler = async (
  req,
  res
) => {
  const { platform } = req.body;

  try {
    if (!platform || typeof platform !== "string") {
      return res.status(400).json({ error: "Invalid or missing platform" });
    }

    const success = await deleteCredential(platform);

    if (!success) {
      return res.status(404).json({ error: "Platform not connected" });
    }

    res.json({
      ok: true,
      message: `Disconnected from ${platform}`,
    });
  } catch (error) {
    console.error("Platform disconnection error:", error);
    res.status(500).json({
      error: error instanceof Error ? error.message : "Failed to disconnect platform",
    });
  }
};

export const handleGetStreamStatusAdvanced: RequestHandler = async (
  req,
  res
) => {
  const { streamId } = req.params;

  try {
    if (!streamId) {
      return res.status(400).json({ error: "Missing streamId parameter" });
    }

    const stream = getStreamStatus(streamId);
    if (!stream) {
      return res.status(404).json({ error: "Stream not found" });
    }

    const logs = await getStreamLogs(streamId);

    res.json({
      ok: true,
      stream: {
        ...stream,
        duration: Math.floor((Date.now() - stream.startTime) / 1000),
      },
      logs,
    });
  } catch (error) {
    console.error("Get stream status error:", error);
    res.status(500).json({
      error: error instanceof Error ? error.message : "Failed to get stream status",
    });
  }
};

export const handleGetActiveStreamsAdvanced: RequestHandler = async (
  req,
  res
) => {
  try {
    const streams = getActiveStreams().map((stream) => ({
      ...stream,
      duration: Math.floor((Date.now() - stream.startTime) / 1000),
    }));

    res.json({
      ok: true,
      streams,
      count: streams.length,
    });
  } catch (error) {
    console.error("Get active streams error:", error);
    res.status(500).json({
      error: error instanceof Error ? error.message : "Failed to get active streams",
    });
  }
};

export const handleGetConnectedPlatformsAdvanced: RequestHandler = async (
  req,
  res
) => {
  try {
    const credentials = await getAllCredentials();
    const platforms = credentials.map((c: any) => ({
      platform: c.platform,
      username: c.username,
      channelId: c.channelId,
      connectedAt: c.updatedAt,
    }));

    res.json({
      ok: true,
      platforms,
      count: platforms.length,
    });
  } catch (error) {
    console.error("Get connected platforms error:", error);
    res.status(500).json({
      error: error instanceof Error ? error.message : "Failed to get connected platforms",
    });
  }
};

export const handleCheckFFmpeg: RequestHandler = async (req, res) => {
  try {
    const available = await checkFFmpegAvailable();

    if (!available) {
      return res.json({
        ok: false,
        ffmpegAvailable: false,
        message:
          "FFmpeg not installed. Install it to enable streaming. For Docker, add: RUN apt-get install ffmpeg",
      });
    }

    res.json({
      ok: true,
      ffmpegAvailable: true,
      message: "FFmpeg is available and ready for streaming",
    });
  } catch (error) {
    res.json({
      ok: false,
      ffmpegAvailable: false,
      error: error instanceof Error ? error.message : "Failed to check FFmpeg",
    });
  }
};

export const handleExtractVideo: RequestHandler = async (req, res) => {
  const { videoUrl } = req.body;

  try {
    if (!videoUrl) {
      return res.status(400).json({ error: "Video URL required" });
    }

    const videoInfo = await extractVideoStream(videoUrl);
    if (!videoInfo) {
      return res.status(400).json({
        error:
          "Unable to extract video. Check the URL is valid and from a supported source.",
      });
    }

    res.json({
      ok: true,
      videoInfo,
    });
  } catch (error) {
    console.error("Video extraction error:", error);
    res.status(500).json({
      error: error instanceof Error ? error.message : "Failed to extract video",
    });
  }
};
