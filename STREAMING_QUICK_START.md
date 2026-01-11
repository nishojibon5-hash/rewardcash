# 🎬 Streaming System - Quick Start (5 Minutes)

## The Fastest Way to Get Streaming Working

### 1️⃣ Install FFmpeg (2 minutes)

```bash
# Linux/Ubuntu
sudo apt-get update && sudo apt-get install ffmpeg

# macOS
brew install ffmpeg

# Windows - Download from https://ffmpeg.org/download.html
```

Verify: `ffmpeg -version`

### 2️⃣ Get Platform Credentials (2 minutes each platform)

Pick ONE platform to start:

**YouTube:**
- Go to https://www.youtube.com/live_dashboard
- Copy your Stream Key
- Note: Needs channel ID (in settings)

**Facebook:**
- Go to https://www.facebook.com/live/setup
- Get your Page ID and Access Token

**Bilibili:**
- Go to https://live.bilibili.com/user/profile
- Start a stream, get Stream Key

### 3️⃣ Start Streaming (1 minute)

1. Click **"🎬 Go Stream"** button in app header
2. Click **"Connect"** for your platform
3. Enter your credentials
4. Paste a video URL (YouTube, Bilibili, Google Drive, or MP4)
5. Select platform
6. Click **"Start Streaming"**
7. Done! ✅

---

## Video URL Examples

```
YouTube:      https://www.youtube.com/watch?v=dQw4w9WgXcQ
Bilibili:     https://www.bilibili.com/video/BV1xx411c7mD
Google Drive: https://drive.google.com/file/d/1xxx/view
MP4 Direct:   https://example.com/video.mp4
HLS Stream:   https://example.com/stream.m3u8
```

---

## What Happens After "Start Streaming"?

✅ FFmpeg extracts the video from source
✅ Transcodes to 1080p 4500kbps
✅ Streams to all selected platforms
✅ Shows real-time status
✅ Stops when you click "Stop"

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| FFmpeg not found | Install FFmpeg (see step 1) |
| Credentials rejected | Double-check from platform dashboard |
| Stream won't start | Check FFmpeg: visit `/api/stream/check-ffmpeg` |
| No FFmpeg in Docker | Add `RUN apt-get install ffmpeg` to Dockerfile |

---

## Optional: Persistent Storage

To keep credentials after restart, set environment variables:

```bash
export GOOGLE_SHEETS_ID=your_sheet_id
export GOOGLE_SHEETS_API_KEY=your_api_key
```

See `STREAMING_SETUP.md` for detailed Google Sheets setup.

---

## That's It! 🚀

You now have a professional video streaming system that can:
- 📺 Broadcast YouTube to Facebook & Bilibili
- 🎥 Stream any video source to multiple platforms
- ⚡ Handle 1080p60 quality
- 🔒 Store credentials securely
- 💯 100% free, completely open source

**Ready?** Click "Go Stream" and start broadcasting! 🎬
