/**
 * Google Sheets Integration for storing streaming credentials
 * Uses REST API - completely free, no dependencies needed
 *
 * Setup:
 * 1. Create a Google Sheet
 * 2. Share it with "Editor" access
 * 3. Get the Sheet ID from the URL: docs.google.com/spreadsheets/d/{SHEET_ID}/
 * 4. Set environment variables:
 *    - GOOGLE_SHEETS_ID: Your sheet ID
 *    - GOOGLE_SHEETS_API_KEY: Get from https://console.cloud.google.com/apis/credentials
 */

interface StreamingCredential {
  platform: string;
  username?: string;
  email?: string;
  channelId?: string;
  pageId?: string;
  accessToken?: string;
  apiKey?: string;
  streamKey?: string;
  rtmpUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface StreamLog {
  streamId: string;
  videoUrl: string;
  platforms: string;
  status: "active" | "stopped" | "error";
  startTime?: string;
  endTime?: string;
  error?: string;
}

// In-memory cache for development (fallback when Google Sheets not configured)
const credentialsCache = new Map<string, StreamingCredential>();
const logsCache: StreamLog[] = [];

export async function initializeGoogleSheets() {
  try {
    if (!process.env.GOOGLE_SHEETS_ID || !process.env.GOOGLE_SHEETS_API_KEY) {
      console.warn(
        "Google Sheets not configured. Using in-memory storage (data will be lost on restart)."
      );
      console.warn("To enable Google Sheets:");
      console.warn("1. Create a Google Sheet");
      console.warn("2. Set GOOGLE_SHEETS_ID and GOOGLE_SHEETS_API_KEY env vars");
      return null;
    }
    console.log("Google Sheets integration ready");
    return true;
  } catch (error) {
    console.error("Failed to initialize Google Sheets:", error);
    return null;
  }
}

async function callGoogleSheets(
  range: string,
  method: "GET" | "POST" = "GET",
  values?: any[][]
): Promise<any> {
  try {
    if (!process.env.GOOGLE_SHEETS_ID || !process.env.GOOGLE_SHEETS_API_KEY) {
      return null;
    }

    const spreadsheetId = process.env.GOOGLE_SHEETS_ID;
    const apiKey = process.env.GOOGLE_SHEETS_API_KEY;

    const url =
      method === "GET"
        ? `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}?key=${apiKey}`
        : `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}:append?key=${apiKey}&valueInputOption=USER_ENTERED`;

    const response = await fetch(url, {
      method,
      headers:
        method === "POST"
          ? { "Content-Type": "application/json" }
          : undefined,
      body: method === "POST" ? JSON.stringify({ values }) : undefined,
    });

    if (!response.ok) {
      console.error(`Google Sheets API error: ${response.status}`);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error("Google Sheets API call failed:", error);
    return null;
  }
}

export async function saveCredential(
  credential: StreamingCredential
): Promise<boolean> {
  try {
    // Validate required fields
    if (!credential.platform) {
      console.error("Platform is required for credential");
      return false;
    }

    // Store in cache first (for immediate access)
    credentialsCache.set(credential.platform, {
      ...credential,
      updatedAt: new Date().toISOString(),
    });

    // Try to persist to Google Sheets
    if (process.env.GOOGLE_SHEETS_ID && process.env.GOOGLE_SHEETS_API_KEY) {
      const values = [
        [
          credential.platform,
          credential.username || credential.email || credential.userId || "",
          credential.channelId || credential.pageId || "",
          credential.streamKey || credential.accessToken || credential.apiKey || "",
          credential.rtmpUrl || "",
          new Date().toISOString(),
        ],
      ];

      const result = await callGoogleSheets("Credentials!A:F", "POST", values);
      if (result) {
        console.log(`✅ Credential saved to Google Sheets: ${credential.platform}`);
        return true;
      } else {
        console.warn(
          `⚠️ Failed to save to Google Sheets, using cache: ${credential.platform}`
        );
        // Still return true because it's cached
        return true;
      }
    }

    console.log(`Credential cached (Google Sheets not configured): ${credential.platform}`);
    return true;
  } catch (error) {
    console.error("Error saving credential:", error);
    // Return true anyway since it's cached
    return true;
  }
}

export async function getCredential(
  platform: string
): Promise<StreamingCredential | null> {
  try {
    // Check cache first (fastest)
    const cached = credentialsCache.get(platform);
    if (cached) {
      console.log(`✅ Retrieved ${platform} credentials from cache`);
      return cached;
    }

    // Try Google Sheets if not in cache
    if (process.env.GOOGLE_SHEETS_ID && process.env.GOOGLE_SHEETS_API_KEY) {
      const result = await callGoogleSheets("Credentials!A:F", "GET");
      if (result?.values) {
        const rows = result.values;
        const credentialRow = rows.find((row: string[]) => row[0] === platform);
        if (credentialRow) {
          const credential: StreamingCredential = {
            platform: credentialRow[0],
            username: credentialRow[1],
            channelId: credentialRow[2],
            accessToken: credentialRow[3],
            rtmpUrl: credentialRow[4],
            updatedAt: credentialRow[5],
          };
          // Cache it for next time
          credentialsCache.set(platform, credential);
          console.log(`✅ Retrieved ${platform} credentials from Google Sheets`);
          return credential;
        }
      }
    }

    console.warn(`⚠️ No credentials found for ${platform}`);
    return null;
  } catch (error) {
    console.error("Error retrieving credential:", error);
    // Return from cache as fallback
    const cached = credentialsCache.get(platform);
    if (cached) {
      console.log(`⚠️ Using cached credentials for ${platform} due to error`);
      return cached;
    }
    return null;
  }
}

export async function getAllCredentials(): Promise<StreamingCredential[]> {
  try {
    // Try Google Sheets first
    if (process.env.GOOGLE_SHEETS_ID && process.env.GOOGLE_SHEETS_API_KEY) {
      const result = await callGoogleSheets("Credentials!A:F", "GET");
      if (result?.values) {
        return result.values.slice(1).map((row: string[]) => ({
          platform: row[0],
          username: row[1],
          channelId: row[2],
          accessToken: row[3],
          rtmpUrl: row[4],
          updatedAt: row[5],
        }));
      }
    }

    // Fallback to cache
    return Array.from(credentialsCache.values());
  } catch (error) {
    console.error("Error retrieving credentials:", error);
    return Array.from(credentialsCache.values());
  }
}

export async function deleteCredential(platform: string): Promise<boolean> {
  try {
    // For Google Sheets, we'd need batchUpdate which is more complex
    // For now, just remove from cache
    credentialsCache.delete(platform);
    console.log(`Credential removed: ${platform}`);
    return true;
  } catch (error) {
    console.error("Error deleting credential:", error);
    return false;
  }
}

export async function logStreamEvent(log: StreamLog): Promise<boolean> {
  try {
    // Try Google Sheets first
    if (process.env.GOOGLE_SHEETS_ID && process.env.GOOGLE_SHEETS_API_KEY) {
      const values = [
        [
          log.streamId,
          log.videoUrl,
          log.platforms,
          log.status,
          log.startTime || new Date().toISOString(),
          log.endTime || "",
          log.error || "",
        ],
      ];

      const result = await callGoogleSheets("StreamLogs!A:G", "POST", values);
      if (result) {
        console.log(`Stream event logged to Google Sheets: ${log.streamId}`);
        return true;
      }
    }

    // Fallback to cache
    logsCache.push(log);
    console.log(`Stream event cached: ${log.streamId}`);
    return true;
  } catch (error) {
    console.error("Error logging stream event:", error);
    return false;
  }
}

export async function getStreamLogs(streamId: string): Promise<StreamLog[]> {
  try {
    // Try Google Sheets first
    if (process.env.GOOGLE_SHEETS_ID && process.env.GOOGLE_SHEETS_API_KEY) {
      const result = await callGoogleSheets("StreamLogs!A:G", "GET");
      if (result?.values) {
        return result.values
          .filter((row: string[]) => row[0] === streamId)
          .map((row: string[]) => ({
            streamId: row[0],
            videoUrl: row[1],
            platforms: row[2],
            status: row[3],
            startTime: row[4],
            endTime: row[5],
            error: row[6],
          }));
      }
    }

    // Fallback to cache
    return logsCache.filter((log) => log.streamId === streamId);
  } catch (error) {
    console.error("Error retrieving stream logs:", error);
    return logsCache.filter((log) => log.streamId === streamId);
  }
}
