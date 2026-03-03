import { google } from "googleapis";

const SCOPES = ["https://www.googleapis.com/auth/spreadsheets"];

let cachedAuth: google.auth.GoogleAuth | null = null;

function getAuth() {
  if (cachedAuth) return cachedAuth;
  if (!process.env.GOOGLE_SERVICE_ACCOUNT_CREDENTIALS) {
    throw new Error(
      "Missing GOOGLE_SERVICE_ACCOUNT_CREDENTIALS in environment"
    );
  }

  const credentials = JSON.parse(
    process.env.GOOGLE_SERVICE_ACCOUNT_CREDENTIALS as string
  );

  cachedAuth = new google.auth.GoogleAuth({
    credentials,
    scopes: SCOPES,
  });

  return cachedAuth;
}

export async function appendRow(values: unknown[]) {
  const auth = getAuth();
  const client = await auth.getClient();

  const sheets = google.sheets({ version: "v4", auth: client });
  const spreadsheetId = process.env.GOOGLE_SHEETS_ID;
  if (!spreadsheetId) {
    throw new Error("Missing GOOGLE_SHEETS_ID in environment");
  }

  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: "Sheet1!A:C",
    valueInputOption: "USER_ENTERED",
    requestBody: {
      values: [values],
    },
  });
}
