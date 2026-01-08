import { google } from "googleapis";

/**
 * Fixed municipal order (top → bottom)
 */
const MUNICIPAL_ORDER = [
    "Mumbai",
    "Nagpur",
    "Pune",
    "Pimpri-Chinchwad",
    "Thane",
    "Nashik",
    "Navi Mumbai",
    "Kalyan-Dombivli",
    "Chhatrapati Sambhajinagar",
    "Vasai-Virar",
    "Solapur",
    "Sangli-Miraj",
    "Kolhapur",
    "Ahilyanagar",
    "Nanded-Waghala",
    "Jalgaon",
    "Dhule",
    "Malegaon",
    "Mira-Bhayandar",
    "Akola",
    "Bhiwandi-Nizampur",
    "Ulhasnagar",
    "Amravati",
    "Chandrapur",
    "Latur",
    "Parbhani",
    "Jalna",
    "Panvel",
    "Ichalkaranji"
];

// Number of PARTY columns only (NO TOTAL)
const PARTY_COUNT = 8;

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

        // const SPREADSHEET_ID = "1YEx8w-_2Rue_eeUP9h1ouEiY-WQByggQ-Pfuv1Cwzrw";
        const SPREADSHEET_ID = "1OO692hxV1o5s6SKYttAJOwRfgJvFVNdZxCe4j27sLyI";
        const RANGE = "Form Responses 1!A2:Z";

        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: RANGE,
        });

        const rows = response.data.values || [];

        /**
         * STEP 1: Keep latest entry per Municipal
         */
        const latestByMunicipal = {};

        for (const r of rows) {
            const timestamp = new Date(r[0]); // A
            const municipal = r[2];           // C

            if (!municipal || isNaN(timestamp)) continue;

            if (
                !latestByMunicipal[municipal] ||
                timestamp > latestByMunicipal[municipal].timestamp
            ) {
                latestByMunicipal[municipal] = {
                    timestamp,
                    row: r,
                };
            }
        }

        /**
         * STEP 2: Build ordered, zero-filled output
         */
        const finalRows = MUNICIPAL_ORDER.map(municipal => {
            const entry = latestByMunicipal[municipal];

            if (entry) {
                const r = entry.row;
                return [
                    municipal,              // Municipal first
                    ...r.slice(3, 3 + PARTY_COUNT), // Party values only
                    r[0],                    // Timestamp LAST
                    r[1]                     // Email LAST
                ];
            }

            // ❌ No data → zeros
            return [
                municipal,
                ...Array(PARTY_COUNT).fill("0"),
                "",
                ""
            ];
        });

        return new Response(JSON.stringify(finalRows), {
            status: 200,
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
            },
        });

    } catch (error) {
        console.error("Google Sheet API error:", error);

        return new Response(
            JSON.stringify({ error: "Failed to read Google Form Sheet" }),
            { status: 500 }
        );
    }
}
