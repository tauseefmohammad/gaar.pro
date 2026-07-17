export async function api(url: string, options?: RequestInit) {
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers || {})
    }
  })

  if (!res.ok) throw new Error("API Error")

  return res.json()
  // this amarenda edited 
}