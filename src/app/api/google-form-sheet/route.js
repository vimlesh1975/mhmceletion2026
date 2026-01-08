import { google } from "googleapis";

export async function GET() {
    try {
        const credentials = JSON.parse(
            process.env.GOOGLE_SERVICE_ACCOUNT_JSON
        );

        const auth = new google.auth.GoogleAuth({
            credentials,
            scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
        });

        const sheets = google.sheets({ version: "v4", auth });

        // const SPREADSHEET_ID = "1OO692hxV1o5s6SKYttAJOwRfgJvFVNdZxCe4j27sLyI";
        const SPREADSHEET_ID = "1YEx8w-_2Rue_eeUP9h1ouEiY-WQByggQ-Pfuv1Cwzrw";
        const RANGE = "Form Responses 1!A2:Z"; // skip header

        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: RANGE,
        });

        const rows = response.data.values || [];

        // Remove Timestamp column (Form default)
        const cleanedRows = rows.map(r => r.slice(1));

        return new Response(JSON.stringify(cleanedRows), {
            status: 200,
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
            },
        });

    } catch (error) {
        console.error("Google Sheets API error:", error.message);

        return new Response(
            JSON.stringify({ error: "Failed to read Google Form Sheet" }),
            { status: 500 }
        );
    }
}
