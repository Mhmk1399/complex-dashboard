import { NextRequest } from "next/server";

export function getStoreId(request: NextRequest): string {
  const isDev = process.env.NODE_ENV === 'development';
  
  if (isDev) {
    return process.env.NEXT_PUBLIC_DEV_STORE_ID || "default-store";
  }
  
  // Check X-Forwarded-Host header first (for load balancers/proxies)
  const forwardedHost = request.headers.get('x-forwarded-host');
  const hostname = forwardedHost || new URL(request.url).hostname;
  
  // Skip localhost and extract subdomain
  if (hostname === 'localhost' || hostname.startsWith('127.0.0.1')) {
    return process.env.NEXT_PUBLIC_DEV_STORE_ID || "default-store";
  }
  
  const subdomain = hostname.split('.')[0];
  return subdomain || "default-store";
}