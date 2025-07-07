import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  // Vérifier si nous sommes sur la page Dashboard avec un token
  if (req.nextUrl.pathname === '/Dashboard') {
    const token = req.nextUrl.searchParams.get('token');
    if (token) {
      // Si un token est présent dans l'URL, permettre l'accès
      return NextResponse.next();
    }
  }

  // Pour les autres routes, vérifier le token dans les cookies
  const token = req.cookies.get("token")?.value;
  if (!token) {
    return NextResponse.redirect(new URL("/signin", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/protected/:path*"], // ✅ Corrigé : Applique le middleware à toutes les sous-routes de `/protected`
};
