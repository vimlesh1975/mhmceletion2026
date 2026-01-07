'use client'

import { useEffect, useState, useRef } from "react";
import "./page.css"

const headers = [
  "district/party",
  "भाजप",
  "शिवसेना",
  "राकाँपा",
  "काँग्रेस",
  "SSUBT",
  "NCPSP",
  "मनसे",
  "इतर",
  "Total"
];


export default function SheetTable() {
  const [rows, setRows] = useState([]);
  const [polling, setPolling] = useState(false); // ✅ toggle

  const [autoUpdateTop, setAutoUpdateTop] = useState(false); // ✅ toggle
  const [autoUpdateLeft, setAutoUpdateLeft] = useState(false); // ✅ toggle
  const [autoUpdateRight, setAutoUpdateRight] = useState(false); // ✅ toggle
  const [pollingBottom, setPollingBottom] = useState(false); // ✅ toggle




  const intervalRef = useRef(null);
  const intervalRefBottom = useRef(null);
  const intervalRefTop = useRef(null);
  const intervalRefLeft = useRef(null);
  const intervalRefRight = useRef(null);

  const bottomPageRef = useRef(0);


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

  useEffect(() => {
    if (!pollingBottom) return;
    if (!rows.length) return;

    const ROWS_PER_PAGE = 3;

    const maxPage = Math.floor(rows.length / ROWS_PER_PAGE);
    if (maxPage === 0) return;

    intervalRefBottom.current = setInterval(() => {
      const startIndex = bottomPageRef.current * ROWS_PER_PAGE;

      playBottom(startIndex);

      bottomPageRef.current =
        (bottomPageRef.current + 1) % maxPage;

    }, 5000);

    return () => {
      if (intervalRefBottom.current) {
        clearInterval(intervalRefBottom.current);
        intervalRefBottom.current = null;
      }
    };
  }, [pollingBottom]); // 🔥 rows REMOVED





  const sendToCaspar = (str) => {
    endpoint({
      action: 'endpoint',
      command: str,
    });
  }

  const getSeat = (row) => {
    let seat = 0;
    for (let i = 1; i < 7; i++) seat += Number(row[i] || 0);
    return seat;
  };


  const playBottom = (j) => {

    if (!rows.length) return;

    const maxRow = rows.length - 1;
    if (j + 5 > maxRow) return; // prevent overflow

    let xml = '';
    var rowNO = 3 + j;

    xml += `<componentData id=\\"${'ccgc1n'}\\"><data id=\\"text\\" value=\\"${rows[rowNO][0]}\\" /></componentData>`;
    var seat = getSeat(rows[rowNO]);


    xml += `<componentData id=\\"${'ccgc1s'}\\"><data id=\\"text\\" value=\\"${seat + "/" + rows[rowNO][7]}\\" /></componentData>`;

    for (let i = 1; i < 7; i++) {
      xml += `<componentData id=\\"${'ccgp' + i + 'n'}\\"><data id=\\"text\\" value=\\"${headers[i]}\\" /></componentData>`;
    }

    for (let i = 1; i < 7; i++) {
      xml += `<componentData id=\\"${'ccgp' + i + 's'}\\"><data id=\\"text\\" value=\\"${rows[rowNO][i]}\\" /></componentData>`;
    }


    var rowNO = 4 + j;
    xml += `<componentData id=\\"${'ccgc2n'}\\"><data id=\\"text\\" value=\\"${rows[rowNO][0]}\\" /></componentData>`;


    var seat = getSeat(rows[rowNO]);


    xml += `<componentData id=\\"${'ccgc2s'}\\"><data id=\\"text\\" value=\\"${seat + "/" + rows[rowNO][7]}\\" /></componentData>`;


    for (let i = 1; i < 7; i++) {
      xml += `<componentData id=\\"${'ccgc2p' + i + 's'}\\"><data id=\\"text\\" value=\\"${rows[rowNO][i]}\\" /></componentData>`;
    }



    var rowNO = 5 + j;

    xml += `<componentData id=\\"${'ccgc3n'}\\"><data id=\\"text\\" value=\\"${rows[rowNO][0]}\\" /></componentData>`;


    var seat = getSeat(rows[rowNO]);

    xml += `<componentData id=\\"${'ccgc3s'}\\"><data id=\\"text\\" value=\\"${seat + "/" + rows[rowNO][7]}\\" /></componentData>`;

    for (let i = 1; i < 7; i++) {
      xml += `<componentData id=\\"${'ccgc3p' + i + 's'}\\"><data id=\\"text\\" value=\\"${rows[rowNO][i]}\\" /></componentData>`;
    }



    xml = `"<templateData>${xml}</templateData>"`
    const templateName = 'mhmceletion2026/bottom/bottom';

    endpoint({
      action: "endpoint",
      command: `cg 1-99 add 99 "${templateName}" 1 ${xml}`
    });

  }


  return (<>
    <div style={{ display: 'flex' }}>
      <div>
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
        <label style={{ display: "block", marginBottom: 8 }}>
          <input
            type="checkbox"
            checked={polling}
            onChange={e => setPolling(e.target.checked)}
          />
          &nbsp;Get data from Google Sheet (5 sec)
        </label>

        <button onClick={() => sendToCaspar(`clear 1`)}>Stop All</button>

        <div style={{ border: '1px solid red' }}>
          <h3> Top</h3>
          <button onClick={() => {
            let xml = '';
            let rowNO = 0;
            xml += `<componentData id=\\"${'ccgc1n'}\\"><data id=\\"text\\" value=\\"${rows[rowNO][0]}\\" /></componentData>`;
            var seat = getSeat(rows[rowNO]);


            xml += `<componentData id=\\"${'ccgc1s'}\\"><data id=\\"text\\" value=\\"${seat + "/" + rows[rowNO][7]}\\" /></componentData>`;

            for (let i = 1; i < 7; i++) {
              xml += `<componentData id=\\"${'ccgp' + i + 'n'}\\"><data id=\\"text\\" value=\\"${headers[i]}\\" /></componentData>`;
            }

            for (let i = 1; i < 7; i++) {
              xml += `<componentData id=\\"${'ccgp' + i + 's'}\\"><data id=\\"text\\" value=\\"${rows[rowNO][i]}\\" /></componentData>`;
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
            let rowNO = 0;
            xml += `<componentData id=\\"${'ccgc1n'}\\"><data id=\\"text\\" value=\\"${rows[rowNO][0]}\\" /></componentData>`;
            var seat = getSeat(rows[rowNO]);


            xml += `<componentData id=\\"${'ccgc1s'}\\"><data id=\\"text\\" value=\\"${seat + "/" + rows[rowNO][7]}\\" /></componentData>`;

            for (let i = 1; i < 7; i++) {
              xml += `<componentData id=\\"${'ccgp' + i + 'n'}\\"><data id=\\"text\\" value=\\"${headers[i]}\\" /></componentData>`;
            }

            for (let i = 1; i < 7; i++) {
              xml += `<componentData id=\\"${'ccgp' + i + 's'}\\"><data id=\\"text\\" value=\\"${rows[rowNO][i]}\\" /></componentData>`;
            }

            xml = `"<templateData>${xml}</templateData>"`
            const templateName = 'mhmceletion2026/top/top';
            endpoint({
              action: "endpoint",
              command: `cg 1-96 update 96 ${xml}`
            });
          }}>Update</button>
          <button onClick={() => {
            endpoint({
              action: "endpoint",
              command: `cg 1-96 stop 96`
            });
          }}>Stop</button>

          <label style={{ display: "block", marginBottom: 8 }}>
            <input
              type="checkbox"
              checked={autoUpdateTop}
              onChange={e => setAutoUpdateTop(e.target.checked)}
            />
            &nbsp;Auto Update
          </label>

        </div>

        <div style={{ border: '1px solid red' }}>
          <h3> Left</h3>
          <button onClick={() => {
            let xml = '';
            let rowNO = 1;

            xml += `<componentData id=\\"${'ccgc1n'}\\"><data id=\\"text\\" value=\\"${rows[rowNO][0]}\\" /></componentData>`;
            var seat = getSeat(rows[rowNO]);

            xml += `<componentData id=\\"${'ccgc1s'}\\"><data id=\\"text\\" value=\\"${seat + "/" + rows[rowNO][7]}\\" /></componentData>`;

            for (let i = 1; i < 7; i++) {
              xml += `<componentData id=\\"${'ccgp' + i + 'n'}\\"><data id=\\"text\\" value=\\"${headers[i]}\\" /></componentData>`;
            }

            for (let i = 1; i < 7; i++) {
              xml += `<componentData id=\\"${'ccgp' + i + 's'}\\"><data id=\\"text\\" value=\\"${rows[rowNO][i]}\\" /></componentData>`;
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
            let rowNO = 1;

            xml += `<componentData id=\\"${'ccgc1n'}\\"><data id=\\"text\\" value=\\"${rows[rowNO][0]}\\" /></componentData>`;
            var seat = getSeat(rows[rowNO]);

            xml += `<componentData id=\\"${'ccgc1s'}\\"><data id=\\"text\\" value=\\"${seat + "/" + rows[rowNO][7]}\\" /></componentData>`;

            for (let i = 1; i < 7; i++) {
              xml += `<componentData id=\\"${'ccgp' + i + 'n'}\\"><data id=\\"text\\" value=\\"${headers[i]}\\" /></componentData>`;
            }

            for (let i = 1; i < 7; i++) {
              xml += `<componentData id=\\"${'ccgp' + i + 's'}\\"><data id=\\"text\\" value=\\"${rows[rowNO][i]}\\" /></componentData>`;
            }

            xml = `"<templateData>${xml}</templateData>"`
            const templateName = 'mhmceletion2026/left/left';
            endpoint({
              action: "endpoint",
              command: `cg 1-97 update 97 ${xml}`
            });
          }}>Update</button>

          <button onClick={() => {
            endpoint({
              action: "endpoint",
              command: `cg 1-97 stop 97`
            });
          }}>Stop</button>


          <label style={{ display: "block", marginBottom: 8 }}>
            <input
              type="checkbox"
              checked={autoUpdateLeft}
              onChange={e => setAutoUpdateLeft(e.target.checked)}
            />
            &nbsp;Auto Update
          </label>

        </div>
        <div style={{ border: '1px solid red' }}>
          <h3> Right</h3>

          <button onClick={() => {
            let xml = '';
            let rowNO = 2;

            xml += `<componentData id=\\"${'ccgc1n'}\\"><data id=\\"text\\" value=\\"${rows[rowNO][0]}\\" /></componentData>`;
            var seat = getSeat(rows[rowNO]);


            xml += `<componentData id=\\"${'ccgc1s'}\\"><data id=\\"text\\" value=\\"${seat + "/" + rows[rowNO][7]}\\" /></componentData>`;

            for (let i = 1; i < 7; i++) {
              xml += `<componentData id=\\"${'ccgp' + i + 'n'}\\"><data id=\\"text\\" value=\\"${headers[i]}\\" /></componentData>`;
            }

            for (let i = 1; i < 7; i++) {
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

          }}>Play Right</button>

          <button onClick={() => {
            let xml = '';
            let rowNO = 2;

            xml += `<componentData id=\\"${'ccgc1n'}\\"><data id=\\"text\\" value=\\"${rows[rowNO][0]}\\" /></componentData>`;
            var seat = getSeat(rows[rowNO]);


            xml += `<componentData id=\\"${'ccgc1s'}\\"><data id=\\"text\\" value=\\"${seat + "/" + rows[rowNO][7]}\\" /></componentData>`;

            for (let i = 1; i < 7; i++) {
              xml += `<componentData id=\\"${'ccgp' + i + 'n'}\\"><data id=\\"text\\" value=\\"${headers[i]}\\" /></componentData>`;
            }

            for (let i = 1; i < 7; i++) {
              xml += `<componentData id=\\"${'ccgp' + i + 's'}\\"><data id=\\"text\\" value=\\"${rows[rowNO][i]}\\" /></componentData>`;
            }

            xml = `"<templateData>${xml}</templateData>"`

            endpoint({
              action: "endpoint",
              command: `cg 1-98 update 98 ${xml}`
            });

          }}>Update</button>
          <button onClick={() => {
            endpoint({
              action: "endpoint",
              command: `cg 1-98 stop 98`
            });
          }}>Stop</button>

          <label style={{ display: "block", marginBottom: 8 }}>
            <input
              type="checkbox"
              checked={autoUpdateRight}
              onChange={e => setAutoUpdateRight(e.target.checked)}
            />
            &nbsp;Auto Update
          </label>

        </div>

        <div style={{ border: '1px solid red' }}>
          <h3> Bottom</h3>
          <button onClick={() => {
            const k = 0;
            playBottom(k * 3)
          }}>Play Bottom</button>

          <button onClick={() => {
            var j = 0;
            if (!rows.length) return;

            const maxRow = rows.length - 1;
            if (j + 5 > maxRow) return; // prevent overflow

            let xml = '';
            var rowNO = 3 + j;

            xml += `<componentData id=\\"${'ccgc1n'}\\"><data id=\\"text\\" value=\\"${rows[rowNO][0]}\\" /></componentData>`;
            var seat = getSeat(rows[rowNO]);


            xml += `<componentData id=\\"${'ccgc1s'}\\"><data id=\\"text\\" value=\\"${seat + "/" + rows[rowNO][7]}\\" /></componentData>`;

            for (let i = 1; i < 7; i++) {
              xml += `<componentData id=\\"${'ccgp' + i + 'n'}\\"><data id=\\"text\\" value=\\"${headers[i]}\\" /></componentData>`;
            }

            for (let i = 1; i < 7; i++) {
              xml += `<componentData id=\\"${'ccgp' + i + 's'}\\"><data id=\\"text\\" value=\\"${rows[rowNO][i]}\\" /></componentData>`;
            }


            var rowNO = 4 + j;
            xml += `<componentData id=\\"${'ccgc2n'}\\"><data id=\\"text\\" value=\\"${rows[rowNO][0]}\\" /></componentData>`;


            var seat = getSeat(rows[rowNO]);


            xml += `<componentData id=\\"${'ccgc2s'}\\"><data id=\\"text\\" value=\\"${seat + "/" + rows[rowNO][7]}\\" /></componentData>`;


            for (let i = 1; i < 7; i++) {
              xml += `<componentData id=\\"${'ccgc2p' + i + 's'}\\"><data id=\\"text\\" value=\\"${rows[rowNO][i]}\\" /></componentData>`;
            }



            var rowNO = 5 + j;

            xml += `<componentData id=\\"${'ccgc3n'}\\"><data id=\\"text\\" value=\\"${rows[rowNO][0]}\\" /></componentData>`;


            var seat = getSeat(rows[rowNO]);

            xml += `<componentData id=\\"${'ccgc3s'}\\"><data id=\\"text\\" value=\\"${seat + "/" + rows[rowNO][7]}\\" /></componentData>`;

            for (let i = 1; i < 7; i++) {
              xml += `<componentData id=\\"${'ccgc3p' + i + 's'}\\"><data id=\\"text\\" value=\\"${rows[rowNO][i]}\\" /></componentData>`;
            }



            xml = `"<templateData>${xml}</templateData>"`

            endpoint({
              action: "endpoint",
              command: `cg 1-99 update 99 ${xml}`
            });

          }}>Update</button>
          <button onClick={() => {
            endpoint({
              action: "endpoint",
              command: `cg 1-99 stop 99`
            });
          }}>Stop</button>

          <label style={{ display: "block", marginBottom: 8 }}>
            <input
              type="checkbox"
              checked={pollingBottom}
              onChange={e => setPollingBottom(e.target.checked)}
            />
            &nbsp;Send Bottom data (5 sec)
          </label>

        </div>


      </div>

    </div>

  </>);
}
