'use client'

import { useEffect, useState, useRef } from "react";
import "./page.css"

const headers = [
  "district/party",
  "भाजप",
  "शिवसेना",
  "काँग्रेस",
  "राकाँपा",
  "मनसे",
  "इतर",
  "Totoal"
];


export default function SheetTable() {
  const [rows, setRows] = useState([]);
  // const [polling, setPolling] = useState(true); // ✅ toggle
  const [polling, setPolling] = useState(false); // ✅ toggle


  const intervalRef = useRef(null);

  const endpoint = async (str) => {
    const requestOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(str),
    };
    await fetch('/api/casparcg', requestOptions);
    if (str.action === 'connect' || str.action === 'disconnect') {
    }
  };


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

  const sendToCaspar = (str) => {
    endpoint({
      action: 'endpoint',
      command: str,
    });
  }


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

    <button onClick={() => sendToCaspar(`clear 1`)}>Stop All</button>

    <button onClick={() => {
      let xml = '';
      xml += `<componentData id=\\"${'ccgc1n'}\\"><data id=\\"text\\" value=\\"${rows[0][0]}\\" /></componentData>`;
      var seat = 0;
      for (let i = 1; i < 7; i++) {
        seat += rows[0][i];
      }

      xml += `<componentData id=\\"${'ccgc1s'}\\"><data id=\\"text\\" value=\\"${seat + "/" + rows[0][7]}\\" /></componentData>`;

      for (let i = 1; i < 7; i++) {
        xml += `<componentData id=\\"${'ccgp' + i + 'n'}\\"><data id=\\"text\\" value=\\"${headers[i]}\\" /></componentData>`;
      }

      for (let i = 1; i < 7; i++) {
        xml += `<componentData id=\\"${'ccgp' + i + 's'}\\"><data id=\\"text\\" value=\\"${rows[0][i]}\\" /></componentData>`;
      }

      xml = `"<templateData>${xml}</templateData>"`
      const templateName = 'mhmceletion2026/top/top';
      endpoint({
        action: "endpoint",
        command: `cg 1-96 add 96 "${templateName}" 1 ${xml}`
      });

    }}>Play Top</button>

    <button onClick={() => {
      let xml = '';
      xml += `<componentData id=\\"${'ccgc1n'}\\"><data id=\\"text\\" value=\\"${rows[1][0]}\\" /></componentData>`;
      var seat = 0;
      for (let i = 1; i < 7; i++) {
        seat += rows[1][i];
      }

      xml += `<componentData id=\\"${'ccgc1s'}\\"><data id=\\"text\\" value=\\"${seat + "/" + rows[1][7]}\\" /></componentData>`;

      for (let i = 1; i < 7; i++) {
        xml += `<componentData id=\\"${'ccgp' + i + 'n'}\\"><data id=\\"text\\" value=\\"${headers[i]}\\" /></componentData>`;
      }

      for (let i = 1; i < 7; i++) {
        xml += `<componentData id=\\"${'ccgp' + i + 's'}\\"><data id=\\"text\\" value=\\"${rows[1][i]}\\" /></componentData>`;
      }

      xml = `"<templateData>${xml}</templateData>"`
      const templateName = 'mhmceletion2026/left/left';
      endpoint({
        action: "endpoint",
        command: `cg 1-97 add 97 "${templateName}" 1 ${xml}`
      });

    }}>Play Left</button>

    <button onClick={() => {
      let xml = '';
      xml += `<componentData id=\\"${'ccgc1n'}\\"><data id=\\"text\\" value=\\"${rows[2][0]}\\" /></componentData>`;
      var seat = 0;
      for (let i = 1; i < 7; i++) {
        seat += rows[1][i];
      }

      xml += `<componentData id=\\"${'ccgc1s'}\\"><data id=\\"text\\" value=\\"${seat + "/" + rows[2][7]}\\" /></componentData>`;

      for (let i = 1; i < 7; i++) {
        xml += `<componentData id=\\"${'ccgp' + i + 'n'}\\"><data id=\\"text\\" value=\\"${headers[i]}\\" /></componentData>`;
      }

      for (let i = 1; i < 7; i++) {
        xml += `<componentData id=\\"${'ccgp' + i + 's'}\\"><data id=\\"text\\" value=\\"${rows[2][i]}\\" /></componentData>`;
      }

      xml = `"<templateData>${xml}</templateData>"`
      const templateName = 'mhmceletion2026/left/left';
      endpoint({
        action: "endpoint",
        command: `mixer 1-98 fill 0.75 0 1 1`
      });

      endpoint({
        action: "endpoint",
        command: `cg 1-98 add 98 "${templateName}" 1 ${xml}`
      });

    }}>Play Right</button>



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
