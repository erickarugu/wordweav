import { NextAuthOptions, getServerSession } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/auth";
import { generateCSRFToken } from "@/lib/csrf";
import { recordFailedAttempt, isIPBlocked } from "@/lib/security";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: "openid email profile",
          prompt: "consent",
        },
      },
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          const clientIP =
            req?.headers?.["x-forwarded-for"] ||
            req?.headers?.["x-real-ip"] ||
            "unknown";

          // Check if IP is blocked
          if (isIPBlocked(clientIP as string)) {
            console.warn(`Blocked IP attempted login: ${clientIP}`);
            return null;
          }

          const user = await prisma.user.findUnique({
            where: { email: credentials.email.toLowerCase() },
          });

          if (!user || !user.password) {
            // Record failed attempt even for non-existent users to prevent enumeration
            recordFailedAttempt(clientIP as string);
            return null;
          }

          const isValidPassword = await verifyPassword(
            credentials.password,
            user.password
          );

          if (!isValidPassword) {
            recordFailedAttempt(clientIP as string);
            return null;
          }

          // Successful login - return user data
          return {
            id: user.id,
            name: user.name,
            email: user.email,
            image: user.image,
          };
        } catch (error) {
          console.error("Authentication error:", error);
          return null;
        }
      },
    }),
  ],
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 hours
    updateAge: 60 * 60, // 1 hour
  },
  jwt: {
    maxAge: 24 * 60 * 60, // 24 hours
  },
  callbacks: {
    async jwt({ token, user, account }) {
      // Include user ID in token
      if (user) {
        token.id = user.id;
      }

      // Add security metadata
      if (account) {
        token.provider = account.provider;
        token.providerAccountId = account.providerAccountId;
      }

      // Add CSRF token
      if (!token.csrfToken) {
        token.csrfToken = await generateCSRFToken(token.id as string);
      }

      return token;
    },
    async session({ session, token }) {
      // Add user ID to session
      if (token.id) {
        session.user.id = token.id as string;
      }

      // Add security metadata
      if (token.provider) {
        session.user.provider = token.provider as string;
      }

      if (token.csrfToken) {
        session.csrfToken = token.csrfToken as string;
      }

      return session;
    },
    async signIn({ user, account, profile }) {
      try {
        // Additional security checks for OAuth providers
        if (account?.provider === "google" || account?.provider === "github") {
          // Verify email is verified with OAuth provider
          if (
            account.provider === "google" &&
            (profile as { email_verified?: boolean })?.email_verified === false
          ) {
            console.warn(
              "Google account with unverified email attempted login"
            );
            return false;
          }

          // Check for suspicious OAuth activity
          if (user.email && user.email.includes("+")) {
            // Allow but log potential alias emails
            console.info(`OAuth login with alias email: ${user.email}`);
          }
        }

        // For credentials provider, additional checks are in authorize function
        return true;
      } catch (error) {
        console.error("SignIn callback error:", error);
        return false;
      }
    },
    async redirect({ url, baseUrl }) {
      // Prevent open redirect vulnerabilities
      if (url.startsWith("/")) {
        return `${baseUrl}${url}`;
      }

      // Only allow redirects to the same origin
      if (new URL(url).origin === baseUrl) {
        return url;
      }

      return baseUrl;
    },
  },
  events: {
    async signIn({ user, account, isNewUser }) {
      console.info(
        `User signed in: ${user.email} via ${account?.provider || "credentials"}`
      );

      if (isNewUser) {
        console.info(`New user registered: ${user.email}`);

        // You could add welcome email logic here
        // await sendWelcomeEmail(user.email);
      }
    },
    async signOut({ token }) {
      console.info(`User signed out: ${token?.email || "unknown"}`);
    },
    async createUser({ user }) {
      console.info(`New user created: ${user.email}`);
    },
  },
  debug: process.env.NODE_ENV === "development",
  secret: process.env.NEXTAUTH_SECRET,
};

// Enhanced session validation with security checks
export async function getSecureSession() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return null;
  }

  // Additional session validation
  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email! },
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      // Session exists but user doesn't - possible compromise
      console.warn(
        `Session exists for non-existent user: ${session.user.email}`
      );
      return null;
    }

    return {
      ...session,
      user: {
        ...session.user,
        ...user,
      },
    };
  } catch (error) {
    console.error("Session validation error:", error);
    return null;
  }
}

// Role-based access control
export async function requireRole(roles: string[]) {
  const session = await getSecureSession();

  if (!session) {
    throw new Error("Unauthorized");
  }

  // For now, implement basic role checking
  // You can extend this with actual roles from the database
  const userRole = "user"; // Default role

  if (!roles.includes(userRole)) {
    throw new Error("Insufficient permissions");
  }

  return session;
}

// Session-based CSRF validation
export async function validateSessionCSRF(token: string) {
  const session = await getSecureSession();

  if (!session?.csrfToken) {
    return false;
  }

  return session.csrfToken === token;
}
