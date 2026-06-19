let accessToken: string | null = null;

export const getToken = () => accessToken;

export async function login(username: string, password: string) {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/login/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  const data = await res.json();
  accessToken = data.access;
  return data;
}