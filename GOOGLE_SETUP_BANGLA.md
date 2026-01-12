# 🇧🇩 Google Sheets সেটআপ - বাংলায় সংক্ষিপ্ত গাইড

## আপনার কাছে দরকার এই 3টি তথ্য:

### 1️⃣ **GOOGLE_SHEETS_ID**
```
কোথা থেকে পাবেন:
  1. Google Sheets খুলুন (sheets.google.com)
  2. নতুন spreadsheet তৈরি করুন
  3. URL দেখুন: 
     https://docs.google.com/spreadsheets/d/1A2B3C4D5E6F7G8H9I0J/edit
  4. ID = "1A2B3C4D5E6F7G8H9I0J"

দেখতে হবে এমন: 1A2B3C4D5E6F7G8H9I0J (28 characters)
```

### 2️⃣ **GOOGLE_SHEETS_API_KEY**
```
কোথা থেকে পাবেন:
  1. console.cloud.google.com এ যান
  2. নতুন Project তৈরি করুন
  3. "Google Sheets API" সার্চ করে Enable করুন
  4. "Create Credentials" → "API Key"
  5. Copy করুন

দেখতে হবে এমন: AIzaSy_1234567890_xxxxx
```

### 3️⃣ **Service Account Email** (Optional কিন্তু গুরুত্বপূর্ণ)
```
কোথা থেকে পাবেন:
  1. Google Cloud Console যান
  2. "Service Accounts" খুলুন
  3. Email copy করুন

দেখতে হবে এমন: streaming-bot@project.iam.gserviceaccount.com
```

---

## ✅ করার কাজ (Step by Step)

### **Step 1: Google Cloud Console সেটআপ** (5 মিনিট)

```
1. https://console.cloud.google.com/ খুলুন
2. "Select a Project" → "New Project"
3. Name দিন: "Streaming System"
4. Create করুন
```

### **Step 2: APIs Enable করুন** (2 মিনিট)

```
1. Search bar এ লিখুন: "Google Sheets API"
2. "Enable" ক্লিক করুন
3. একই ভাবে "Google Drive API" Enable করুন
```

### **Step 3: API Key তৈরি করুন** (3 মিনিট)

```
1. Left sidebar → "APIs & Services" → "Credentials"
2. "Create Credentials" → "API Key"
3. Copy করুন (এটাই আপনার GOOGLE_SHEETS_API_KEY)
```

### **Step 4: Google Sheet তৈরি করুন** (2 মিনিট)

```
1. https://sheets.google.com খুলুন
2. "+" (New spreadsheet) ক্লিক করুন
3. Name দিন: "Streaming Credentials"
4. Create করুন
5. URL copy করুন এবং ID extract করুন
   (এটাই আপনার GOOGLE_SHEETS_ID)
```

### **Step 5: Sheet Structure তৈরি করুন** (3 মিনিট)

**Sheet 1 এ নাম দিন: "Credentials"**

প্রথম row-এ লিখুন:
```
A1: platform
B1: username
C1: channelId
D1: accessToken
E1: rtmpUrl
F1: createdAt
```

**Sheet 2 এ নাম দিন: "StreamLogs"**

প্রথম row-এ লিখুন:
```
A1: streamId
B1: videoUrl
C1: platforms
D1: status
E1: startTime
F1: endTime
G1: error
```

### **Step 6: Service Account তৈরি করুন** (5 মিনিট)

```
1. Google Cloud Console যান
2. Left sidebar → "Service Accounts"
3. "Create Service Account"
4. Name দিন: "Streaming Bot"
5. Create করুন
6. Email copy করুন (এটাই GOOGLE_SHEETS_EMAIL)
```

### **Step 7: Service Account এ Key তৈরি করুন** (3 মিনিট)

```
1. Service Account খুলুন
2. "Keys" tab এ যান
3. "Add Key" → "Create new key"
4. Type: "JSON"
5. "Create" করুন
6. JSON file ডাউনলোড হবে
7. এটা সেভ রাখুন (সিক্রেট!)
```

### **Step 8: Sheet Share করুন** (2 মিনিট)

```
1. Google Sheet খুলুন
2. "Share" button (top right)
3. Service Account email paste করুন
4. Role: "Editor"
5. "Share" করুন
```

---

## 📝 আমার কাছে কি দেবেন?

আমাকে এই তিনটা জিনিস শেয়ার করুন:

### **Option A: সহজ (কাজ করবে)**
```
GOOGLE_SHEETS_ID = ?
GOOGLE_SHEETS_API_KEY = ?
```

### **Option B: সম্পূর্ণ (বেশি নিরাপদ)**
```
GOOGLE_SHEETS_ID = ?
GOOGLE_SHEETS_API_KEY = ?
Service Account Email = ?
(এবং বলুন Sheet share করেছেন)
```

---

## 🎯 খুব দ্রুত করতে হলে (10 মিনিট)

```
মিনিট 1-2:
  └─ Google Cloud Console খুলুন
  └─ New Project তৈরি করুন

মিনিট 3-4:
  └─ Google Sheets API enable করুন
  └─ Google Drive API enable করুন

মিনিট 5-6:
  └─ API Key তৈরি করুন

মিনিট 7-8:
  └─ Google Sheet তৈরি করুন

মিনিট 9-10:
  └─ Sheet Headers সেট করুন
  └─ ID copy করুন

সম্পূর্ণ!
```

---

## 🔐 গুরুত্বপূর্ণ নিরাপত্তা

```
❌ এগুলো GitHub-এ commit করবেন না:
  - API Keys
  - Email addresses
  - JSON credentials

✅ এর বদলে:
  - .env file ব্যবহার করুন
  - Environment variables set করুন
  - .gitignore এ .env লিখুন
```

---

## 📞 সমস্যার সমাধান

### সমস্যা: Sheet কানেক্ট হচ্ছে না
```
সমাধান:
  1. ID সঠিক কপি করেছেন? (28 characters)
  2. API Key সঠিক? (AIzaSy দিয়ে শুরু?)
  3. Sheet share করেছেন Service Account email-এর সাথে?
```

### সমস্যা: Permission denied
```
সমাধান:
  1. Sheet খুলুন
  2. Share করুন Service Account email এর সাথে
  3. Role দিন: "Editor"
```

---

## সর্বশেষ চেকলিস্ট

- [ ] Google Cloud Project তৈরি করেছি
- [ ] Google Sheets API enable করেছি
- [ ] Google Drive API enable করেছি
- [ ] API Key তৈরি করেছি
- [ ] Google Sheet তৈরি করেছি
- [ ] Sheet ID copy করেছি
- [ ] Service Account তৈরি করেছি
- [ ] Service Account email copy করেছি
- [ ] JSON key ডাউনলোড করেছি
- [ ] Sheet share করেছি Service Account-এর সাথে

---

## 📤 আমাকে দেবার সময়

আপনি যখন সবকিছু করে ফেলবেন, আমাকে বলবেন:

```
"আমি সবকিছু করেছি। এখানে তথ্য:

GOOGLE_SHEETS_ID = 1A2B3C4D5E6F7G8H9I0J
GOOGLE_SHEETS_API_KEY = AIzaSy_1234567890_xxxxx

Sheet এর নাম: Streaming Credentials
Share করেছি Service Account এর সাথে"
```

**তারপর আমি আপনার app-এ সেটআপ করে দেব!** ✅

---

**প্রশ্ন হলে জানাবেন!** 🚀
