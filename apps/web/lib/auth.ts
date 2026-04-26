import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { DEMO_PASSWORD, findUserByEmail, findSubscriptionsForUser } from "@traderiq/api";
import type { Role, SubStatus, ProductSlug } from "@traderiq/api";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      firstName: string;
      lastName: string;
      role: Role;
      productSlug: ProductSlug;
      status: SubStatus;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    firstName: string;
    lastName: string;
    role: Role;
    productSlug: ProductSlug;
    status: SubStatus;
  }
}

/**
 * Phase 1: Credentials provider with hardcoded demo users (spec §12).
 * Phase 2: replace with Argon2 password hashes from Postgres + Twilio SMS-OTP step.
 */
export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  pages: { signIn: "/login" },
  providers: [
    CredentialsProvider({
      name: "Trader IQ",
      credentials: {
        email: { label: "E-Mail", type: "email" },
        password: { label: "Passwort", type: "password" },
      },
      async authorize(creds) {
        if (!creds?.email || !creds?.password) return null;
        if (creds.password !== DEMO_PASSWORD) return null;
        const user = findUserByEmail(creds.email);
        if (!user) return null;
        const subs = findSubscriptionsForUser(user.id);
        // Pick the "primary" sub: first active, else first one we have.
        const primary = subs.find((s) => s.status === "ACTIVE") ?? subs[0];
        if (!primary) return null;
        return {
          id: user.id,
          email: user.email,
          name: `${user.firstName} ${user.lastName}`,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          productSlug: primary.productSlug,
          status: primary.status,
        } as unknown as { id: string };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const u = user as unknown as {
          id: string;
          firstName: string;
          lastName: string;
          role: Role;
          productSlug: ProductSlug;
          status: SubStatus;
        };
        token.id = u.id;
        token.firstName = u.firstName;
        token.lastName = u.lastName;
        token.role = u.role;
        token.productSlug = u.productSlug;
        token.status = u.status;
      }
      return token;
    },
    async session({ session, token }) {
      session.user = {
        id: token.id,
        email: session.user?.email ?? "",
        firstName: token.firstName,
        lastName: token.lastName,
        role: token.role,
        productSlug: token.productSlug,
        status: token.status,
      };
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET ?? "phase-1-demo-secret-DO-NOT-USE-IN-PROD",
};
