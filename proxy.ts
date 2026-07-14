import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function proxy(req: any) {
  const token = await getToken({
    req,
    secret: process.env.AUTH_SECRET,
  });

  const { pathname } = req.nextUrl;

  // Not logged in
  if (!token && pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // Role restriction
  if (pathname.startsWith("/dashboard") && token?.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/fund-request", req.url));
  }
  if (pathname.startsWith("/organizations")) {
    if (token?.role !== "SYS_ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  }

  return NextResponse.next();
}
