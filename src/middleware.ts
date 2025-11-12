// import { withAuth } from "next-auth/middleware";
// import { NextResponse } from "next/server";

// export default withAuth(
//   function middleware(req) {
//     const { pathname } = req.nextUrl;
//     const token = req.nextauth.token;

//     // If the user has a valid session token
//     if (token) {
//       // Prevent logged-in users from visiting auth pages
//       if (pathname === "/auth-choice" || pathname === "/login" || pathname === "/signup") {
//         return NextResponse.redirect(new URL("/", req.url));
//       }
//       return NextResponse.next();
//     }

//     // 🚫 No valid token (session expired or not logged in)
//     // Redirect to auth-choice page if accessing a protected route
//     if (
//       pathname !== "/auth-choice" &&
//       pathname !== "/login" &&
//       pathname !== "/signup" &&
//       !pathname.startsWith("/api") &&
//       !pathname.startsWith("/_next") &&
//       pathname !== "/favicon.ico"
//     ) {
//       return NextResponse.redirect(new URL("/login", req.url));
//     }

//     // Allow unauthenticated users to access auth pages
//     return NextResponse.next();
//   },
//   {
//     callbacks: {
//       authorized: ({ token, req }) => {
//         const { pathname } = req.nextUrl;

//         // Allow access to auth pages
//         if (pathname === "/auth-choice" || pathname === "/login" || pathname === "/signup") {
//           return true;
//         }

//         // Require authentication for other routes
//         return !!token;
//       },
//     },
//   }
// );

// export const config = {
//   matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
// };


import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const { pathname } = req.nextUrl;

    if (token) {
      if (["/login", "/signup", "/auth-choice"].includes(pathname)) {
        return NextResponse.redirect(new URL("/", req.url));
      }
      return NextResponse.next();
    }

    // Not logged in — protect routes
    if (
      !["/login", "/signup", "/auth-choice"].includes(pathname) &&
      !pathname.startsWith("/api") &&
      !pathname.startsWith("/_next")
    ) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token, // rely only on JWT
    },
  }
);

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
