import React from 'react'
import { CircularProgress } from "@mui/material"

export default function LoadingSpinner() {
  return (
    <div className="row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '80vh' }}>
      <div className="col-12" style={{ textAlign: 'center' }}><CircularProgress size="12em" /></div>
    </div>
  )
}
