import { z } from 'zod'

const EnvConfigSchema = z.object({
  NEXTAUTH_URL: z.string(),
  NEXTAUTH_SECRET: z.string(),
  CLIENT_ID: z.string().optional(),
  CLIENT_SECRET: z.string().optional(),
  TENANT_ID: z.string().optional(),
  NODE_ENVIRONMENT: z.string().optional(),
  SECRET: z.string().optional(),
  VERCEL_URL: z.string().url().optional(),
  API_URL: z.string().url(),
})

export type EnvConfig = z.infer<typeof EnvConfigSchema>

const env = EnvConfigSchema.safeParse({
  NEXTAUTH_URL: process.env.NEXTAUTH_URL,
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
  CLIENT_ID: process.env.CLIENT_ID,
  CLIENT_SECRET: process.env.CLIENT_SECRET,
  TENANT_ID: process.env.TENANT_ID,
  NODE_ENVIRONMENT: process.env.NODE_ENVIRONMENT,
  SECRET: process.env.SECRET,
  VERCEL_URL: process.env.VERCEL_URL,
  API_URL: process.env.API_URL,
})

if (!env.success) {
  console.error("Invalid Environment Variables: ", env.error.format())
  throw new Error("Invalid Environment Variables")
}

export const CFG = env.data
