import React from 'react'
import { LdsTextField } from "@elilillyco/ux-lds-react"
import { FieldError, FieldValues, Path, UseFormRegister } from "react-hook-form"

interface FormFieldProps<T extends FieldValues> {
  label: string;
  type?: string;
  placeholder?: string;
  name: string;
  register: UseFormRegister<T>;
  error?: FieldError;
  valueAsNumber?: boolean;
}

export default function FormField<T extends FieldValues>({ type, placeholder, name, label, error, register, valueAsNumber }: FormFieldProps<T>) {
  return (
    <LdsTextField
      id={name}
      label={label}
      type={type ?? "text"}
      placeholder={placeholder ?? name}
      className={`login-${name}`}
      {...register(name as Path<T>, { valueAsNumber })}
      state={error ? "error" : "success"}
      stateMessage={error?.message}
    />
  )
}
