import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import connectDB from "@/lib/mongodb"
import User from "@/models/User"
import { LoginSchema } from "@/lib/validations/auth"

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          // Validate credentials
          const validatedData = LoginSchema.parse(credentials)

          await connectDB()

          // Find user by email
          const user = await User.findOne({ email: validatedData.email })

          if (!user) {
            throw new Error("Invalid email or password")
          }

          // Check if user is banned
          if (user.isBanned) {
            throw new Error("Your account has been banned. Please contact support.")
          }

          // Check if helper is approved
          if (user.role === "HELPER" && !user.isApproved) {
            throw new Error("Your account is pending admin approval. Please wait for approval email.")
          }

          // Verify password
          const isPasswordValid = await bcrypt.compare(validatedData.password, user.password)

          if (!isPasswordValid) {
            throw new Error("Invalid email or password")
          }

          // Return user object (will be stored in JWT)
          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            role: user.role,
            isApproved: user.isApproved,
            isVerified: user.isVerified,
            profilePhoto: user.profilePhoto || "",
          }
        } catch (error: any) {
          console.error("Authorization error:", error.message)
          throw new Error(error.message || "Authentication failed")
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      // Add user data to token on login
      if (user) {
        token.id = user.id
        token.role = user.role
        token.isApproved = user.isApproved
        token.isVerified = user.isVerified
        token.profilePhoto = user.profilePhoto
      }
      return token
    },
    async session({ session, token }) {
      // Add user data to session
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
        session.user.isApproved = token.isApproved as boolean
        session.user.isVerified = token.isVerified as boolean
        session.user.profilePhoto = token.profilePhoto as string
      }
      return session
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
}
