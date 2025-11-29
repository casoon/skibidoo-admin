import type { Alpine } from "alpinejs";
import persist from "@alpinejs/persist";

export default (Alpine: Alpine) => {
  Alpine.plugin(persist);

  // Auth store
  Alpine.store("auth", {
    token: Alpine.$persist(null as string | null).as("admin_token"),
    user: Alpine.$persist(null as { id: string; email: string; name: string } | null).as("admin_user"),

    get isAuthenticated() {
      return !!this.token;
    },

    setAuth(token: string, user: { id: string; email: string; name: string }) {
      this.token = token;
      this.user = user;
    },

    logout() {
      this.token = null;
      this.user = null;
      window.location.href = "/login";
    },
  });

  // Sidebar store
  Alpine.store("sidebar", {
    open: Alpine.$persist(true).as("sidebar_open"),
    toggle() {
      this.open = !this.open;
    },
  });

  // Notification store
  Alpine.store("notifications", {
    items: [] as Array<{ id: string; type: "success" | "error" | "info"; message: string }>,

    add(type: "success" | "error" | "info", message: string) {
      const id = crypto.randomUUID();
      this.items.push({ id, type, message });
      setTimeout(() => this.remove(id), 5000);
    },

    remove(id: string) {
      this.items = this.items.filter((n) => n.id !== id);
    },
  });
};
