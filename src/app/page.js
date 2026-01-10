'use client'

import { useEffect, useState, useRef } from "react";
import "./page.css"

const headers = [
  "Municipal/Party",
  "भाजप",
  "शिवसेना",
  "राष्ट्रवादी",
  "काँग्रेस",
  "उबाठा",
  "श प",
  "मनसे",
  "इतर",
  "Total"
];


export default function SheetTable() {
  const [rows, setRows] = useState([]);
  const [formrows, setFormRows] = useState([]);
  const [polling, setPolling] = useState(false);

  const [autoreadresponse, setautoreadresponse] = useState(false);
  const [autoWriteresponse, setautoWriteresponse] = useState(false);

  const intervalRef = useRef(null);

  const topIntervalRef = useRef(null);
  const leftIntervalRef = useRef(null);
  const rightIntervalRef = useRef(null);
  const bottomIntervalRef = useRef(null);

  const autoReadIntervalRef = useRef(null);
  const autoWriteIntervalRef = useRef(null);

  const rowsRef = useRef([]);
  useEffect(() => {
    rowsRef.current = rows;
  }, [rows]);

  const formrowsRef = useRef([]);
  useEffect(() => {
    formrowsRef.current = formrows;
  }, [formrows]);

  const saveRowsToFile = () => {
    const blob = new Blob([JSON.stringify(rows, null, 2)], {
      type: "application/json",
    });

    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "rows-backup.json";
    a.click();

    URL.revokeObjectURL(url);
  };

  const loadRowsFromFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target.result);
        setRows(json);
      } catch {
        alert("Invalid JSON file");
      }
    };
    reader.readAsText(file);
  };




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
    // console.log(data)
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


  useEffect(() => {
    // 🔁 START polling
    if (autoreadresponse) {
      autoReadIntervalRef.current = setInterval(fetchformSheet, 5000);
    }

    // 🛑 STOP polling
    return () => {
      if (autoReadIntervalRef.current) {
        clearInterval(autoReadIntervalRef.current);
        autoReadIntervalRef.current = null;
      }
    };
  }, [autoreadresponse]);

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

  const getPartyTotals = () => {
    const currentRows = rowsRef.current;

    const totals = Array(8).fill(0); // 8 parties

    for (let r = 0; r < currentRows.length; r++) {
      for (let c = 1; c < 9; c++) {
        totals[c - 1] += Number(currentRows[r][c] || 0);
      }
    }
    console.log(totals)
    return totals;
  };

  const startPlayTopLoop = () => {
    if (!rowsRef.current.length) return;

    const rowSequence = [0, 1];
    let seqIndex = 0;

    const playRow = (rowNO) => {
      const currentRows = rowsRef.current;
      if (!currentRows[rowNO]) return;

      let xml = '';
      if (rowNO === 0) {
        xml += `<componentData id=\\"ccgc1n\\"><data id=\\"text\\" value=\\"${currentRows[rowNO][0]}\\" /></componentData>`;
        const seat = getSeat(currentRows[rowNO]);
        xml += `<componentData id=\\"ccgc1s\\"><data id=\\"text\\" value=\\"${seat}/${currentRows[rowNO][9]}\\" /></componentData>`;
        for (let i = 1; i < 9; i++) {
          xml += `<componentData id=\\"ccgp${i}n\\"><data id=\\"text\\" value=\\"${headers[i]}\\" /></componentData>`;
          xml += `<componentData id=\\"ccgp${i}s\\"><data id=\\"text\\" value=\\"${currentRows[rowNO][i]}\\" /></componentData>`;
        }
      }
      else {
        xml += `<componentData id=\\"ccgc1n\\"><data id=\\"text\\" value=\\"${'महाराष्ट्र'}\\" /></componentData>`;
        const seat = getPartyTotals().reduce((a, b) => a + Number(b || 0), 0);
        const totalAvailableSeats = currentRows.reduce(
          (sum, row) => sum + Number(row[9] || 0),
          0
        );

        xml += `<componentData id=\\"ccgc1s\\"><data id=\\"text\\" value=\\"${seat}/${totalAvailableSeats}\\" /></componentData>`;
        for (let i = 1; i < 9; i++) {
          xml += `<componentData id=\\"ccgp${i}n\\"><data id=\\"text\\" value=\\"${headers[i]}\\" /></componentData>`;
          xml += `<componentData id=\\"ccgp${i}s\\"><data id=\\"text\\" value=\\"${getPartyTotals()[i - 1]}\\" /></componentData>`;
        }
      }
      xml = `"<templateData>${xml}</templateData>"`;
      endpoint({
        action: "endpoint",
        command: `cg 1-96 add 96 "mhmceletion2026/top/top" 1 ${xml}`
      });
    };

    // ▶️ immediate
    playRow(rowSequence[seqIndex]);

    // 🛑 clear old interval if any
    if (topIntervalRef.current) {
      clearInterval(topIntervalRef.current);
      topIntervalRef.current = null;
    }

    topIntervalRef.current = setInterval(() => {
      seqIndex = (seqIndex + 1) % rowSequence.length;
      playRow(rowSequence[seqIndex]);
    }, 5000);
  };


  const startPlayLeftLoop = () => {
    if (!rowsRef.current.length) return;

    // 👇 ONLY rows you are sure exist
    const rowSequence = [1, 2, 3, 5];
    let seqIndex = 0;

    const playRow = (rowNO) => {
      const currentRows = rowsRef.current;

      if (!currentRows[rowNO]) return; // 🛡️ CRITICAL SAFETY
      let xml = '';
      xml += `<componentData id=\\"ccgc1n\\"><data id=\\"text\\" value=\\"${currentRows[rowNO][0]}\\" /></componentData>`;
      const seat = getSeat(currentRows[rowNO]);
      xml += `<componentData id=\\"ccgc1s\\"><data id=\\"text\\" value=\\"${seat}/${currentRows[rowNO][9]}\\" /></componentData>`;
      for (let i = 1; i < 9; i++) {
        xml += `<componentData id=\\"ccgp${i}n\\"><data id=\\"text\\" value=\\"${headers[i]}\\" /></componentData>`;
        xml += `<componentData id=\\"ccgp${i}s\\"><data id=\\"text\\" value=\\"${currentRows[rowNO][i] ?? ""}\\" /></componentData>`;
      }
      xml = `"<templateData>${xml}</templateData>"`;
      endpoint({
        action: "endpoint",
        command: `cg 1-97 add 97 "mhmceletion2026/left/left" 1 ${xml}`
      });
    };

    // ▶️ play first row immediately
    playRow(rowSequence[seqIndex]);

    if (leftIntervalRef.current) {
      clearInterval(leftIntervalRef.current);
      leftIntervalRef.current = null;
    }

    leftIntervalRef.current = setInterval(() => {
      seqIndex = (seqIndex + 1) % rowSequence.length;
      playRow(rowSequence[seqIndex]);
    }, 5000);
  };


  const startPlayRightLoop = () => {
    if (!rowsRef.current.length) return;


    // 👇 ONLY rows you are sure exist
    const rowSequence = [4, 6, 7, 18, 20, 21];
    let seqIndex = 0;

    const playRow = (rowNO) => {
      const currentRows = rowsRef.current;

      if (!currentRows[rowNO]) return; // 🛡️ CRITICAL SAFETY
      let xml = '';
      xml += `<componentData id=\\"${'ccgc1n'}\\"><data id=\\"text\\" value=\\"${currentRows[rowNO][0]}\\" /></componentData>`;
      var seat = getSeat(currentRows[rowNO]);
      xml += `<componentData id=\\"${'ccgc1s'}\\"><data id=\\"text\\" value=\\"${seat + "/" + currentRows[rowNO][9]}\\" /></componentData>`;
      for (let i = 1; i < 9; i++) {
        xml += `<componentData id=\\"${'ccgp' + i + 'n'}\\"><data id=\\"text\\" value=\\"${headers[i]}\\" /></componentData>`;
      }
      for (let i = 1; i < 9; i++) {
        xml += `<componentData id=\\"${'ccgp' + i + 's'}\\"><data id=\\"text\\" value=\\"${currentRows[rowNO][i]}\\" /></componentData>`;
      }
      xml = `"<templateData>${xml}</templateData>"`
      const templateName = 'mhmceletion2026/left/left';
      endpoint({
        action: "endpoint",
        command: `mixer 1-98 fill 0.78 0 1 1`
      });

      endpoint({
        action: "endpoint",
        command: `cg 1-98 add 98 "${templateName}" 1 ${xml}`
      });
    }

    // ▶️ play first row immediately
    playRow(rowSequence[seqIndex]);

    if (rightIntervalRef.current) {
      clearInterval(rightIntervalRef.current);
      rightIntervalRef.current = null;
    }
    rightIntervalRef.current = setInterval(() => {
      seqIndex = (seqIndex + 1) % rowSequence.length;
      playRow(rowSequence[seqIndex]);
    }, 5000);
  };


  const startPlayBottomLoop = () => {
    if (!rowsRef.current.length) return;


    const rowSequence = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 19, 22, 23, 24, 25, 26, 27, 28];
    const ROWS_PER_PAGE = 3;
    let pageIndex = 0;

    const playPage = (start) => {
      const currentRows = rowsRef.current;

      if (rowSequence[start] === undefined || rowSequence[start + 1] === undefined || rowSequence[start + 2] === undefined) return;

      let xml = '';

      // 🔹 WRITE ROW DATA FIRST (IMPORTANT)
      for (let block = 0; block < 3; block++) {
        const rowNO = rowSequence[start + block];
        if (!currentRows[rowNO]) return;

        const seat = getSeat(currentRows[rowNO]);
        const total = currentRows[rowNO][9];

        xml += `<componentData id=\\"ccgc${block + 1}n\\"><data id=\\"text\\" value=\\"${currentRows[rowNO][0]}\\" /></componentData>`;
        xml += `<componentData id=\\"ccgc${block + 1}s\\"><data id=\\"text\\" value=\\"${seat}/${total}\\" /></componentData>`;

        for (let i = 1; i < 9; i++) {
          xml += `<componentData id=\\"ccgp${i}s\\"><data id=\\"text\\" value=\\"${currentRows[rowNO][i]}\\" /></componentData>`;
        }

        for (let i = 1; i < 9; i++) {
          xml += `<componentData id=\\"ccgc${block + 1}p${i}s\\"><data id=\\"text\\" value=\\"${currentRows[rowNO][i]}\\" /></componentData>`;
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

    if (bottomIntervalRef.current) {
      clearInterval(bottomIntervalRef.current);
      bottomIntervalRef.current = null;
    }

    bottomIntervalRef.current = setInterval(() => {
      pageIndex += ROWS_PER_PAGE;
      if (pageIndex >= rowSequence.length) pageIndex = 0;
      playPage(pageIndex);
    }, 5000);
  };


  useEffect(() => {
    // 🛑 Always clear existing interval first
    if (autoWriteIntervalRef.current) {
      clearInterval(autoWriteIntervalRef.current);
      autoWriteIntervalRef.current = null;
    }

    // ❌ Do not start if disabled or no data
    if (!autoWriteresponse || !formrows.length) return;

    // 🔁 Start interval
    autoWriteIntervalRef.current = setInterval(() => {
      writetoDisplaySheet();
    }, 5000);

    // 🧹 Cleanup
    return () => {
      if (autoWriteIntervalRef.current) {
        clearInterval(autoWriteIntervalRef.current);
        autoWriteIntervalRef.current = null;
      }
    };
  }, [autoWriteresponse]);

  const writingRef = useRef(false);

  const writetoDisplaySheet = async () => {
    if (writingRef.current) return;
    if (!formrowsRef.current.length) return;

    writingRef.current = true;

    try {
      const partyOnlyRows = formrowsRef.current.map(row => row.slice(1, 9));
      await fetch("/api/update-google-sheet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          range: "Sheet1!D4:L32",
          values: partyOnlyRows
        })
      });
    } finally {
      writingRef.current = false;
    }
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
              {rows.slice(1).map((row, rIdx) => {
                const realIndex = rIdx + 1;

                return (
                  <tr key={realIndex}>
                    <td>{realIndex}</td>

                    {row.map((cell, cIdx) => (
                      <td key={cIdx}>
                        <input
                          type="text"
                          value={cell}
                          onChange={(e) => {
                            const value = e.target.value;
                            setRows(prev => {
                              const copy = [...prev];
                              copy[realIndex] = [...copy[realIndex]];
                              copy[realIndex][cIdx] = value;
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
                );
              })}

            </tbody>

          </table>
        </div>
      </div>

      <div style={{ minWidth: 150 }}>
        <button onClick={fetchSheet}>Read Once</button>
        <label style={{ display: "block", marginBottom: 8 }}>
          <input
            type="checkbox"
            checked={polling}
            onChange={e => setPolling(e.target.checked)}
          />
          &nbsp;Google Sheet
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
        <div style={{ border: '1px solid red' }}>
          <h3>Save , Open</h3>
          <button onClick={saveRowsToFile}>Save Rows JSON</button>
          <input
            type="file"
            accept="application/json"
            onChange={loadRowsFromFile}
          />
        </div>

        <div style={{ border: '1px solid red' }}>
          <h3>Test</h3>
          <button onClick={() => {
            sendToCaspar(`play 1-1 amb loop`)
          }}>Play BG</button>

        </div>

      </div>

      <div>
        <div style={{ marginLeft: 10 }}>
          <div className="table-wrapper">
            <table className="sheet-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Municipal</th>

                  {headers.slice(1, 9).map((h, i) => (
                    <th key={i}>{h}</th>
                  ))}

                  <th>Timestamp</th>
                  <th>Email</th>
                </tr>
              </thead>

              <tbody>
                {formrows.map((row, rIdx) => (
                  <tr key={rIdx}>
                    <td>{rIdx + 1}</td>

                    {/* Municipal */}
                    <td style={{ textAlign: "left" }}>{row[0]}</td>

                    {/* Party values */}
                    {row.slice(1, 9).map((cell, cIdx) => (
                      <td key={cIdx} style={{ textAlign: "center" }}>
                        {cell}
                      </td>
                    ))}

                    {/* Timestamp */}
                    <td>{row[9]}</td>

                    {/* Email */}
                    <td>{row[10]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div>
          <button onClick={fetchformSheet}>Get form Responses</button>
          <button onClick={writetoDisplaySheet}>write to Display Sheet</button>

          <label style={{ display: "inline", marginBottom: 8 }}>
            <input
              type="checkbox"
              checked={autoreadresponse}
              onChange={e => setautoreadresponse(e.target.checked)}
            />
            &nbsp;Auto read
          </label>

          <label style={{ display: "inline", marginBottom: 8 }}>
            <input
              type="checkbox"
              checked={autoWriteresponse}
              onChange={e => setautoWriteresponse(e.target.checked)}
            />
            &nbsp;Auto Write
          </label>

        </div>


      </div>
    </div >
  </>);
}
