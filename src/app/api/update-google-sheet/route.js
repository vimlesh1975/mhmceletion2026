import { google } from "googleapis";

export async function POST(req) {
    try {
        const body = await req.json();
        const { range, values } = body;

        if (!range || !Array.isArray(values)) {
            return new Response(
                JSON.stringify({ error: "range and values are required" }),
                { status: 400 }
            );
        }

        const credentials = JSON.parse(
            process.env.GOOGLE_SERVICE_ACCOUNT_JSON
        );

        const auth = new google.auth.GoogleAuth({
            credentials,
            scopes: ["https://www.googleapis.com/auth/spreadsheets"],
        });

        const sheets = google.sheets({ version: "v4", auth });

        const SPREADSHEET_ID =
            "1c2uaAxetGTFXmQ2A9jm-ZMcW9-smVVCFZkohnuA3DH8";

        await sheets.spreadsheets.values.update({
            spreadsheetId: SPREADSHEET_ID,
            range, // 👈 e.g. "Sheet1!A2:J30"
            valueInputOption: "USER_ENTERED",
            requestBody: {
                values, // 2D array
            },
        });

        return new Response(
            JSON.stringify({ success: true }),
            { status: 200 }
        );

    } catch (error) {
        console.error("Update Sheet Error:", error);

        return new Response(
            JSON.stringify({ error: "Failed to update Google Sheet" }),
            { status: 500 }
        );
    }
}
