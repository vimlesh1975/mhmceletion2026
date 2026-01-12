import { google } from "googleapis";

export async function GET() {
    try {
        const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);

        const auth = new google.auth.GoogleAuth({
            credentials,
            scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
        });

        const sheets = google.sheets({ version: "v4", auth });

        const SHEET_ID = "1c2uaAxetGTFXmQ2A9jm-ZMcW9-smVVCFZkohnuA3DH8";
        const RANGE = "Sheet1!C4:M32";   // ⚠️ use sheet name

        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: SHEET_ID,
            range: RANGE,
        });

        const rows = response.data.values || [];

        return new Response(JSON.stringify(rows), {
            status: 200,
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
            },
        });

    } catch (error) {
        console.error("Google API error:", error);

        return new Response(
            JSON.stringify({ error: "Failed to read Google Sheet with API" }),
            { status: 500 }
        );
    }
}
