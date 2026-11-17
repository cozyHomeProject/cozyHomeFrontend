// Utilidades compartidas para hablar con la API del backend (Spring Data REST)
// a través del proxy /api/backend del propio frontend.

const API = "/api/backend"

export type Link = { href: string }
export type Resource = { _links: { self: Link } }
export type Page<K extends string, T> = { _embedded?: Record<K, T[]> }

export class ApiError extends Error {
  constructor(message: string, readonly status: number) {
    super(message)
  }
}

// "http://backend:8080/groceryLists/3{?projection}" -> 3
export function idFromHref(href: string): number {
  return Number(href.replace(/\{.*\}$/, "").split("/").pop())
}

// El backend usa LocalDateTime (sin zona): guardamos y leemos siempre en UTC.
export function toApiDate(iso: string): string {
  return new Date(iso).toISOString().slice(0, 19)
}

export function fromApiDate(value: string): string {
  return new Date(value.endsWith("Z") ? value : `${value}Z`).toISOString()
}

export function formatDate(date: string) {
  return new Date(date).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", Accept: "application/hal+json" },
  })
  if (!response.ok) {
    throw new ApiError(`${init?.method ?? "GET"} ${path} returned ${response.status}`, response.status)
  }
  const text = await response.text()
  return (text ? JSON.parse(text) : undefined) as T
}

export function items<K extends string, T>(page: Page<K, T>, key: K): T[] {
  return page._embedded?.[key] ?? []
}

// Crea un recurso y devuelve su ruta relativa, por ejemplo "/groceries/7".
export async function create(resource: string, body: object): Promise<string> {
  const created = await request<Resource>(`/${resource}`, {
    method: "POST",
    body: JSON.stringify(body),
  })
  return `/${resource}/${idFromHref(created._links.self.href)}`
}

type UserData = { username: string; name: string }
const userPaths = new Map<string, Promise<string>>()

// Devuelve la ruta del usuario ("/users/3"), creándolo si todavía no existe.
export function userPath(user: UserData): Promise<string> {
  let path = userPaths.get(user.username)
  if (!path) {
    path = (async () => {
      const response = await fetch(`${API}/api/users/${user.username}`)
      if (response.ok) {
        const found = (await response.json()) as { id: number }
        return `/users/${found.id}`
      }
      return create("users", {
        ...user,
        email: `${user.username}@cozyhome.test`,
        password: "cambiar",
      })
    })()
    path.catch(() => userPaths.delete(user.username))
    userPaths.set(user.username, path)
  }
  return path
}

// Mientras no haya login, lo que se crea queda a nombre de este usuario.
export function currentUser(): Promise<string> {
  return userPath({ username: "cozyhome", name: "CozyHome" })
}
