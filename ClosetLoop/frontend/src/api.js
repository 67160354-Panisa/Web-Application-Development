const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

async function request(path, options = {}) {
  const token = localStorage.getItem("closetloop_token");
  const headers = { "Content-Type": "application/json", ...(options.headers || {}) };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });
  let data = {};
  try { data = await res.json(); } catch {}
  if (!res.ok) throw new Error(data.detail || data.message || "Something went wrong");
  return data;
}

export const api = {
  register: (body) => request("/register", { method: "POST", body: JSON.stringify(body) }),
  login: (body) => request("/login", { method: "POST", body: JSON.stringify(body) }),
  logout: () => request("/logout", { method: "POST" }),
  changePassword: (body) => request("/change-password", { method: "POST", body: JSON.stringify(body) }),
  me: () => request("/me"),
  updateUser: (id, body) => request(`/users/${id}`, { method: "PUT", body: JSON.stringify(body) }),
  checkUsername: (name) => request(`/check-username/${encodeURIComponent(name)}`),
  closet: () => request("/closet"),
  createCloset: (body) => request("/closet", { method: "POST", body: JSON.stringify(body) }),
  deleteCloset: (id) => request(`/closet/${id}`, { method: "DELETE" }),
  products: (params = "") => request(`/products${params}`),
  createProduct: (body) => request("/products", { method: "POST", body: JSON.stringify(body) }),
  deleteProduct: (id) => request(`/products/${id}`, { method: "DELETE" }),
  generateOutfit: (body) => request("/outfits/generate", { method: "POST", body: JSON.stringify(body) }),
  orders: () => request("/orders"),
  createOrder: (body) => request("/orders", { method: "POST", body: JSON.stringify(body) }),
};
