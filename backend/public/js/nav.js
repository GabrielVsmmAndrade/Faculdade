/**
 * nav.js — renderiza a sidebar em todas as páginas autenticadas.
 * Inclua após api.js: <script src="/js/nav.js"></script>
 * Use: Nav.init("events")  — passa a chave da página ativa
 */
const Nav = (() => {
  const items = [
    { key: "dashboard",  label: "Dashboard",    icon: "⬡", href: "/dashboard.html" },
    { key: "events",     label: "Ocorrências",  icon: "⚡", href: "/events.html" },
    { key: "devices",    label: "Dispositivos", icon: "📡", href: "/devices.html" },
    { key: "users",      label: "Usuários",     icon: "👥", href: "/users.html" },
    { key: "reports",    label: "Relatórios",   icon: "📊", href: "/reports.html" },
  ];

  function init(activeKey) {
    if (!API.requireAuth()) return;
    const user = API.getUser() || {};

    const sidebar = document.getElementById("sidebar");
    if (!sidebar) return;

    const navHtml = items.map(it => `
      <a class="nav-item ${it.key === activeKey ? "active" : ""}" href="${it.href}">
        <span class="icon">${it.icon}</span>
        ${it.label}
      </a>`).join("");

    const initials = (user.full_name || user.username || "?")
      .split(" ").map(w => w[0]).slice(0,2).join("").toUpperCase();

    const avatarHtml = user.avatar_url
      ? `<img src="${user.avatar_url}" alt="">`
      : initials;

    sidebar.innerHTML = `
      <div class="sidebar-logo">
        <div class="logo-text">PANIC<span style="color:var(--t2)">IOT</span></div>
        <div class="logo-sub">Emergency Response</div>
      </div>
      <nav class="sidebar-nav">
        <div class="nav-section">Menu</div>
        ${navHtml}
      </nav>
      <div class="sidebar-footer">
        <div class="sidebar-user">
          <div class="avatar">${avatarHtml}</div>
          <div class="info">
            <div class="name">${user.full_name || user.username || "Usuário"}</div>
            <div class="role">${user.role || ""}</div>
          </div>
        </div>
        <button class="btn-logout" onclick="API.logout()">↪ Sair</button>
      </div>`;
  }

  return { init };
})();

/* ── Toast helper ── */
function toast(msg, type = "info") {
  let wrap = document.getElementById("toast-wrap");
  if (!wrap) {
    wrap = document.createElement("div");
    wrap.id = "toast-wrap";
    wrap.className = "toast-wrap";
    document.body.appendChild(wrap);
  }
  const t = document.createElement("div");
  t.className = `toast ${type}`;
  t.textContent = msg;
  wrap.appendChild(t);
  setTimeout(() => t.remove(), 3500);
}

/* ── Format helpers ── */
function fmtDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("pt-BR");
}
function fmtDateShort(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("pt-BR");
}
function statusBadge(status) {
  const map = { ABERTO: "badge-aberto", ACK: "badge-ack", ENCERRADO: "badge-encerrado" };
  return `<span class="badge ${map[status] || ''}">${status}</span>`;
}
function levelBadge(level) {
  const map = { ALTO: "badge-alto", MEDIO: "badge-medio", BAIXO: "badge-baixo" };
  return `<span class="badge ${map[level] || ''}">${level}</span>`;
}
