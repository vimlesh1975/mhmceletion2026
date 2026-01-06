'use client'

import { useEffect, useState, useRef } from "react";
import "./page.css"

export default function SheetTable() {
  const [rows, setRows] = useState([]);
  // const [polling, setPolling] = useState(true); // ✅ toggle
  const [polling, setPolling] = useState(false); // ✅ toggle


  const intervalRef = useRef(null);


  const fetchSheet = async () => {
    const res = await fetch("/api/google-sheet");
    const data = await res.json();
    setRows(data);
  };

  useEffect(() => {
    fetchSheet();
  }, [])


  useEffect(() => {
    // 🔁 START polling
    if (polling) {
      intervalRef.current = setInterval(fetchSheet, 5000);
    }

    // 🛑 STOP polling
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [polling]);

  const headers = [
    "district/party",
    "भाजप",
    "शिवसेना",
    "काँग्रेस",
    "राकाँपा",
    "मनसे",
    "इतर"
  ];

  return (<>

    {/* ✅ Polling toggle */}
    <label style={{ display: "block", marginBottom: 8 }}>
      <input
        type="checkbox"
        checked={polling}
        onChange={e => setPolling(e.target.checked)}
      />
      &nbsp;Auto refresh (5 sec)
    </label>


    <div className="table-wrapper">
      <table className="sheet-table">
        <thead>
          <tr>
            {headers.map((h, i) => (
              <th key={i}>{h}</th>
            ))}
          </tr>
        </thead>

        <tbody>
          {rows.map((row, rIdx) => (
            <tr key={rIdx}>
              {row.map((cell, cIdx) => (
                <td key={cIdx}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </>);
}
