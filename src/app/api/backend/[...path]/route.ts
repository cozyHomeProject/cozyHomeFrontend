import { NextRequest } from "next/server"

// Proxy hacia el backend de Spring Boot.
// El navegador llama a /api/backend/<ruta> en el mismo origen del frontend (sin CORS)
// y el servidor de Next.js reenvía el pedido a BACKEND_URL/<ruta>.
// BACKEND_URL se lee en tiempo de ejecución: en Docker Compose vale http://backend:8080.
export const dynamic = "force-dynamic"

type Context = { params: Promise<{ path: string[] }> }

async function proxy(request: NextRequest, context: Context) {
  const backendUrl = process.env.BACKEND_URL ?? "http://localhost:8080"
  const { path } = await context.params
  const target = `${backendUrl}/${path.join("/")}${request.nextUrl.search}`

  const hasBody = !["GET", "HEAD"].includes(request.method)

  try {
    const response = await fetch(target, {
      method: request.method,
      headers: {
        "Content-Type": request.headers.get("content-type") ?? "application/json",
        Accept: request.headers.get("accept") ?? "application/json",
      },
      body: hasBody ? await request.text() : undefined,
      cache: "no-store",
    })

    const headers = new Headers()
    const contentType = response.headers.get("content-type")
    if (contentType) headers.set("content-type", contentType)

    const body = response.status === 204 ? null : await response.arrayBuffer()
    return new Response(body, { status: response.status, headers })
  } catch {
    return Response.json(
      { error: `Could not reach the backend at ${backendUrl}` },
      { status: 502 }
    )
  }
}

export { proxy as GET, proxy as POST, proxy as PUT, proxy as PATCH, proxy as DELETE }
