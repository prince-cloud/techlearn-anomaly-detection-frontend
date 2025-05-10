import NextAuth from "next-auth/next"
// import AzureADProvider from "next-auth/providers/azure-ad"
import CredentialsProvider from "next-auth/providers/credentials"
import { login, refreshAcessToken } from "@/app/api/auth"
import { NextApiRequest, NextApiResponse } from "next"
import { NextAuthOptions, Session, User } from "next-auth"

interface ApiUser extends User {
  access: string;
  access_expiration: string;
  refresh: string;
  refresh_expiration: string;
  user: {
    email: string;
    first_name: string;
    last_name: string;
  }
}

export interface ExtendedSession extends Session {
  accessToken: string;
  refreshToken: string;
  name: string;
  email: string;
}

const getNextAuthOptions = (req: NextApiRequest): NextAuthOptions => ({
  // I want to fully disable authentication when the node environment is set to development. How can I do this?
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: {},
        password: {}
      },
      async authorize(credentials) {
        if (!credentials) {
          return null
        }

        const { email, password } = credentials

        const response = await login(req, email, password)

        if (!response) {
          return null
        }

        return response.data
      }
    }),
    // AzureADProvider({
    //   clientId: CFG.CLIENT_ID,
    //   clientSecret: CFG.CLIENT_SECRET,
    //   tenantId: CFG.TENANT_ID,
    //   authorization: {
    //     url: "https://login.microsoftonline.com/18a59a81-eea8-4c30-948a-d8824cdc2580/oauth2/v2.0/authorize",
    //     params: { scope: "openid email profile" },
    //   },
    //   token: {
    //     url: "https://login.microsoftonline.com/18a59a81-eea8-4c30-948a-d8824cdc2580/oauth2/v2.0/token",
    //   },
    // }),
  ],
  session: {
    // Use JSON Web Tokens for session instead of database sessions.
    // This option can be used with or without a database for users/accounts.
    // Note: `strategy` should be set to 'jwt' if no database is used.
    strategy: "jwt",

    // Seconds - How long until an idle session expires and is no longer valid.
    maxAge: 30 * 24 * 60 * 60, // 30 days

    // Seconds - Throttle how frequently to write to database to extend a session.
    // Use it to limit write operations. Set to 0 to always update the database.
    // Note: This option is ignored if using JSON Web Tokens
    // updateAge: 24 * 60 * 60, // 24 hours
  },

  // JSON Web tokens are only used for sessions if the `jwt: true` session
  // option is set - or by default if no database is specified.
  // https://next-auth.js.org/configuration/options#jwt
  jwt: {
    // You can define your own encode/decode functions for signing and encryption
    // if you want to override the default behaviour.
    // encode: async ({ secret, token, maxAge }) => {},
    // decode: async ({ secret, token, maxAge }) => {},
  },

  // You can define custom pages to override the built-in ones. These will be regular Next.js pages
  // so ensure that they are placed outside of the '/api' folder, e.g. signIn: '/auth/mycustom-signin'
  // The routes shown here are the default URLs that will be used when a custom
  // pages is not specified for that route.
  // https://next-auth.js.org/configuration/pages
  pages: {
    signIn: "/auth/login",
    signOut: "/auth/logout",
    // error: '/auth/error', // Error code passed in query string as ?error=
    // verifyRequest: '/auth/verify-request', // Used for check email page
    // newUser: null // If set, new users will be directed here on first sign in
  },

  // Callbacks are asynchronous functions you can use to control what happens
  // when an action is performed.
  // https://next-auth.js.org/configuration/callbacks
  callbacks: {
    // async signIn({ user, account, profile, email, credentials }) { return true },
    // async redirect({ url, baseUrl }) { return baseUrl },
    // async session({ session, token, user }) { return session },
    // async jwt({ token, user, account, profile, isNewUser }) { return token }

    async session({ session, token }) {
      const { accessToken, refreshToken, name, email } = token

      return {
        ...session,
        name,
        email,
        accessToken,
        refreshToken,
      }
    },
    async jwt({ token, user }) {
      if (!user) return token

      const apiUser = {
        ...user
      } as ApiUser
      // Persist the OAuth access_token to the token right after signin
      token.accessToken = apiUser.access
      token.refreshToken = apiUser.refresh
      token.email = apiUser.user.email
      token.name = `${apiUser.user.first_name ?? ''} ${apiUser.user.last_name ?? ''}`
      token.accessExpiration = apiUser.access_expiration
      token.refreshExpiration = apiUser.refresh_expiration

      if (Date.now() > new Date(token.accessExpiration as string).getTime()) {
        const newAccessToken = await refreshAcessToken(req, token.refreshToken as string)

        if (!newAccessToken) {
          throw new Error("Failed to refresh access token")
        }

        token.accessToken = newAccessToken
      }

      return token
    },
  },

  // Events are useful for logging
  // https://next-auth.js.org/configuration/events
  events: {},

  // You can set the theme to 'light', 'dark' or use 'auto' to default to the
  // whatever prefers-color-scheme is set to in the browser. Default is 'auto'
  theme: {
    colorScheme: "light",
  },

  // Enable debug messages in the console if you are having problems
  debug: false,
})

export default (req: NextApiRequest, res: NextApiResponse) => {
  return NextAuth(req, res, getNextAuthOptions(req))
}
