/**
 * Client-side FFmpeg using WebAssembly
 * Works on mobile without any server setup
 * No FFmpeg installation needed
 */

let FFmpegInstance: any = null;
let isFFmpegReady = false;

/**
 * Load FFmpeg.js library (from CDN)
 */
export async function loadFFmpeg(): Promise<boolean> {
  try {
    // Check if already loaded
    if (isFFmpegReady && FFmpegInstance) {
      return true;
    }

    // Load FFmpeg library from CDN
    const script = document.createElement("script");
    script.src =
      "https://cdn.jsdelivr.net/npm/@ffmpeg/ffmpeg@0.12.10/dist/ffmpeg.min.js";
    script.async = true;

    return new Promise((resolve) => {
      script.onload = async () => {
        try {
          // Wait for FFmpeg to be available
          if (typeof window === "undefined") {
            resolve(false);
            return;
          }

          const FFmpeg = (window as any).FFmpeg?.FFmpeg;
          if (!FFmpeg) {
            console.warn("FFmpeg library loaded but not available in window");
            resolve(false);
            return;
          }

          FFmpegInstance = new FFmpeg();

          // Initialize
          await FFmpegInstance.load();
          isFFmpegReady = true;

          console.log("✅ FFmpeg.js loaded and ready (client-side)");
          resolve(true);
        } catch (error) {
          console.error("Failed to initialize FFmpeg:", error);
          resolve(false);
        }
      };

      script.onerror = () => {
        console.error("Failed to load FFmpeg script from CDN");
        resolve(false);
      };

      document.head.appendChild(script);
    });
  } catch (error) {
    console.error("Error loading FFmpeg:", error);
    return false;
  }
}

/**
 * Check if FFmpeg is available in browser
 */
export function isFFmpegAvailable(): boolean {
  return isFFmpegReady && FFmpegInstance !== null;
}

/**
 * Extract video stream (client-side)
 */
export async function extractVideoStreamClient(
  videoUrl: string
): Promise<Blob | null> {
  try {
    if (!isFFmpegAvailable()) {
      const loaded = await loadFFmpeg();
      if (!loaded) {
        throw new Error("FFmpeg not available");
      }
    }

    console.log("Extracting video stream:", videoUrl);

    // Fetch the video
    const response = await fetch(videoUrl);
    const videoBlob = await response.blob();

    // Write to FFmpeg
    await FFmpegInstance.writeFile("input.mp4", new Uint8Array(await videoBlob.arrayBuffer()));

    // Run FFmpeg command to transcode
    // This creates an HLS stream (m3u8) which works on all platforms
    await FFmpegInstance.exec([
      "-i",
      "input.mp4",
      "-c:v",
      "libx264",
      "-preset",
      "veryfast",
      "-b:v",
      "2500k",
      "-c:a",
      "aac",
      "-b:a",
      "128k",
      "-f",
      "hls",
      "-hls_time",
      "10",
      "-hls_list_size",
      "0",
      "output.m3u8",
    ]);

    // Read the output
    const data = await FFmpegInstance.readFile("output.m3u8");
    return new Blob([data.buffer], { type: "application/vnd.apple.mpegurl" });
  } catch (error) {
    console.error("Error extracting video with FFmpeg:", error);
    return null;
  }
}

/**
 * Convert video for streaming (client-side processing)
 */
export async function convertVideoForStreaming(
  inputBlob: Blob,
  onProgress?: (progress: number) => void
): Promise<Blob | null> {
  try {
    if (!isFFmpegAvailable()) {
      const loaded = await loadFFmpeg();
      if (!loaded) {
        throw new Error("FFmpeg not available");
      }
    }

    const inputArray = new Uint8Array(await inputBlob.arrayBuffer());
    await FFmpegInstance.writeFile("input", inputArray);

    // Listen to progress
    if (onProgress) {
      FFmpegInstance.on("progress", (progress: any) => {
        onProgress(Math.round(progress.progress * 100));
      });
    }

    // Transcode to H.264 + AAC (compatible with all platforms)
    await FFmpegInstance.exec([
      "-i",
      "input",
      "-c:v",
      "libx264",
      "-preset",
      "fast",
      "-b:v",
      "4500k",
      "-c:a",
      "aac",
      "-b:a",
      "128k",
      "-f",
      "mpegts",
      "output.ts",
    ]);

    // Get result
    const outputData = await FFmpegInstance.readFile("output.ts");
    return new Blob([outputData.buffer], {
      type: "video/mp2t",
    });
  } catch (error) {
    console.error("Error converting video:", error);
    return null;
  }
}

/**
 * Create HLS stream from video (for multi-platform broadcasting)
 */
export async function createHLSStream(
  inputBlob: Blob,
  onProgress?: (progress: number) => void
): Promise<{ m3u8: Blob; segments: Map<string, Blob> } | null> {
  try {
    if (!isFFmpegAvailable()) {
      const loaded = await loadFFmpeg();
      if (!loaded) {
        throw new Error("FFmpeg not available");
      }
    }

    const inputArray = new Uint8Array(await inputBlob.arrayBuffer());
    await FFmpegInstance.writeFile("input.mp4", inputArray);

    if (onProgress) {
      FFmpegInstance.on("progress", (progress: any) => {
        onProgress(Math.round(progress.progress * 100));
      });
    }

    // Create HLS stream
    await FFmpegInstance.exec([
      "-i",
      "input.mp4",
      "-c:v",
      "libx264",
      "-preset",
      "veryfast",
      "-b:v",
      "2500k",
      "-c:a",
      "aac",
      "-b:a",
      "128k",
      "-f",
      "hls",
      "-hls_time",
      "4",
      "-hls_list_size",
      "0",
      "output.m3u8",
    ]);

    // Read all generated files
    const m3u8Data = await FFmpegInstance.readFile("output.m3u8");
    const m3u8Blob = new Blob([m3u8Data.buffer], {
      type: "application/vnd.apple.mpegurl",
    });

    const segments = new Map<string, Blob>();

    // Try to read segment files (usually output0.ts, output1.ts, etc.)
    for (let i = 0; i < 100; i++) {
      try {
        const segmentData = await FFmpegInstance.readFile(
          `output${i}.ts`
        );
        if (segmentData) {
          segments.set(`output${i}.ts`, new Blob([segmentData.buffer]));
        }
      } catch {
        // No more segments
        break;
      }
    }

    return { m3u8: m3u8Blob, segments };
  } catch (error) {
    console.error("Error creating HLS stream:", error);
    return null;
  }
}

/**
 * Get FFmpeg version info
 */
export async function getFFmpegInfo(): Promise<string> {
  try {
    if (!isFFmpegAvailable()) {
      return "FFmpeg not available";
    }
    return "FFmpeg WASM - Client-side processing";
  } catch {
    return "Unknown";
  }
}

/**
 * Cleanup FFmpeg resources
 */
export function cleanupFFmpeg() {
  if (FFmpegInstance) {
    FFmpegInstance = null;
    isFFmpegReady = false;
  }
}
