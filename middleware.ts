import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * 以下のパスを除外してミドルウェアを実行:
     * - api (API はルート内で認証するため、リダイレクトしない)
     * - _next/static (静的ファイル)
     * - _next/image (画像最適化API)
     * - favicon.ico (ファビコン)
     * - 画像などの拡張子 (.svg, .png, .jpg, .jpeg, .gif, .webp)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};