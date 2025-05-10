import React, { useState } from "react"
import { signIn } from "next-auth/react"
import { LdsButton } from "@elilillyco/ux-lds-react"
import { z } from 'zod'
import { useForm } from "react-hook-form"
import { zodResolver } from '@hookform/resolvers/zod'
import { CFG } from "@/envConfig"
import FormField from "@/components/forms/FormField"
import Toast, { ToastSeverity } from "../../components/Toast"
import { useRouter } from "next/router"
import { isArray } from "lodash"

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

export type LoginData = z.infer<typeof LoginSchema>

export default function Login() {
  const [ message, setMessage ] = useState('')
  const [ severity, setSeverity ] = useState<ToastSeverity>('info')
  const router = useRouter()
  const { next } = router.query

  const form = useForm({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: '',
      password: '',
    }
  })
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = form

  function showError(message: string) {
    setSeverity('error')
    setMessage(message)
  }

  function showSuccess(message: string) {
    setSeverity('success')
    setMessage(message)
  }

  function microsoftSso() {
    signIn("azure-ad", {
      callbackUrl: CFG.NEXTAUTH_URL,
    })
  }

  const login = async (data: LoginData) => {
    const { email, password } = data

    try {
      const response = await signIn("credentials", {
        email,
        password,
        redirect: false
      })

      if (!response) {
        throw new Error('No response')
      }

      if (response.error) {
        throw new Error(`Request Failed: ${response.error}`)
      }

      if (!response.ok) {
        throw new Error("Network response was not ok")
      }

      showSuccess("Login Successful")
      await router.push(isArray(next) ? "/" : (next ?? "/"))
    } catch (err: unknown) {
      if (err instanceof Error) {
        showError(`Login Failed: ${err.message}`)
      }
    }
  }

  return (
    <div className="login-container">
      <h1 className="h1">Login</h1>
      <div className="row">
        <div className="col-4"></div>
        <div className="col-4">
          <form onSubmit={handleSubmit(login)}>
            <FormField
              label="Email"
              name="email"
              register={register}
              error={errors.email}
            />

            <FormField
              label="Password"
              name="password"
              type="password"
              register={register}
              error={errors.password} />

            <br />

            <LdsButton type="submit" onClick={() => {}}>Login</LdsButton>
            <br />
            <br />
            <LdsButton type="button" onClick={microsoftSso} disabled>Login with Microsoft</LdsButton>
          </form>
        </div>
        <div className="col-4"></div>

        <Toast message={message} severity={severity} />
      </div>
    </div>
  )
}
