import NextAuth from "next-auth";

declare module "next-auth" {
  interface User {
    id: string;
    username: string;
    role: string;
    employeeName: string;
    orgId: string;
  }

  interface Session {
    user: {
      id: string;
      username: string;
      employeeName: string;
      role: string;
      orgId: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    username: string;
    employeeName: string;
    role: string;
    orgId: string;
  }
}
