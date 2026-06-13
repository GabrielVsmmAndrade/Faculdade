/**
 * api.js — wrapper de fetch com JWT automático.
 * Todas as páginas incluem este arquivo.
 */
const API = (() => {
  const BASE = "/api";

  function getToken() { return localStorage.getItem("panic_token"); }
  function getUser()  { return JSON.parse(localStorage.getItem("panic_user") || "null"); }
  function setSession(token, user) {
    localStorage.setItem("panic_token", token);
    localStorage.setItem("panic_user", JSON.stringify(user));
  }
  function clearSession() {
    localStorage.removeItem("panic_token");
    localStorage.removeItem("panic_user");
  }

  function requireAuth() {
    if (!getToken()) { window.location.href = "/login.html"; return false; }
    return true;
  }

  async function request(method, path, body = null, isFile = false) {
    const headers = { Authorization: `Bearer ${getToken()}` };
    if (!isFile) headers["Content-Type"] = "application/json";

    const opts = { method, headers };
    if (body) opts.body = isFile ? body : JSON.stringify(body);

    const res = await fetch(BASE + path, opts);

    if (res.status === 401) {
      clearSession();
      window.location.href = "/login.html";
      return null;
    }

    const ct = res.headers.get("content-type") || "";
    if (ct.includes("json")) return res.json();
    if (ct.includes("xml") || ct.includes("text")) return res.text();
    return res.blob();
  }

  return {
    getToken, getUser, setSession, clearSession, requireAuth,
    get:    (path)        => request("GET",    path),
    post:   (path, body)  => request("POST",   path, body),
    put:    (path, body)  => request("PUT",    path, body),
    del:    (path)        => request("DELETE", path),
    upload: (path, form)  => request("POST",   path, form, true),

    async login(username, password) {
      const res = await fetch(BASE + "/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao fazer login");
      setSession(data.token, data.user);
      return data;
    },

    async logout() {
      try { await request("POST", "/auth/logout"); } catch (_) {}
      clearSession();
      window.location.href = "/login.html";
    },
  };
})();
