import { NextResponse, type NextRequest } from "next/server";
import { ACCESS_COOKIE, accessToken, sitePassword } from "@/lib/access";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth";

/** Paths that work without the test password: the gate itself, Payfast and cron callbacks, icons. */
const OPEN = [/^\/access$/, /^\/api\/payfast\/itn$/, /^\/api\/cron\//, /^\/brand\//, /^\/(icon|apple-icon)\.png$/, /^\/manifest\.webmanifest$/, /^\/sw\.js$/];

export async function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;

  // 1. Test mode: whole site behind SITE_PASSWORD.
  const password = sitePassword();
  if (password && !OPEN.some((re) => re.test(pathname))) {
    if (req.cookies.get(ACCESS_COOKIE)?.value !== (await accessToken(password))) {
      const url = req.nextUrl.clone();
      url.pathname = "/access";
      url.search = `?next=${encodeURIComponent(pathname + search)}`;
      const res = NextResponse.redirect(url);
      res.headers.set("X-Robots-Tag", "noindex, nofollow");
      return res;
    }
  }

  // 2. Seller area needs the seller login.
  if (pathname.startsWith("/seller") && pathname !== "/seller/login") {
    const session = await verifySessionToken(req.cookies.get(SESSION_COOKIE)?.value);
    if (!session) {
      const url = req.nextUrl.clone();
      url.pathname = "/seller/login";
      url.search = "";
      return NextResponse.redirect(url);
    }
  }

  const res = NextResponse.next();
  if (password) res.headers.set("X-Robots-Tag", "noindex, nofollow");
  return res;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
