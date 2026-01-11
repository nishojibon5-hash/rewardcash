# 🎬 Video Streaming System - Complete Setup Guide

This guide explains how to set up the complete video restreaming system that broadcasts video from any source (YouTube, Bilibili, Facebook, Google Drive) to multiple platforms simultaneously.

## 📋 What You Can Do

- ✅ Stream YouTube videos to Facebook & YouTube simultaneously
- ✅ Stream Bilibili videos to Facebook & YouTube  
- ✅ Stream Google Drive videos to Facebook & YouTube
- ✅ Stream direct MP4/HLS files to all platforms
- ✅ Monitor streaming status in real-time
- ✅ Store all credentials securely in Google Sheets
- ✅ Completely FREE - no costs, all open-source

## 🔧 System Architecture

```
Video Source (YouTube/Bilibili/Google Drive)
           ↓
    FFmpeg Extractor & Transcoder
           ↓
   Multi-Platform RTMP Broadcaster
    ↙            ↓           ↘
YouTube      Facebook      Bilibili
```

---

## 📖 Step-by-Step Setup

### Step 1: Install FFmpeg (Required for streaming)

FFmpeg is the core that enables video extraction and streaming.

**Linux/Ubuntu:**
```bash
sudo apt-get update
sudo apt-get install ffmpeg
ffmpeg -version  # Verify installation
```

**macOS (with Homebrew):**
```bash
brew install ffmpeg
ffmpeg -version
```

**Windows:**
1. Download from: https://ffmpeg.org/download.html
2. Extract to `C:\ffmpeg`
3. Add to PATH environment variable
4. Verify: `ffmpeg -version` in Command Prompt

**Docker (if using Docker):**
Add to your Dockerfile:
```dockerfile
RUN apt-get update && apt-get install -y ffmpeg
```

---

### Step 2: Set Up Google Sheets for Credential Storage (Optional but Recommended)

This stores your platform credentials securely and persistently.

#### 2a. Create Google Sheet

1. Go to https://sheets.google.com
2. Create a new spreadsheet named "Streaming Credentials"
3. Create two sheets:
   - **Sheet 1**: Rename to "Credentials"
   - **Sheet 2**: Rename to "StreamLogs"
4. Add headers to Credentials sheet:
   ```
   A1: platform
   B1: username
   C1: channelId
   D1: accessToken
   E1: rtmpUrl
   F1: createdAt
   ```
5. Add headers to StreamLogs sheet:
   ```
   A1: streamId
   B1: videoUrl
   C1: platforms
   D1: status
   E1: startTime
   F1: endTime
   G1: error
   ```
6. Copy the Sheet ID from the URL:
   ```
   https://docs.google.com/spreadsheets/d/{SHEET_ID}/edit
   ```

#### 2b. Get Google Sheets API Key

1. Go to https://console.cloud.google.com/
2. Create a new project
3. Enable "Google Sheets API"
4. Create an API Key:
   - Click "Create Credentials" → "API Key"
   - Copy the key
5. Set environment variables:
   ```
   GOOGLE_SHEETS_ID=your_sheet_id_here
   GOOGLE_SHEETS_API_KEY=your_api_key_here
   ```

**Note:** Without these, the system uses in-memory storage (credentials lost on restart).

---

### Step 3: Configure Streaming Platforms

You need to get credentials from each platform you want to stream to.

#### YouTube Live Streaming

1. Go to https://www.youtube.com/live_dashboard
2. Click "Create Stream"
3. Copy:
   - **Channel ID**: From your profile settings
   - **Stream Key**: From the live dashboard
4. You'll also need a YouTube API Key:
   - Go to https://console.cloud.google.com/apis/credentials
   - Create an API Key
5. Save in streaming dashboard:
   ```
   Platform: YouTube
   Channel ID: UC_xxx_your_channel_id
   API Key: AIzaSy...
   Stream Key: xxxx-xxxx-xxxx-xxxx
   ```

#### Facebook Live

1. Go to https://www.facebook.com/live/setup
2. Copy:
   - **Page ID**: Go to page → About → find Page ID
   - **Access Token**: Generate from Facebook Developer Console
3. Save in streaming dashboard:
   ```
   Platform: Facebook
   Page ID: 123456789
   Access Token: EAABsBL1iHgC0BAAAA...
   ```

#### Bilibili Live

1. Go to https://live.bilibili.com/user/profile
2. Start a live stream session
3. Copy:
   - **Username**: Your Bilibili username
   - **Stream Key**: From the live dashboard
4. Save in streaming dashboard:
   ```
   Platform: Bilibili
   Username: your_username
   Stream Key: ?roomid=xxxx&key=xxxx
   ```

---

## 🚀 How to Use the System

### Access Streaming Dashboard

1. Open your app in browser
2. Click the **"🎬 Go Stream"** button in the header
3. You'll see the streaming dashboard

### Connect Platforms

1. Click **"Connect"** button to reveal platform configuration
2. For each platform (YouTube, Facebook, Bilibili):
   - Enter the required credentials
   - Click "Connect"
   - Wait for confirmation
3. Connected platforms show ✓ with green highlight

### Start Streaming

1. Enter a **Video URL** from:
   - YouTube: `https://www.youtube.com/watch?v=...`
   - Bilibili: `https://www.bilibili.com/video/BV...`
   - Google Drive: `https://drive.google.com/file/d/.../`
   - Direct MP4: `https://example.com/video.mp4`
   - HLS Stream: `https://example.com/stream.m3u8`

2. **Select Platforms** to stream to:
   - YouTube ☑
   - Facebook ☑
   - Bilibili ☑

3. Click **"Start Streaming"** button

4. Wait for stream to become **"Active"**

5. Monitor:
   - Streaming duration
   - Estimated viewer count
   - Stream health (bitrate, latency)
   - Platform status

6. Click **"Stop Streaming"** when done

---

## 🔌 API Endpoints Reference

### Start Stream
```bash
POST /api/stream/start
{
  "videoUrl": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  "platforms": ["youtube", "facebook"],
  "sessionId": "optional-session-id"
}
```

### Stop Stream
```bash
POST /api/stream/stop
{
  "streamId": "stream_1234567890_abc123"
}
```

### Connect Platform
```bash
POST /api/stream/connect
{
  "platform": "youtube",
  "channelId": "UC_xxxxx",
  "apiKey": "AIzaSy..."
}
```

### Get Connected Platforms
```bash
GET /api/stream/platforms/connected
```

### Get Stream Status
```bash
GET /api/stream/:streamId
```

### Extract Video Info
```bash
POST /api/stream/extract
{
  "videoUrl": "https://www.youtube.com/watch?v=..."
}
```

### Check FFmpeg
```bash
GET /api/stream/check-ffmpeg
```

---

## ⚙️ Environment Variables

Create a `.env` file in the root directory:

```env
# Google Sheets Integration (Optional)
GOOGLE_SHEETS_ID=your_sheet_id_here
GOOGLE_SHEETS_API_KEY=your_api_key_here

# Development
NODE_ENV=development
DEBUG=true
```

---

## 🛠️ Troubleshooting

### "FFmpeg not found"
- **Windows**: Add FFmpeg to PATH environment variable
- **Mac**: Run `brew install ffmpeg`
- **Linux**: Run `sudo apt-get install ffmpeg`

### "Platform not configured"
- Make sure you've clicked "Connect" for the platform
- Credentials must be filled in completely
- Check that credentials are correct

### "Video URL extraction failed"
- Ensure the URL is publicly accessible
- YouTube/Bilibili might require public/unlisted videos
- Try a direct MP4 URL instead

### "Stream won't start"
- Check FFmpeg is installed: Visit `/api/stream/check-ffmpeg`
- Verify credentials are connected for all selected platforms
- Check internet connection bandwidth (need min 5 Mbps)

### Credentials Lost on Restart
- Set up Google Sheets integration (Step 2 above)
- Without it, credentials are cached in memory only

---

## 🔐 Security Notes

- Credentials are NOT logged or exposed
- API keys and tokens are encrypted during transmission
- Never share your Stream Keys or Access Tokens
- Use environment variables for all secrets
- Regenerate tokens if accidentally exposed

---

## 📊 Monitoring Streams

The dashboard shows:
- **Status**: Streaming active/stopped
- **Duration**: How long stream has been running
- **Viewers**: Estimated real-time viewer count
- **Bitrate**: Video quality (4500 kbps = 1080p60)
- **Latency**: Stream delay to platforms (~2-3s normal)

---

## 💡 Tips for Best Results

1. **Bandwidth**: Ensure minimum 5 Mbps upload speed
2. **CPU**: Stream uses significant CPU - limit other tasks
3. **Bitrate**: 4500 kbps optimal for 1080p 60fps
4. **Platform Limits**:
   - YouTube: Needs verification, then unlimited
   - Facebook: Limited for new accounts, grows with engagement
   - Bilibili: Requires account with stream permission
5. **Test First**: Always test with a short dummy stream before going live

---

## 📚 Additional Resources

- FFmpeg Docs: https://ffmpeg.org/documentation.html
- YouTube Live API: https://developers.google.com/youtube/v3/live
- Facebook Graph API: https://developers.facebook.com/docs/graph-api
- Bilibili API: https://github.com/SocialSisterYi/bilibili-API-collect

---

## 🎯 Next Steps

1. Install FFmpeg
2. Set up Google Sheets (optional)
3. Configure streaming platforms
4. Go to app and click "🎬 Go Stream"
5. Connect your first platform
6. Start streaming!

---

**Questions?** Check the logs or review this guide's troubleshooting section.

**Ready to stream?** Click that "🎬 Go Stream" button! 🚀
