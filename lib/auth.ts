import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { prisma } from "./prisma"
import bcrypt from "bcryptjs"

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          const user = await prisma.user.findUnique({
            where: {
              email: credentials.email
            }
          })

          if (!user || !user.password) {
            return null
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          )

          if (!isPasswordValid) {
            return null
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
          }
        } catch (error) {
          console.error("Auth error:", error)
          return null
        }
      }
    })
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // Update session every 24 hours
  },
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      }
    },
  },
  secret: process.env.NEXTAUTH_SECRET || "fallback-development-secret-key",
  pages: {
    signIn: "/login",
    error: "/login"
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      // Handle account linking for OAuth providers
      if (account?.provider === "google" && user.email) {
        try {
          // Check if a user with this email already exists
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email },
            include: { accounts: true }
          })

          if (existingUser) {
            // Check if this Google account is already linked
            const existingGoogleAccount = existingUser.accounts.find(
              acc => acc.provider === "google" && acc.providerAccountId === account.providerAccountId
            )

            if (!existingGoogleAccount) {
              // Link the Google account to the existing user
              await prisma.account.create({
                data: {
                  userId: existingUser.id,
                  type: account.type,
                  provider: account.provider,
                  providerAccountId: account.providerAccountId,
                  refresh_token: account.refresh_token,
                  access_token: account.access_token,
                  expires_at: account.expires_at,
                  token_type: account.token_type,
                  scope: account.scope,
                  id_token: account.id_token,
                  session_state: account.session_state,
                }
              })

              console.log(`Linked Google account to existing user: ${existingUser.email}`)
            }

            // Update the user object to use the existing user's ID
            user.id = existingUser.id
            
            // Update user info if Google provides more recent data
            if (profile?.name && profile.name !== existingUser.name) {
              await prisma.user.update({
                where: { id: existingUser.id },
                data: { 
                  name: profile.name,
                  image: profile.image || existingUser.image
                }
              })
            }
          }
        } catch (error) {
          console.error("Error during account linking:", error)
          // Don't block sign-in if linking fails
        }
      }

      // Allow all sign-ins
      return true
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id
        token.email = user.email
        token.name = user.name
      }
      return token
    },
    async session({ session, token, user }) {
      // With JWT sessions, use token data
      if (token) {
        session.user.id = token.id as string
        session.user.email = token.email as string
        session.user.name = token.name as string
      }
      return session
    },
    async redirect({ url, baseUrl }) {
      // Allows relative callback URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) return url
      return baseUrl
    }
  },
  events: {
    async createUser({ user }) {
      // Give new users (including Google sign-ups) their initial credits
      // Only if this is truly a new user (not an account linking scenario)
      try {
        // Check if user already has credits (might be from account linking)
        const existingUser = await prisma.user.findUnique({
          where: { id: user.id }
        })

        // Only initialize credits if the user doesn't already have them
        if (existingUser && existingUser.credits === 0 && existingUser.totalCreditsEarned === 0) {
          await prisma.user.update({
            where: { id: user.id },
            data: {
              credits: 10,
              totalCreditsEarned: 10,
              totalCreditsSpent: 0,
              lastCreditUpdate: new Date(),
            }
          })

          // Create initial credit transaction
          await prisma.creditTransaction.create({
            data: {
              userId: user.id,
              type: "EARNED_SIGNUP",
              amount: 10,
              description: "Welcome Bonus",
              balanceBefore: 0,
              balanceAfter: 10,
              metadata: {
                timestamp: new Date().toISOString(),
                signupMethod: user.email?.includes("google") ? "google" : "oauth",
              }
            }
          })
        }
      } catch (error) {
        console.error("Failed to initialize credits for new user:", error)
      }
    },
    async signOut(message) {
      console.log("User signed out:", message)
    },
    async session(message) {
      // Suppress session check errors for unauthenticated users
      if (!message.session) {
        return
      }
    }
  },
  logger: {
    error(code, metadata) {
      // Suppress CLIENT_FETCH_ERROR for unauthenticated users
      if (code.includes('CLIENT_FETCH_ERROR')) {
        return
      }
      console.error("NextAuth Error:", code, metadata)
    },
    warn(code) {
      if (code.includes('CLIENT_FETCH_ERROR')) {
        return
      }
      console.warn("NextAuth Warning:", code)
    },
    debug(code, metadata) {
      if (process.env.NODE_ENV === "development") {
        console.debug("NextAuth Debug:", code, metadata)
      }
    }
  },
  debug: false // Disable debug in production to reduce noise
}