# Deployment Guide for Live Streaming System

This guide explains how to deploy the complete live streaming application to Vercel.

## Prerequisites

- GitHub account with the repository pushed
- Vercel account (free tier is sufficient)
- Google Sheets API key and Sheet ID (already provided)

## Step 1: Push Code to GitHub

Before deploying, push the code to GitHub:

```bash
git add .
git commit -m "Final: Live streaming system ready for Vercel"
git push origin main
```

## Step 2: Configure Environment Variables on Vercel

Your Vercel project needs these environment variables to work correctly:

### Required Variables

1. **GOOGLE_SHEETS_ID** (provided)
   ```
   1uxGAQVxd91wg_RtsXG7n3-PRj-bxluKi-4td_UJ6h8U
   ```

2. **GOOGLE_SHEETS_API_KEY** (provided)
   ```
   AIzaSyCMweTAOcZmWvtlNm89RxI4bCKIsufpfiA
   ```

3. **PING_MESSAGE** (optional)
   ```
   pong
   ```

### How to Set Environment Variables on Vercel

1. Go to your Vercel project dashboard
2. Click on **Settings** tab
3. Select **Environment Variables** from the left sidebar
4. Add each variable:
   - Name: `GOOGLE_SHEETS_ID`
   - Value: `1uxGAQVxd91wg_RtsXG7n3-PRj-bxluKi-4td_UJ6h8U`
   - Click **Save**

5. Repeat for `GOOGLE_SHEETS_API_KEY` and `PING_MESSAGE`

## Step 3: Deploy on Vercel

### Option A: Automatic Deployment (Recommended)

1. Connect your GitHub repository to Vercel:
   - Visit https://vercel.com
   - Click "New Project"
   - Select your GitHub repository
   - Framework: **Other** (auto-detected)
   - Build Command: `pnpm build`
   - Output Directory: `dist/spa`
   - Install the Vercel GitHub App if prompted

2. Set environment variables (as described in Step 2)

3. Click **Deploy** - Vercel will build and deploy automatically

### Option B: Manual Deployment via CLI

```bash
npm install -g vercel
vercel login
vercel --prod
```

Then follow prompts to set environment variables.

## Step 4: Verify Deployment

After deployment:

1. Visit your Vercel app URL
2. Navigate to `/stream` page
3. You should see:
   - Video URL input field
   - Platform selection (YouTube, Facebook, Bilibili, Google Drive)
   - Stream control buttons

## System Architecture Overview

### Frontend (React + Vite)
- **Main Page**: `/` (Index.tsx) - Landing page
- **Stream Page**: `/stream` (Stream.tsx) - Live streaming dashboard
- **Admin Page**: `/admin` (Admin.tsx) - Dashboard and metrics

### Backend (Express.js)
- **Streaming API**: `/api/stream/*` - Handles video extraction and RTMP streaming
- **Metrics API**: `/api/metrics/*` - Tracks usage statistics
- **Health Check**: `/api/ping` - Service status

### Data Storage (Google Sheets - No Database Required)
- **Credentials Tab**: Stores YouTube/Facebook/Bilibili credentials securely
- **StreamLogs Tab**: Maintains history of all streaming events
- **Cost**: Completely free (no additional services needed)

## Features

### Video Sources Supported
- ✅ YouTube URLs
- ✅ Facebook video links
- ✅ Bilibili videos
- ✅ Google Drive videos
- ✅ Direct MP4/HLS streams

### Broadcasting Platforms
- ✅ YouTube RTMP streaming
- ✅ Facebook Live streaming
- ✅ Multi-platform simultaneous broadcasting

### Processing Methods
1. **Browser FFmpeg (WASM)** - Recommended for mobile
   - Works on mobile phones without installation
   - Transcoding happens in your browser
   - No server-side processing needed for simple streams

2. **Server FFmpeg** - For complex processing
   - Fallback if browser processing fails
   - Available on Vercel serverless functions
   - Used for advanced video manipulation

3. **Direct Passthrough** - Maximum compatibility
   - No transcoding needed
   - Works with most RTMP-compatible sources

## Security Notes

⚠️ **Important**: Your Google API key is visible in the code. For production:

1. **API Key Restrictions** (Recommended)
   - Go to https://console.cloud.google.com/apis/credentials
   - Edit your API key
   - Set restrictions to only Google Sheets API
   - Restrict to your Vercel domains

2. **Monitor Usage**
   - Google Sheets has free quotas (10,000 read/write per minute per user)
   - Check usage in Google Cloud Console
   - Most streaming use cases won't exceed limits

3. **Best Practices**
   - Don't share credentials in public repositories
   - Use different API keys for different environments
   - Regularly audit API key usage

## Troubleshooting

### 504 Gateway Timeout on Stream Start
- **Cause**: Video URL parsing taking too long
- **Solution**: Ensure FFmpeg is properly loaded. Check browser console logs.

### "Unable to extract video" error
- **Cause**: URL format not supported or video is private
- **Solution**: 
  - Ensure video is public/unlisted (not private)
  - Try a direct RTMP URL instead
  - Check video platform support

### Credentials not saving
- **Cause**: Google Sheets API key not properly configured
- **Solution**:
  - Verify environment variables are set on Vercel
  - Restart your Vercel deployment
  - Check browser console for API errors

### Mobile FFmpeg not loading
- **Cause**: Browser doesn't support WebAssembly
- **Solution**:
  - Use modern browser (Chrome 74+, Firefox 79+)
  - System will automatically fall back to server processing

## Post-Deployment Checklist

- [ ] Environment variables are set on Vercel
- [ ] Build completes without errors
- [ ] `/stream` page loads
- [ ] Can input video URLs
- [ ] Can select platforms
- [ ] Can see streaming method detected
- [ ] Credentials can be saved (if connected)
- [ ] Metrics page (`/admin`) shows visitor counts

## Storage & Data

### No External Database Required
This system is completely self-contained:
- ✅ Google Sheets for credential storage (free)
- ✅ In-memory cache for session data
- ✅ No database setup needed
- ✅ No additional hosting costs

### Optional: Recording Streams to Google Drive
If you want to **save/record** live streams to Google Drive:
1. Create a Google Drive folder
2. Share it with: `database@database-484104.iam.gserviceaccount.com`
3. Add a `GOOGLE_DRIVE_FOLDER_ID` environment variable
4. Streamed videos will automatically save to that folder

**Note**: For now, this is optional. The system works perfectly without it.

## Next Steps

1. Push code to GitHub
2. Set environment variables on Vercel
3. Vercel will automatically build and deploy
4. Share your app URL with others
5. Start broadcasting!

## Support

For issues or questions:
- Check browser console logs (F12)
- Review `/STREAMING_COMPLETE.md` for technical details
- Check Vercel deployment logs for backend errors

---

**Your app is production-ready!** 🚀
