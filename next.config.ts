import type { NextConfig } from "next";

/**
 * Security headers. The CSP only restricts what is safe to restrict without breaking uploads
 * or payments: no framing, no plugins, base URL and form posts limited to us and Payfast.
 */
const securityHeaders = [
  {
    key: "Content-Security-Policy",
    value: [
      "frame-ancestors 'none'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self' https://www.payfast.co.za https://sandbox.payfast.co.za",
    ].join("; "),
  },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(self), microphone=(), geolocation=(), payment=()" },
  { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      // Seller pages and receipts must never be cached by shared caches.
      { source: "/seller/:path*", headers: [{ key: "Cache-Control", value: "private, no-store" }] },
      { source: "/receipt/:path*", headers: [{ key: "Cache-Control", value: "private, no-store" }, { key: "X-Robots-Tag", value: "noindex" }] },
      { source: "/sw.js", headers: [{ key: "Cache-Control", value: "no-cache" }] },
    ];
  },
};

export default nextConfig;
