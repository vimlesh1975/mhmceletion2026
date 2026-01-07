import axios from "axios";

export async function GET() {
    try {
        const SHEET_ID = "1OO692hxV1o5s6SKYttAJOwRfgJvFVNdZxCe4j27sLyI";

        // Google Form response sheet (CSV)
        const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv`;

        const res = await axios.get(url);

        const rows = res.data
            .split("\n")
            .map(r => r.split(","))
            .slice(1); // ⛔ skip header row

        // OPTIONAL: remove Timestamp column (Form default)
        const cleanedRows = rows.map(r => r.slice(1));

        return new Response(JSON.stringify(cleanedRows), {
            status: 200,
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*"
            }
        });

    } catch (error) {
        return new Response(
            JSON.stringify({ error: "Failed to read Google Form Sheet" }),
            { status: 500 }
        );
    }
}
