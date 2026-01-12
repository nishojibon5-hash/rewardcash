# 📊 Google Sheets + Google Drive Database Setup Guide

আপনার streaming system-এর জন্য credentials ও data persistent রাখতে Google Sheets ও Google Drive ব্যবহার করবো।

---

## 🎯 কি কি তথ্য দরকার?

### **Level 1: Google Cloud Project সেটআপ** (5 মিনিট)

আপনাকে এগুলো করতে হবে:

1. **Google Cloud Console এ যান**
   - URL: https://console.cloud.google.com/
   - Google account দিয়ে login করুন

2. **নতুন Project তৈরি করুন**
   - "Select a Project" → "New Project"
   - Name: "Streaming System" (বা যেকোনো নাম)
   - Click "Create"

3. **APIs Enable করুন**
   - Search bar-এ লিখুন: "Google Sheets API"
   - Click করে "Enable" করুন
   - একই ভাবে "Google Drive API" enable করুন

---

## 🔑 **Level 2: Service Account তৈরি করুন** (5 মিনিট)

এটি একটি bot account যা automatic কাজ করে।

### Step 1: Service Account তৈরি
```
Left sidebar → APIs & Services → Credentials
    ↓
"Create Credentials" → "Service Account"
    ↓
Name: "Streaming Bot" 
Description: "Bot for streaming credentials storage"
    ↓
Click "Create and Continue"
```

### Step 2: Permissions দিন
```
Grant roles:
    ↓
Select "Editor" role
    ↓
Click "Continue" → "Done"
```

### Step 3: Private Key ডাউনলোড করুন
```
Service Account page → "Keys" tab
    ↓
"Add Key" → "Create new key"
    ↓
Type: "JSON" (select করুন)
    ↓
"Create" button ক্লিক
    ↓
JSON file auto-download হবে
    ↓
**এটা সেভ রাখুন! এটাই আপনার secret key!**
```

---

## 📋 **Level 3: Google Sheet তৈরি করুন** (3 মিনিট)

### Step 1: Sheet তৈরি করুন
```
Google Sheets: https://sheets.google.com
    ↓
"+" (New spreadsheet)
    ↓
Name: "Streaming Credentials"
    ↓
Create
```

### Step 2: Sheet Structure তৈরি করুন

**Sheet 1: নাম দিন "Credentials"**

| A | B | C | D | E | F |
|---|---|---|---|---|---|
| platform | username | channelId | accessToken | rtmpUrl | createdAt |
| youtube | your_username | UC_xxxxx | AIzaSy... | rtmps://... | 2025-01-12 |

**Sheet 2: নাম দিন "StreamLogs"**

| A | B | C | D | E | F | G |
|---|---|---|---|---|---|---|
| streamId | videoUrl | platforms | status | startTime | endTime | error |
| stream_123 | https://youtube.com/watch?v=xxx | youtube,facebook | active | 2025-01-12T10:00:00Z | | |

---

## 🔗 **Level 4: Share করুন Service Account-এর সাথে** (2 মিনিট)

### Step 1: Service Account Email পান
```
JSON file খুলুন (যা download করেছেন)
    ↓
"client_email" field খুঁজুন
    ↓
Copy করুন (দেখতে হবে এমন: xxxxx@xxxxx.iam.gserviceaccount.com)
```

### Step 2: Sheet Share করুন
```
Google Sheet খুলুন
    ↓
Share button (top right)
    ↓
Paste করুন service account email
    ↓
Role: "Editor" (select করুন)
    ↓
"Share" click করুন
```

---

## 📱 **Level 5: Sheet ID পান** (1 মিনিট)

```
Google Sheet এর URL খুলুন
    ↓
Example: https://docs.google.com/spreadsheets/d/1A2B3C4D5E6F7G8H9I0J/edit

   Sheet ID হবে: 1A2B3C4D5E6F7G8H9I0J
                   ↑ এটা copy করুন
```

---

## 🔐 **Level 6: JSON থেকে API Key তৈরি করুন** (2 মিনিট)

Downloaded JSON file খুলুন (যেকোনো text editor দিয়ে):

```json
{
  "type": "service_account",
  "project_id": "xxxxx",
  "private_key_id": "xxxxx",
  "private_key": "-----BEGIN PRIVATE KEY-----\nxxxxx\n-----END PRIVATE KEY-----\n",
  "client_email": "streaming-bot@project.iam.gserviceaccount.com",
  "client_id": "xxxxx",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  ...
}
```

**এই পুরো JSON file-টা আপনার environment variable হবে!**

---

## 📝 **আপনার Environment Variables সেট করুন**

### `.env` file তৈরি করুন (project root-এ):

```env
# Google Sheets Configuration
GOOGLE_SHEETS_ID=1A2B3C4D5E6F7G8H9I0J
GOOGLE_SHEETS_API_KEY=AIzaSy_YOUR_API_KEY_HERE

# Alternative: পুরো JSON credential
GOOGLE_CREDENTIALS='{"type":"service_account","project_id":"xxxxx",...}'
```

**অথবা Vercel/Netlify Deploy করলে:**

```
Dashboard → Settings → Environment Variables
    ↓
Add:
  Name: GOOGLE_SHEETS_ID
  Value: 1A2B3C4D5E6F7G8H9I0J
    ↓
Add:
  Name: GOOGLE_SHEETS_API_KEY
  Value: AIzaSy_YOUR_API_KEY_HERE
```

---

## ✅ **Checklist - কি কি দরকার?**

### **আপনার কাছে থাকা উচিত:**

- [ ] **GOOGLE_SHEETS_ID**
  ```
  Example: 1A2B3C4D5E6F7G8H9I0J
  পাবেন: Sheet URL থেকে
  ```

- [ ] **GOOGLE_SHEETS_API_KEY**
  ```
  Example: AIzaSy_1234567890_xxxxx
  পাবেন: Google Cloud Console থেকে
  ```

- [ ] **GOOGLE_CREDENTIALS (Optional)**
  ```
  পুরো JSON file content
  পাবেন: Service Account থেকে
  ```

- [ ] **Sheet URL**
  ```
  Example: https://docs.google.com/spreadsheets/d/1A2B3C4D5E6F7G8H9I0J/edit
  Share করেছেন: Yes
  ```

- [ ] **Service Account Email**
  ```
  Example: streaming-bot@project.iam.gserviceaccount.com
  তৈরি করেছেন: Yes
  ```

---

## 🚀 **Quick Checklist (তাড়াহুড়ো করলে এটা করুন)**

```
1. Google Cloud Console: https://console.cloud.google.com/
   ☐ New Project তৈরি করেছি

2. APIs Enable:
   ☐ Google Sheets API - Enabled
   ☐ Google Drive API - Enabled

3. Service Account:
   ☐ Service Account তৈরি করেছি
   ☐ JSON key ডাউনলোড করেছি
   ☐ Email copy করেছি (xxxxx@xxxxx.iam.gserviceaccount.com)

4. Google Sheet:
   ☐ Sheet তৈরি করেছি (name: "Streaming Credentials")
   ☐ Sheet Share করেছি Service Account-এর সাথে
   ☐ Sheet ID copy করেছি

5. Environment Variables:
   ☐ GOOGLE_SHEETS_ID set করেছি
   ☐ GOOGLE_SHEETS_API_KEY set করেছি
   ☐ Restart করেছি app
```

---

## 📊 **Google Drive ব্যবহার করতে চাইলে** (Advanced)

### Google Drive API Configuration:

```env
# Drive Configuration
GOOGLE_DRIVE_FOLDER_ID=1A2B3C4D5E6F7G8H9I0J
GOOGLE_DRIVE_API_KEY=AIzaSy_YOUR_API_KEY_HERE
```

**Drive Folder ID কিভাবে পাবেন:**
```
Google Drive খুলুন
    ↓
New folder তৈরি করুন (নাম: "Streaming Data")
    ↓
Folder খুলুন
    ↓
URL: https://drive.google.com/drive/folders/1A2B3C4D5E6F7G8H9I0J
                                           ↑
                        এটা হবে Folder ID
```

---

## 🔒 **Security Best Practices**

### ⚠️ **NEVER do this:**

```
❌ GitHub-এ .env file commit করবেন না
❌ JSON key file public করবেন না
❌ Email/Password কোথাও শেয়ার করবেন না
❌ API Key source code-এ রাখবেন না
```

### ✅ **Instead do this:**

```
✅ Environment variables ব্যবহার করুন
✅ .env file .gitignore-এ রাখুন
✅ Production-এ Vercel secrets ব্যবহার করুন
✅ Regular basis-এ key rotate করুন
```

---

## 🧪 **Test করুন সবকিছু কাজ করছে কি না**

### Browser Console-এ (F12 খুলুন):

```javascript
// Check if Google Sheets connected
fetch('/api/stream/platforms/connected')
  .then(r => r.json())
  .then(d => console.log('Connected platforms:', d))
```

**Expected output:**
```
{
  "ok": true,
  "platforms": [
    { "platform": "youtube", "username": "...", "connectedAt": "..." }
  ],
  "count": 1
}
```

---

## 📞 **সমস্যা হলে**

### Problem 1: "Google Sheets not configured"
```
Solution:
  ✅ GOOGLE_SHEETS_ID সেট করেছেন?
  ✅ GOOGLE_SHEETS_API_KEY সেট করেছেন?
  ✅ .env file save করেছেন?
  ✅ Server restart করেছেন?
```

### Problem 2: "Permission denied"
```
Solution:
  ✅ Sheet share করেছেন Service Account email-এর সাথে?
  ✅ Role "Editor" দিয়েছেন?
  ✅ Sheet ID সঠিক কপি করেছেন?
```

### Problem 3: "Invalid API Key"
```
Solution:
  ✅ Google Cloud Console থেকে key পেয়েছেন?
  ✅ APIs enabled আছে?
  ✅ Key-তে spaces/extra characters নেই?
```

---

## 🎯 **সবশেষে যা যা প্রয়োজন**

আপনার সাথে শেয়ার করতে হবে:

### **Option 1: Minimal Setup**
```
GOOGLE_SHEETS_ID=YOUR_SHEET_ID_HERE
GOOGLE_SHEETS_API_KEY=YOUR_API_KEY_HERE
```

### **Option 2: Full Setup (Recommended)**
```
GOOGLE_SHEETS_ID=1A2B3C4D5E6F7G8H9I0J
GOOGLE_SHEETS_API_KEY=AIzaSy_1234567890
GOOGLE_CREDENTIALS='{"type":"service_account",...full json...}'
```

### **Option 3: Environment Variables File**
```
.env file content (সম্পূর্ণ):
─────────────────────────────────
GOOGLE_SHEETS_ID=1A2B3C4D5E6F7G8H9I0J
GOOGLE_SHEETS_API_KEY=AIzaSy_1234567890
NODE_ENV=production
─────────────────────────────────
```

---

## 🎬 **সম্পূর্ণ ফ্লো**

```
1. Google Cloud Console যান
   ↓
2. Project + APIs setup করুন
   ↓
3. Service Account তৈরি করুন
   ↓
4. JSON key ডাউনলোড করুন
   ↓
5. Google Sheet তৈরি করুন
   ↓
6. Sheet share করুন Service Account-এর সাথে
   ↓
7. Environment variables সেট করুন
   ↓
8. Server restart করুন
   ↓
9. Test করুন
   ↓
10. আপনার credentials সুরক্ষিত রাখুন!
```

---

## 📚 **Further Reading**

- Google Sheets API: https://developers.google.com/sheets/api
- Google Drive API: https://developers.google.com/drive/api
- Service Accounts: https://cloud.google.com/iam/docs/service-accounts

---

**সবকিছু সেটআপ করে দিলে কি কি তথ্য আমাকে দেবেন:**

1. ✅ **GOOGLE_SHEETS_ID** (Sheet URL থেকে)
2. ✅ **GOOGLE_SHEETS_API_KEY** (Google Cloud থেকে)
3. ✅ **Confirmation** যে Sheet share করেছেন Service Account-এর সাথে

**আর কিছু চাই?** 🚀
