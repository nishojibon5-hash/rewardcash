# Google Drive Storage for Recording Streams

## Quick Answer

**Do you need Google Drive information to use the app?** ❌ **NO**

Your streaming system works perfectly without any Google Drive configuration.

---

## What You Already Have (Working Out of the Box)

✅ **Video Sources** - You can input videos from:
- YouTube
- Facebook
- Bilibili  
- Google Drive (read-only)
- Direct MP4/HLS streams

✅ **Broadcasting** - You can broadcast to:
- YouTube (RTMP)
- Facebook (RTMP)
- Multiple platforms simultaneously

✅ **Data Storage** - All credentials and logs are stored in Google Sheets (already configured)

---

## When You Might Need Google Drive (Optional)

### Use Case: Recording/Saving Broadcast Streams

If you want to **automatically save the live broadcast** to Google Drive as an MP4 file after streaming ends:

1. Create a Google Drive folder for recordings
2. Share it with: `database@database-484104.iam.gserviceaccount.com`
3. Get the folder ID from the URL: `https://drive.google.com/drive/folders/{FOLDER_ID}`
4. Add to Vercel environment variables:
   ```
   GOOGLE_DRIVE_FOLDER_ID=your-folder-id-here
   ```
5. Restart your Vercel deployment

**Result**: Streamed videos automatically save to your Google Drive folder

---

## How to Set Up Google Drive Recording (If Interested)

### Step 1: Create a Google Drive Folder

1. Open Google Drive
2. Right-click → **New Folder**
3. Name it (e.g., "Stream Recordings")
4. Open it and copy the folder ID from the URL:
   ```
   https://drive.google.com/drive/folders/1ABC123DEF456GHI789
                                        ↑ This is the FOLDER_ID
   ```

### Step 2: Share with Service Account

1. Go to your folder
2. Click **Share** button
3. Paste email: `database@database-484104.iam.gserviceaccount.com`
4. Give "Editor" access
5. Click **Share**

### Step 3: Add Environment Variable on Vercel

1. Go to Vercel project settings
2. Click **Environment Variables**
3. Add:
   - **Name**: `GOOGLE_DRIVE_FOLDER_ID`
   - **Value**: (your folder ID from Step 1)
4. Click **Save** and redeploy

### Step 4: Restart & Test

1. Restart your Vercel deployment
2. Start a new stream
3. After streaming ends, check Google Drive folder
4. Recorded video should appear automatically

---

## Storage Details

### Before Setup
- **Credentials Storage**: Google Sheets ✅
- **Stream Logs**: Google Sheets ✅
- **Recording Videos**: Not saved (lost after session ends)

### After Adding Google Drive
- **Credentials Storage**: Google Sheets ✅
- **Stream Logs**: Google Sheets ✅
- **Recording Videos**: Google Drive ✅ (automatically saved)

---

## Cost Analysis

| Feature | Cost |
|---------|------|
| Google Sheets API | Free (10K req/min limit) |
| Google Drive Storage | 15GB free (or paid plans) |
| Vercel Deployment | Free tier usually sufficient |
| FFmpeg WASM (Browser) | Free |
| Total Monthly Cost | **$0** ✅ |

---

## Recommendations

### Scenario 1: Just Broadcasting (No Recording)
- ✅ **No need for Google Drive setup**
- Uses: Google Sheets only (completely free)
- Perfect for: Live streaming to social media

### Scenario 2: Broadcasting + Recording
- 📁 **Add Google Drive folder** (optional)
- Uses: Google Sheets + Google Drive
- Perfect for: Archive building, content library

### Scenario 3: Enterprise/High Volume
- 💼 Consider paid Google Workspace plan
- Larger quotas for API and storage
- Dedicated support

---

## Troubleshooting Recording

### Recordings not appearing in Drive
1. **Check folder was shared correctly**
   - Go to folder → Share → verify service account email is there
   
2. **Verify FOLDER_ID is correct**
   - Copy again from URL without extra characters
   
3. **Check Vercel logs**
   - Sometimes there are permission issues
   - Look for error messages

4. **Manual fallback**
   - Even if auto-save fails, your streams still work
   - System logs everything in Google Sheets

### Quota Exceeded Error
- This is very rare with Google's free quotas
- Each stream typically uses < 100 API calls
- Free tier allows 10,000 calls/minute

---

## API Quotas & Limits

### Google Sheets
- **Free Tier**: 10,000 read/write requests per minute per user
- **Your Usage**: ~10-50 requests per stream session
- **Result**: ✅ More than enough for single user

### Google Drive
- **Free Storage**: 15 GB
- **Upload Speed**: ~5-10 Mbps (typical)
- **File Size Limit**: None (as long as storage available)

---

## Summary

**Current Setup** (Complete and Working):
- ✅ Video streaming from multiple sources
- ✅ Broadcasting to YouTube & Facebook
- ✅ Credential storage in Google Sheets
- ✅ Stream logs and history
- ✅ Zero cost

**Optional Addition** (For Recording):
- 📁 Google Drive folder for automatic recording saves
- Takes 5 minutes to set up
- Recommended but not required

---

## Next Steps

- **Without Recording**: Go straight to Vercel deployment ✅
- **With Recording**: Set up Google Drive folder first, then deploy

**Your app is ready to launch!** 🚀
