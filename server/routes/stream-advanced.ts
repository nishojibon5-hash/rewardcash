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

/**
 * Connect a platform - Save credentials to Google Sheets
 */
export const handleConnectPlatformAdvanced: RequestHandler = async (
  req,
  res
) => {
  try {
    let platform: string;
    let credentials: Record<string, any>;

    // Handle both formats:
    // 1. { platform, credentials: {...} }
    // 2. { platform, ...credentialFields }
    if (req.body.credentials && typeof req.body.credentials === "object") {
      // Format 1
      platform = req.body.platform;
      credentials = req.body.credentials;
    } else {
      // Format 2 - spread credentials
      const { platform: p, credentials: c, ...rest } = req.body;
      platform = p || req.body.platform;
      credentials = c || rest;
    }

    if (!platform || typeof platform !== "string") {
      return res.status(400).json({ error: "Invalid platform" });
    }

    if (!credentials || typeof credentials !== "object" || Object.keys(credentials).length === 0) {
      return res.status(400).json({ error: "Invalid credentials - please provide required fields" });
    }

    console.log(`🔗 Connecting platform: ${platform}`);
    console.log(`   Credentials: ${Object.keys(credentials).join(", ")}`);

    // Validate platform-specific credentials
    const validated = await validatePlatformCredentials(platform, credentials);
    if (!validated) {
      return res.status(400).json({
        error: `Invalid credentials for ${platform}. Please verify you've provided all required fields.`,
      });
    }

    // Save to Google Sheets and cache
    const saved = await saveCredential({
      platform,
      ...credentials,
      createdAt: new Date().toISOString(),
    });

    if (!saved) {
      return res.status(500).json({
        error: "Failed to save credentials. Please try again.",
      });
    }

    console.log(`✅ Platform ${platform} connected successfully`);

    res.json({
      ok: true,
      platform,
      message: `${platform} connected successfully and credentials saved`,
    });
  } catch (error) {
    console.error("Platform connection error:", error);
    res.status(500).json({
      error: "Failed to connect platform",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * Disconnect a platform - Remove credentials from Google Sheets
 */
export const handleDisconnectPlatformAdvanced: RequestHandler = async (
  req,
  res
) => {
  try {
    const { platform } = req.body;

    if (!platform || typeof platform !== "string") {
      return res.status(400).json({ error: "Invalid platform" });
    }

    // Delete from Google Sheets
    const deleted = await deleteCredential(platform);

    if (!deleted) {
      return res.status(500).json({
        error: "Failed to disconnect platform",
      });
    }

    console.log(`✅ Platform ${platform} disconnected`);

    res.json({
      ok: true,
      platform,
      message: `${platform} disconnected successfully`,
    });
  } catch (error) {
    console.error("Platform disconnection error:", error);
    res.status(500).json({
      error: "Failed to disconnect platform",
    });
  }
};

/**
 * Get connected platforms
 */
export const handleGetConnectedPlatformsAdvanced: RequestHandler = async (
  req,
  res
) => {
  try {
    const credentials = await getAllCredentials();

    const connectedPlatforms = credentials.map((cred: any) => ({
      platform: cred.platform,
      connected: true,
      username: cred.username || cred.email,
      channelId: cred.channelId,
      pageId: cred.pageId,
      createdAt: cred.createdAt,
    }));

    res.json({
      ok: true,
      platforms: connectedPlatforms,
      count: connectedPlatforms.length,
    });
  } catch (error) {
    console.error("Error fetching connected platforms:", error);
    res.status(500).json({
      error: "Failed to fetch connected platforms",
    });
  }
};

/**
 * Start streaming - Broadcast to all connected platforms
 */
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

    console.log(`Starting stream to platforms:`, platforms);

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

      // Validate streaming credentials
      const streamingReady = validateStreamingCredentials(platform, cred);
      if (!streamingReady) {
        return res.status(400).json({
          error: `${platform} credentials invalid. Please reconnect.`,
        });
      }

      credentials.set(platform, cred);
    }

    // Generate stream ID
    const streamId = `stream_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;

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
      return res.status(500).json({
        error:
          "Failed to start stream. Check that FFmpeg is installed and credentials are valid.",
      });
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
      error: "Failed to start stream",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * Stop streaming
 */
export const handleStopStreamAdvanced: RequestHandler = async (req, res) => {
  try {
    const { streamId } = req.body;

    if (!streamId) {
      return res.status(400).json({ error: "Missing streamId" });
    }

    const stopped = await stopStream(streamId);

    if (!stopped) {
      return res.status(404).json({ error: "Stream not found" });
    }

    // Log stream end
    await logStreamEvent({
      streamId,
      videoUrl: "N/A",
      platforms: "N/A",
      status: "stopped",
      endTime: new Date().toISOString(),
    });

    res.json({
      ok: true,
      streamId,
      message: "Stream stopped successfully",
    });
  } catch (error) {
    console.error("Stream stop error:", error);
    res.status(500).json({ error: "Failed to stop stream" });
  }
};

/**
 * Get stream status
 */
export const handleGetStreamStatusAdvanced: RequestHandler = async (
  req,
  res
) => {
  try {
    const { streamId } = req.params;

    if (!streamId) {
      return res.status(400).json({ error: "Missing streamId" });
    }

    const status = await getStreamStatus(streamId);

    if (!status) {
      return res.status(404).json({ error: "Stream not found" });
    }

    res.json({
      ok: true,
      streamId,
      ...status,
    });
  } catch (error) {
    console.error("Stream status error:", error);
    res.status(500).json({ error: "Failed to get stream status" });
  }
};

/**
 * Get active streams
 */
export const handleGetActiveStreamsAdvanced: RequestHandler = async (
  req,
  res
) => {
  try {
    const activeStreams = await getActiveStreams();

    res.json({
      ok: true,
      streams: activeStreams,
      count: activeStreams.length,
    });
  } catch (error) {
    console.error("Active streams error:", error);
    res.status(500).json({ error: "Failed to get active streams" });
  }
};

/**
 * Check FFmpeg availability
 */
export const handleCheckFFmpeg: RequestHandler = async (req, res) => {
  try {
    const available = await checkFFmpegAvailable();

    res.json({
      ok: true,
      ffmpegAvailable: available,
      message: available
        ? "FFmpeg is available on this server"
        : "FFmpeg is not installed on this server",
    });
  } catch (error) {
    res.status(500).json({
      error: "Failed to check FFmpeg availability",
    });
  }
};

/**
 * Extract video from URL
 */
export const handleExtractVideo: RequestHandler = async (req, res) => {
  try {
    const { videoUrl } = req.body;

    if (!videoUrl) {
      return res.status(400).json({ error: "Missing videoUrl" });
    }

    const videoInfo = await extractVideoStream(videoUrl);

    if (!videoInfo) {
      return res.status(400).json({
        error: "Unable to extract video from URL",
      });
    }

    res.json({
      ok: true,
      videoInfo,
    });
  } catch (error) {
    console.error("Video extraction error:", error);
    res.status(500).json({
      error: "Failed to extract video",
    });
  }
};

/**
 * Validate platform-specific credentials
 */
async function validatePlatformCredentials(
  platform: string,
  credentials: any
): Promise<boolean> {
  try {
    switch (platform) {
      case "youtube":
        // YouTube requires channelId and streamKey
        return !!(credentials.channelId && (credentials.streamKey || credentials.apiKey));

      case "facebook":
        // Facebook requires pageId and accessToken
        return !!(credentials.pageId && credentials.accessToken);

      case "bilibili":
        // Bilibili requires streamKey
        return !!credentials.streamKey;

      case "instagram":
        // Instagram requires userId and accessToken
        return !!(credentials.userId && credentials.accessToken);

      default:
        return false;
    }
  } catch (error) {
    console.error(`Validation error for ${platform}:`, error);
    return false;
  }
}

/**
 * Validate credentials for actual streaming
 */
function validateStreamingCredentials(platform: string, credentials: any): boolean {
  try {
    switch (platform) {
      case "youtube":
        return !!(
          credentials.streamKey ||
          (credentials.channelId && credentials.apiKey)
        );

      case "facebook":
        return !!(credentials.pageId && credentials.accessToken);

      case "bilibili":
        return !!credentials.streamKey;

      case "instagram":
        return !!(credentials.userId && credentials.accessToken);

      default:
        return false;
    }
  } catch (error) {
    return false;
  }
}
