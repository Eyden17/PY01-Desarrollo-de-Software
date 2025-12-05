// src/services/apiClient.js
import { getToken, clearSession } from "./authService";

const API_URL = process.env.REACT_APP_API_URL;
//const API_KEY = process.env.REACT_APP_API_KEY;

export async function apiGet(path) {
  const token = getToken();
  if (!token) {
    throw new Error("No hay token de sesión");
  }

  const res = await fetch(`${API_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (res.status === 401) {
    // token inválido / expirado
    clearSession();
    throw new Error("Sesión expirada. Volvé a iniciar sesión.");
  }

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data?.message || "Error al consumir la API");
  }

  return data.data ?? data;
}

export async function apiPost(path, body) {
  const token = getToken();

  const res = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : "",
    },
    body: JSON.stringify(body),
  });

  const data = await res.json();
  if (!res.ok) {
    const error = new Error(data.message || "Error en la solicitud");
    error.response = { status: res.status, data };
    throw error;
  }
  return data;
}

