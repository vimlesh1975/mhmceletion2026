'use client'

import { useEffect, useState, useRef } from "react";
import "./page.css"

const headers = [
  "district/party",
  "भाजप",
  "शिवसेना",
  "राकाँपा",
  "काँग्रेस",
  "शिवसेना(उबाठा)",
  "राष्ट्रवादी(शप)",
  "मनसे",
  "इतर",
  "Total"
];


export default function SheetTable() {
  const [rows, setRows] = useState([]);
  const [formrows, setFormRows] = useState([]);
  const [polling, setPolling] = useState(false); // ✅ toggle

  const intervalRef = useRef(null);

  const topIntervalRef = useRef(null);
  const leftIntervalRef = useRef(null);
  const rightIntervalRef = useRef(null);
  const bottomIntervalRef = useRef(null);

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



  const fetchformSheet = async () => {
    const res = await fetch("/api/google-form-sheet");
    const data = await res.json();
    setFormRows(data);
    console.log(data)
  };
  useEffect(() => {
    fetchformSheet();
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

  const getSeat = (row) => {
    let seat = 0;
    for (let i = 1; i < 9; i++) seat += Number(row[i] || 0);
    return seat;
  };

  const startPlayTopLoop = () => {
    if (!rows.length) return;

    // 👇 ONLY rows you are sure exist
    const rowSequence = [0];
    let seqIndex = 0;

    const playRow = (rowNO) => {
      if (!rows[rowNO]) return; // 🛡️ CRITICAL SAFETY
      let xml = '';
      xml += `<componentData id=\\"${'ccgc1n'}\\"><data id=\\"text\\" value=\\"${rows[rowNO][0]}\\" /></componentData>`;
      var seat = getSeat(rows[rowNO]);


      xml += `<componentData id=\\"${'ccgc1s'}\\"><data id=\\"text\\" value=\\"${seat + "/" + rows[rowNO][9]}\\" /></componentData>`;

      for (let i = 1; i < 9; i++) {
        xml += `<componentData id=\\"${'ccgp' + i + 'n'}\\"><data id=\\"text\\" value=\\"${headers[i]}\\" /></componentData>`;
      }

      for (let i = 1; i < 9; i++) {
        xml += `<componentData id=\\"${'ccgp' + i + 's'}\\"><data id=\\"text\\" value=\\"${rows[rowNO][i]}\\" /></componentData>`;
      }

      xml = `"<templateData>${xml}</templateData>"`
      const templateName = 'mhmceletion2026/top/top';
      endpoint({
        action: "endpoint",
        command: `cg 1-96 add 96 "${templateName}" 1 ${xml}`
      });
    };

    // ▶️ play first row immediately
    playRow(rowSequence[seqIndex]);

    topIntervalRef.current = setInterval(() => {
      seqIndex = (seqIndex + 1) % rowSequence.length;
      playRow(rowSequence[seqIndex]);
    }, 5000);
  };


  const startPlayLeftLoop = () => {
    if (!rows.length) return;

    // 👇 ONLY rows you are sure exist
    const rowSequence = [1, 2, 3, 5];
    let seqIndex = 0;

    const playRow = (rowNO) => {
      if (!rows[rowNO]) return; // 🛡️ CRITICAL SAFETY
      let xml = '';
      xml += `<componentData id=\\"ccgc1n\\"><data id=\\"text\\" value=\\"${rows[rowNO][0]}\\" /></componentData>`;
      const seat = getSeat(rows[rowNO]);
      xml += `<componentData id=\\"ccgc1s\\"><data id=\\"text\\" value=\\"${seat}/${rows[rowNO][9]}\\" /></componentData>`;
      for (let i = 1; i < 9; i++) {
        xml += `<componentData id=\\"ccgp${i}n\\"><data id=\\"text\\" value=\\"${headers[i]}\\" /></componentData>`;
        xml += `<componentData id=\\"ccgp${i}s\\"><data id=\\"text\\" value=\\"${rows[rowNO][i] ?? ""}\\" /></componentData>`;
      }
      xml = `"<templateData>${xml}</templateData>"`;
      endpoint({
        action: "endpoint",
        command: `cg 1-97 add 97 "mhmceletion2026/left/left" 1 ${xml}`
      });
    };

    // ▶️ play first row immediately
    playRow(rowSequence[seqIndex]);

    leftIntervalRef.current = setInterval(() => {
      seqIndex = (seqIndex + 1) % rowSequence.length;
      playRow(rowSequence[seqIndex]);
    }, 5000);
  };


  const startPlayRightLoop = () => {
    if (!rows.length) return;

    // 👇 ONLY rows you are sure exist
    const rowSequence = [4, 6, 7, 18, 20, 21];
    let seqIndex = 0;

    const playRow = (rowNO) => {
      if (!rows[rowNO]) return; // 🛡️ CRITICAL SAFETY
      let xml = '';
      xml += `<componentData id=\\"${'ccgc1n'}\\"><data id=\\"text\\" value=\\"${rows[rowNO][0]}\\" /></componentData>`;
      var seat = getSeat(rows[rowNO]);
      xml += `<componentData id=\\"${'ccgc1s'}\\"><data id=\\"text\\" value=\\"${seat + "/" + rows[rowNO][9]}\\" /></componentData>`;
      for (let i = 1; i < 9; i++) {
        xml += `<componentData id=\\"${'ccgp' + i + 'n'}\\"><data id=\\"text\\" value=\\"${headers[i]}\\" /></componentData>`;
      }
      for (let i = 1; i < 9; i++) {
        xml += `<componentData id=\\"${'ccgp' + i + 's'}\\"><data id=\\"text\\" value=\\"${rows[rowNO][i]}\\" /></componentData>`;
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
    }

    // ▶️ play first row immediately
    playRow(rowSequence[seqIndex]);

    rightIntervalRef.current = setInterval(() => {
      seqIndex = (seqIndex + 1) % rowSequence.length;
      playRow(rowSequence[seqIndex]);
    }, 5000);
  };


  const startPlayBottomLoop = () => {
    if (!rows.length) return;

    const rowSequence = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 19, 22, 23, 24, 25, 26, 27, 28];
    const ROWS_PER_PAGE = 3;
    let pageIndex = 0;

    const playPage = (start) => {
      if (rowSequence[start] === undefined || rowSequence[start + 1] === undefined || rowSequence[start + 2] === undefined) return;

      let xml = '';

      // 🔹 WRITE ROW DATA FIRST (IMPORTANT)
      for (let block = 0; block < 3; block++) {
        const rowNO = rowSequence[start + block];
        if (!rows[rowNO]) return;

        const seat = getSeat(rows[rowNO]);
        const total = rows[rowNO][9];

        xml += `<componentData id=\\"ccgc${block + 1}n\\"><data id=\\"text\\" value=\\"${rows[rowNO][0]}\\" /></componentData>`;
        xml += `<componentData id=\\"ccgc${block + 1}s\\"><data id=\\"text\\" value=\\"${seat}/${total}\\" /></componentData>`;

        for (let i = 1; i < 9; i++) {
          xml += `<componentData id=\\"ccgp${i}s\\"><data id=\\"text\\" value=\\"${rows[rowNO][i]}\\" /></componentData>`;
        }

        for (let i = 1; i < 9; i++) {
          xml += `<componentData id=\\"ccgc${block + 1}p${i}s\\"><data id=\\"text\\" value=\\"${rows[rowNO][i]}\\" /></componentData>`;
        }

      }

      // 🔹 WRITE PARTY NAMES LAST
      for (let i = 1; i < 9; i++) {
        xml += `<componentData id=\\"ccgp${i}n\\"><data id=\\"text\\" value=\\"${headers[i]}\\" /></componentData>`;
      }

      xml = `"<templateData>${xml}</templateData>"`;

      endpoint({
        action: "endpoint",
        command: `cg 1-99 add 99 "mhmceletion2026/bottom/bottom" 1 ${xml}`
      });
    };

    // ▶️ Play first page immediately
    playPage(pageIndex);

    bottomIntervalRef.current = setInterval(() => {
      pageIndex += ROWS_PER_PAGE;
      if (pageIndex >= rowSequence.length) pageIndex = 0;
      playPage(pageIndex);
    }, 5000);
  };


  return (<>
    <div style={{ display: 'flex' }}>
      <div>
        <div className="table-wrapper">
          <table className="sheet-table">
            <thead>
              <tr>
                <th></th>
                {headers.map((h, i) => (
                  <th key={i}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, rIdx) => (
                <tr key={rIdx}>
                  <td>{rIdx + 1}</td>
                  {row.map((cell, cIdx) => (
                    <td key={cIdx}>
                      <input
                        type="text"
                        value={cell}
                        onChange={(e) => {
                          const value = e.target.value;
                          setRows(prev => {
                            const copy = [...prev];
                            copy[rIdx] = [...copy[rIdx]];
                            copy[rIdx][cIdx] = value;
                            return copy;
                          });
                        }}
                        style={{
                          width: cIdx === 0 ? "140px" : "50px",
                          border: "none",
                          outline: "none",
                          background: "transparent",
                          textAlign: cIdx === 0 ? "left" : "center"
                        }}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>

          </table>
        </div>
      </div>

      <div>
        <button onClick={fetchSheet}>Read Once</button>
        <label style={{ display: "block", marginBottom: 8 }}>
          <input
            type="checkbox"
            checked={polling}
            onChange={e => setPolling(e.target.checked)}
          />
          &nbsp;Get data from Google Sheet (5 sec)
        </label>

        <button onClick={() => {
          sendToCaspar(`clear 1`);

          if (topIntervalRef.current) {
            clearInterval(topIntervalRef.current);
            topIntervalRef.current = null;
          }

          if (leftIntervalRef.current) {
            clearInterval(leftIntervalRef.current);
            leftIntervalRef.current = null;
          }
          if (rightIntervalRef.current) {
            clearInterval(rightIntervalRef.current);
            rightIntervalRef.current = null;
          }
          if (bottomIntervalRef.current) {
            clearInterval(bottomIntervalRef.current);
            bottomIntervalRef.current = null;
          }

        }}>Stop All</button>

        <div style={{ border: '1px solid red' }}>
          <h3> Top</h3>
          <button onClick={() => {
            startPlayTopLoop();

          }}>Play Top</button>

          <button onClick={() => {

            if (topIntervalRef.current) {
              clearInterval(topIntervalRef.current);
              topIntervalRef.current = null;
            }

            endpoint({
              action: "endpoint",
              command: `cg 1-96 stop 96`
            });
          }}>Stop</button>



        </div>

        <div style={{ border: '1px solid red' }}>
          <h3> Left</h3>
          <button onClick={() => {
            startPlayLeftLoop()

          }}>Play Left</button>

          <button onClick={() => {
            if (leftIntervalRef.current) {
              clearInterval(leftIntervalRef.current);
              leftIntervalRef.current = null;
            }
            endpoint({
              action: "endpoint",
              command: `cg 1-97 stop 97`
            });
          }}>Stop</button>

        </div>
        <div style={{ border: '1px solid red' }}>
          <h3> Right</h3>

          <button onClick={() => {
            startPlayRightLoop();
          }}>Play Right</button>

          <button onClick={() => {

            if (rightIntervalRef.current) {
              clearInterval(rightIntervalRef.current);
              rightIntervalRef.current = null;
            }
            endpoint({
              action: "endpoint",
              command: `cg 1-98 stop 98`
            });
          }}>Stop</button>
        </div>

        <div style={{ border: '1px solid red' }}>
          <h3> Bottom</h3>
          <button onClick={() => {
            startPlayBottomLoop();
          }}>Play Bottom</button>


          <button onClick={() => {

            if (bottomIntervalRef.current) {
              clearInterval(bottomIntervalRef.current);
              bottomIntervalRef.current = null;
            }


            endpoint({
              action: "endpoint",
              command: `cg 1-99 stop 99`
            });
          }}>Stop</button>
        </div>
      </div>
    </div>
  </>);
}
