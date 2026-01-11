import { RequestHandler } from "express";

// In-memory storage for active streams and platform connections
// In production, use a proper database
const activeStreams = new Map<
  string,
  {
    id: string;
    videoUrl: string;
    platforms: string[];
    status: "streaming" | "stopped" | "error";
    startedAt: number;
    streamKey?: string;
  }
>();

const platformConnections = new Map<
  string,
  {
    platform: string;
    credentials: Record<string, string>;
    connectedAt: number;
  }
>();

// Validate video URL supports streaming
const isValidStreamUrl = (url: string): boolean => {
  const lowerUrl = url.toLowerCase();
  const supportedSources = [
    "youtube",
    "youtu.be",
    "bilibili",
    "facebook",
    "drive.google",
    ".mp4",
    ".webm",
    ".m3u8",
    ".hls",
    ".flv",
  ];
  return supportedSources.some((source) => lowerUrl.includes(source));
};

// Generate unique stream ID
const generateStreamId = (): string => {
  return `stream_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Start a stream to multiple platforms
export const handleStartStream: RequestHandler = async (req, res) => {
  const { videoUrl, platforms } = req.body;

  try {
    // Validate input
    if (!videoUrl || typeof videoUrl !== "string") {
      return res
        .status(400)
        .json({ error: "Invalid or missing videoUrl" });
    }

    if (
      !platforms ||
      !Array.isArray(platforms) ||
      platforms.length === 0
    ) {
      return res
        .status(400)
        .json({ error: "Please select at least one platform" });
    }

    // Validate URL
    if (!isValidStreamUrl(videoUrl)) {
      return res.status(400).json({
        error:
          "Unsupported video source. Supported: YouTube, Bilibili, Facebook, Google Drive, MP4, HLS",
      });
    }

    // Verify all platforms are connected
    const unconnectedPlatforms = platforms.filter(
      (p: string) => !platformConnections.has(p)
    );

    if (unconnectedPlatforms.length > 0) {
      return res.status(400).json({
        error: `The following platforms are not connected: ${unconnectedPlatforms.join(", ")}`,
      });
    }

    // Create new stream
    const streamId = generateStreamId();
    const stream = {
      id: streamId,
      videoUrl,
      platforms,
      status: "streaming" as const,
      startedAt: Date.now(),
      streamKey: `sk_${streamId}`,
    };

    activeStreams.set(streamId, stream);

    // Simulate platform streaming initialization
    // In production, this would call actual streaming APIs
    console.log(`Stream ${streamId} started on platforms: ${platforms.join(", ")}`);

    res.json({
      ok: true,
      streamId,
      message: `Stream started successfully on ${platforms.join(", ")}`,
    });
  } catch (error) {
    console.error("Stream start error:", error);
    res
      .status(500)
      .json({ error: "Failed to start stream" });
  }
};

// Stop an active stream
export const handleStopStream: RequestHandler = async (req, res) => {
  const { streamId } = req.body;

  try {
    if (!streamId || typeof streamId !== "string") {
      return res
        .status(400)
        .json({ error: "Invalid or missing streamId" });
    }

    const stream = activeStreams.get(streamId);

    if (!stream) {
      return res
        .status(404)
        .json({ error: "Stream not found" });
    }

    // Update stream status
    stream.status = "stopped";

    console.log(`Stream ${streamId} stopped`);

    res.json({
      ok: true,
      message: "Stream stopped successfully",
    });
  } catch (error) {
    console.error("Stream stop error:", error);
    res
      .status(500)
      .json({ error: "Failed to stop stream" });
  }
};

// Connect a social media platform
export const handleConnectPlatform: RequestHandler = async (req, res) => {
  const { platform, ...credentials } = req.body;

  try {
    if (!platform || typeof platform !== "string") {
      return res
        .status(400)
        .json({ error: "Invalid or missing platform" });
    }

    // Validate required credentials based on platform
    const requiredFields: Record<string, string[]> = {
      youtube: ["channelId", "apiKey"],
      facebook: ["pageId", "accessToken"],
      bilibili: ["username", "streamKey"],
      drive: ["email", "serviceAccount"],
    };

    const required = requiredFields[platform];
    if (!required) {
      return res
        .status(400)
        .json({ error: `Unsupported platform: ${platform}` });
    }

    const missing = required.filter((field) => !credentials[field]);
    if (missing.length > 0) {
      return res
        .status(400)
        .json({
          error: `Missing required fields: ${missing.join(", ")}`,
        });
    }

    // Validate credentials format based on platform
    if (
      platform === "youtube" &&
      !credentials.channelId.startsWith("UC")
    ) {
      return res
        .status(400)
        .json({ error: "Invalid YouTube Channel ID format" });
    }

    if (platform === "facebook" && !/^\d+$/.test(credentials.pageId)) {
      return res
        .status(400)
        .json({ error: "Invalid Facebook Page ID format" });
    }

    // In production, verify credentials with actual API
    // For now, just store them
    platformConnections.set(platform, {
      platform,
      credentials,
      connectedAt: Date.now(),
    });

    console.log(`Platform ${platform} connected with credentials`);

    res.json({
      ok: true,
      message: `Successfully connected to ${platform}`,
      platform,
    });
  } catch (error) {
    console.error("Platform connection error:", error);
    res
      .status(500)
      .json({ error: "Failed to connect platform" });
  }
};

// Disconnect a platform
export const handleDisconnectPlatform: RequestHandler = async (
  req,
  res
) => {
  const { platform } = req.body;

  try {
    if (!platform || typeof platform !== "string") {
      return res
        .status(400)
        .json({ error: "Invalid or missing platform" });
    }

    if (!platformConnections.has(platform)) {
      return res
        .status(404)
        .json({ error: "Platform not connected" });
    }

    platformConnections.delete(platform);

    console.log(`Platform ${platform} disconnected`);

    res.json({
      ok: true,
      message: `Disconnected from ${platform}`,
    });
  } catch (error) {
    console.error("Platform disconnection error:", error);
    res
      .status(500)
      .json({ error: "Failed to disconnect platform" });
  }
};

// Get stream status
export const handleGetStreamStatus: RequestHandler = async (
  req,
  res
) => {
  const { streamId } = req.params;

  try {
    if (!streamId) {
      return res
        .status(400)
        .json({ error: "Missing streamId parameter" });
    }

    const stream = activeStreams.get(streamId);

    if (!stream) {
      return res
        .status(404)
        .json({ error: "Stream not found" });
    }

    const duration = Math.floor((Date.now() - stream.startedAt) / 1000);

    res.json({
      ok: true,
      stream: {
        ...stream,
        duration,
      },
    });
  } catch (error) {
    console.error("Get stream status error:", error);
    res
      .status(500)
      .json({ error: "Failed to get stream status" });
  }
};

// Get all active streams
export const handleGetActiveStreams: RequestHandler = async (
  req,
  res
) => {
  try {
    const streams = Array.from(activeStreams.values()).map((stream) => ({
      ...stream,
      duration: Math.floor((Date.now() - stream.startedAt) / 1000),
    }));

    res.json({
      ok: true,
      streams,
      count: streams.length,
    });
  } catch (error) {
    console.error("Get active streams error:", error);
    res
      .status(500)
      .json({ error: "Failed to get active streams" });
  }
};

// Get connected platforms
export const handleGetConnectedPlatforms: RequestHandler = async (
  req,
  res
) => {
  try {
    const platforms = Array.from(platformConnections.keys());

    res.json({
      ok: true,
      platforms,
      count: platforms.length,
    });
  } catch (error) {
    console.error("Get connected platforms error:", error);
    res
      .status(500)
      .json({ error: "Failed to get connected platforms" });
  }
};
