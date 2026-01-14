import React, { forwardRef, useImperativeHandle, useEffect, useState } from 'react'

const Mixer = forwardRef(({ sendToCaspar, layer }, ref) => {
  const [x, setX] = useState(0.00);
  const [y, setY] = useState(0.00);
  const [scaleX, setScaleX] = useState(1.00);
  const [scaleY, setScaleY] = useState(1.00);

  useImperativeHandle(ref, () => ({
    setX,
    setY,
    setScaleX,
    setScaleY,
  }));

  useEffect(() => {
    sendToCaspar(`mixer 1-${layer} fill ${x} ${y} ${scaleX} ${scaleY} `);
  }, [x, y, scaleX, scaleY, layer])
  return (
    <div style={{ border: '1px solid blue', margin: 10 }}>
      {/* <label>Mixer fill: </label> */}
      <div style={{ marginLeft: 30 }}>
        <label>X: </label> <input max={2} step="0.01" style={{ width: 50 }} type='number' value={x} onChange={e => {
          setX(e.target.value);
        }} />
        <label style={{ marginLeft: 32 }}>Y: </label> <input max={2} step="0.01" style={{ width: 50 }} type='number' value={y} onChange={e => {
          setY(e.target.value);
        }
        } />
      </div>
      <div>
        <label>scaleX: </label> <input step="0.01" style={{ width: 50 }} type='number' value={scaleX} onChange={e => {
          setScaleX(e.target.value);
        }} />
        <label>scaleY: </label> <input step="0.01" style={{ width: 50 }} type='number' value={scaleY} onChange={e => {
          setScaleY(e.target.value);
        }} />
      </div>

      <div>
        <button onClick={() => {
          setX(0);
          setY(0);
          setScaleX(1);
          setScaleY(1);
        }}> Reset</button>
      </div>

    </div>
  )
})

export default Mixer
