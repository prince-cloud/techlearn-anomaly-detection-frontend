import React from 'react'

interface Props {
  colSpan: number;
}

export default function EmptyTableRow({ colSpan }: Props) {
  return (
    <tr>
      <td colSpan={colSpan} className="center">None</td>
    </tr>
  )
}
