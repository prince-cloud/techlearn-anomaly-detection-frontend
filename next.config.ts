import { NextConfig } from 'next'
import path from 'path'
import { CFG } from './src/envConfig'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  sassOptions: {
    includePaths: [path.join(__dirname, "styles")],
  },
  webpack: (config, options) => {
    config.module.rules.push({
      test: /\.tsx/,
      use: [
        options.defaultLoaders.babel,
      ],
    })

    return config
  },
  transpilePackages: [],
  env: {
    NEXTAUTH_URL: CFG.NEXTAUTH_URL,
    NEXTAUTH_SECRET: CFG.NEXTAUTH_SECRET,
    CLIENT_ID: CFG.CLIENT_ID,
    CLIENT_SECRET: CFG.CLIENT_SECRET,
    TENANT_ID: CFG.TENANT_ID,
    SECRET: CFG.SECRET,
    VERCEL_URL: CFG.VERCEL_URL,
    API_URL: CFG.API_URL,
  }
}

export default nextConfig
