import NextAuth from "next-auth";
import { authOptions } from "./lib/authOptions";

declare module "next-auth" {
  interface User {
    role?: string;
    accessToken?: string;
    refreshToken?: string;
  }

  interface Session {
    accessToken?: string;
    refreshToken?: string;
    user: {
      id: string;
      email?: string | null;
      name?: string | null;
      role?: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: string;
    accessToken?: string;
    refreshToken?: string;
  }
}

const handler = NextAuth(authOptions);
export default handler;