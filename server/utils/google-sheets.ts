import { google } from "googleapis";

/**
 * Google Sheets Integration for storing streaming credentials
 * Uses Google Sheets API - completely free
 *
 * Setup:
 * 1. Create a service account at https://console.cloud.google.com
 * 2. Create a Google Sheet and share it with the service account email
 * 3. Set GOOGLE_SHEETS_ID and GOOGLE_CREDENTIALS env variables
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

let sheetsClient: any = null;

export async function initializeGoogleSheets() {
  try {
    const credentials = process.env.GOOGLE_CREDENTIALS
      ? JSON.parse(process.env.GOOGLE_CREDENTIALS)
      : undefined;

    if (!credentials) {
      console.warn("Google Sheets credentials not configured. Using mock data.");
      return null;
    }

    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    sheetsClient = google.sheets({ version: "v4", auth });
    console.log("Google Sheets initialized successfully");
    return sheetsClient;
  } catch (error) {
    console.error("Failed to initialize Google Sheets:", error);
    return null;
  }
}

export async function saveCredential(
  credential: StreamingCredential
): Promise<boolean> {
  try {
    if (!sheetsClient || !process.env.GOOGLE_SHEETS_ID) {
      // Mock storage for development
      console.log("Saving credential to mock storage:", credential);
      return true;
    }

    const spreadsheetId = process.env.GOOGLE_SHEETS_ID;

    const values = [
      [
        credential.platform,
        credential.username || credential.email || "",
        credential.channelId || credential.pageId || "",
        credential.accessToken || credential.apiKey || "",
        credential.rtmpUrl || "",
        new Date().toISOString(),
      ],
    ];

    await sheetsClient.spreadsheets.values.append({
      spreadsheetId,
      range: "Credentials!A:F",
      valueInputOption: "USER_ENTERED",
      requestBody: { values },
    });

    return true;
  } catch (error) {
    console.error("Error saving credential:", error);
    return false;
  }
}

export async function getCredential(platform: string): Promise<StreamingCredential | null> {
  try {
    if (!sheetsClient || !process.env.GOOGLE_SHEETS_ID) {
      // Return mock credential for development
      return {
        platform,
        username: `mock_user_${platform}`,
        accessToken: "mock_token",
      };
    }

    const spreadsheetId = process.env.GOOGLE_SHEETS_ID;

    const response = await sheetsClient.spreadsheets.values.get({
      spreadsheetId,
      range: "Credentials!A:F",
    });

    const rows = response.data.values || [];
    const credential = rows.find(
      (row: string[]) => row[0] === platform
    );

    if (!credential) return null;

    return {
      platform: credential[0],
      username: credential[1],
      channelId: credential[2],
      accessToken: credential[3],
      rtmpUrl: credential[4],
      updatedAt: credential[5],
    };
  } catch (error) {
    console.error("Error retrieving credential:", error);
    return null;
  }
}

export async function getAllCredentials(): Promise<StreamingCredential[]> {
  try {
    if (!sheetsClient || !process.env.GOOGLE_SHEETS_ID) {
      return [];
    }

    const spreadsheetId = process.env.GOOGLE_SHEETS_ID;

    const response = await sheetsClient.spreadsheets.values.get({
      spreadsheetId,
      range: "Credentials!A:F",
    });

    const rows = response.data.values || [];
    return rows.slice(1).map((row: string[]) => ({
      platform: row[0],
      username: row[1],
      channelId: row[2],
      accessToken: row[3],
      rtmpUrl: row[4],
      updatedAt: row[5],
    }));
  } catch (error) {
    console.error("Error retrieving credentials:", error);
    return [];
  }
}

export async function deleteCredential(platform: string): Promise<boolean> {
  try {
    if (!sheetsClient || !process.env.GOOGLE_SHEETS_ID) {
      console.log("Deleting credential from mock storage:", platform);
      return true;
    }

    const spreadsheetId = process.env.GOOGLE_SHEETS_ID;

    const response = await sheetsClient.spreadsheets.values.get({
      spreadsheetId,
      range: "Credentials!A:F",
    });

    const rows = response.data.values || [];
    const rowIndex = rows.findIndex((row: string[]) => row[0] === platform);

    if (rowIndex === -1) return false;

    await sheetsClient.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: [
          {
            deleteDimension: {
              range: {
                sheetId: 0,
                dimension: "ROWS",
                startIndex: rowIndex,
                endIndex: rowIndex + 1,
              },
            },
          },
        ],
      },
    });

    return true;
  } catch (error) {
    console.error("Error deleting credential:", error);
    return false;
  }
}

export async function logStreamEvent(log: StreamLog): Promise<boolean> {
  try {
    if (!sheetsClient || !process.env.GOOGLE_SHEETS_ID) {
      console.log("Logging stream event to mock storage:", log);
      return true;
    }

    const spreadsheetId = process.env.GOOGLE_SHEETS_ID;

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

    await sheetsClient.spreadsheets.values.append({
      spreadsheetId,
      range: "StreamLogs!A:G",
      valueInputOption: "USER_ENTERED",
      requestBody: { values },
    });

    return true;
  } catch (error) {
    console.error("Error logging stream event:", error);
    return false;
  }
}

export async function getStreamLogs(
  streamId: string
): Promise<StreamLog[]> {
  try {
    if (!sheetsClient || !process.env.GOOGLE_SHEETS_ID) {
      return [];
    }

    const spreadsheetId = process.env.GOOGLE_SHEETS_ID;

    const response = await sheetsClient.spreadsheets.values.get({
      spreadsheetId,
      range: "StreamLogs!A:G",
    });

    const rows = response.data.values || [];
    return rows
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
  } catch (error) {
    console.error("Error retrieving stream logs:", error);
    return [];
  }
}
