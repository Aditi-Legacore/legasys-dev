import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth.token;

    // If the user has a valid session token
    if (token) {
      // Prevent logged-in users from visiting login or signup
      if (pathname === "/login" || pathname === "/signup") {
        return NextResponse.redirect(new URL("/", req.url));
      }
      return NextResponse.next();
    }

    // 🚫 No valid token (session expired or not logged in)
    // Redirect to login page if accessing a protected route
    if (
      pathname !== "/login" &&
      pathname !== "/signup" &&
      !pathname.startsWith("/api") &&
      !pathname.startsWith("/_next") &&
      pathname !== "/favicon.ico"
    ) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    // Allow unauthenticated users to access login/signup pages
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;

        // Allow access to login and signup pages
        if (pathname === "/login" || pathname === "/signup") {
          return true;
        }

        // Require authentication for other routes
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
