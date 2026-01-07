import axios from "axios";

export async function GET() {
    try {
        const SHEET_ID = "1c2uaAxetGTFXmQ2A9jm-ZMcW9-smVVCFZkohnuA3DH8";
        const RANGE = "C3:L39";

        const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&range=${RANGE}`;

        const res = await axios.get(url);

        const json = JSON.parse(
            res.data.substring(47, res.data.length - 2)
        );

        const rows = json.table.rows.map(r =>
            r.c.map(c => (c ? c.v : ""))
        );

        return new Response(JSON.stringify(rows), {
            status: 200,
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*"
            }
        });

    } catch (error) {
        return new Response(
            JSON.stringify({ error: "Failed to read Google Sheet" }),
            { status: 500 }
        );
    }
}
