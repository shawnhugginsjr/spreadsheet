// eslint-disable-next-line
import React from 'react'
import Cell from './Cell'

/**
 * Row manages a single row of the table
 */
const Row = (props) => {
  const cells = []
  const y = props.y
  for (let x = 0; x < props.x; x += 1) {
    cells.push(
      <Cell
        key={`${x}-${y}`}
        y={y}
        x={x}
        onChangedValue={props.handleChangedCell}
        updateCells={props.updateCells}
        value={props.rowData[x] || ''}
        executeFormula={props.executeFormula}
      />,
    )
  }
  return (
    <tr>
      {cells}
    </tr>
  )
}

export default Row
