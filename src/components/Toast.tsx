import React, { useEffect, useState } from 'react'
import Snackbar, { SnackbarCloseReason } from '@mui/material/Snackbar'
import { Alert, AlertColor, AlertPropsColorOverrides, IconButton } from '@mui/material'
import { OverridableStringUnion } from '@mui/types'
import CloseIcon from '@mui/icons-material/Close'

export type ToastSeverity = OverridableStringUnion<AlertColor, AlertPropsColorOverrides>

export interface ToastProps {
  message: string;
  severity: ToastSeverity;
}

export default function Toast({ message, severity }: ToastProps) {
  const [ isOpen, setIsOpen ] = useState(false)

  useEffect(() => {
    if (!message) return

    setIsOpen(true)
    setTimeout(() => {
      setIsOpen(false)
    }, 5000);
  }, [ message ])

  const handleClose = (
    _event: React.SyntheticEvent | Event,
    reason?: SnackbarCloseReason,
  ) => {
    if (reason === 'clickaway') {
      return
    }

    setIsOpen(false);
  };

  const action = (
    <>
      <IconButton
        size="small"
        aria-label="close"
        color="inherit"
        onClick={handleClose}
      >
        <CloseIcon fontSize="small" />
      </IconButton>
    </>
  )

  return (
    <Snackbar
      open={isOpen}
      autoHideDuration={5000}
      onClose={handleClose}
      message={message}
      sx={{
        "& .MuiAlert-icon": {
          alignItems: "center",
        },
      }}
    >
      <Alert
        severity={severity}
      >
        {message}
        {action}
      </Alert>
    </Snackbar>
  )
}
