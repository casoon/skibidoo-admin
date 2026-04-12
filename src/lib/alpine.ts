import type { Alpine } from "alpinejs";
// @ts-ignore — @alpinejs/persist ships no .d.ts; types declared below
import persist from "@alpinejs/persist";

type AuthUser = { id: string; email: string; name: string };
type NotificationType = "success" | "error" | "info";
type NotificationItem = { id: string; type: NotificationType; message: string };

// --- Module augmentation (requires the alpinejs import above) ---

declare module "alpinejs" {
  /** $persist magic property added by @alpinejs/persist plugin */
  interface Alpine {
    $persist<T>(value: T): T & { as(key: string): T };
  }

  interface Stores {
    auth: {
      token: string | null;
      user: AuthUser | null;
      readonly isAuthenticated: boolean;
      setAuth(token: string, user: AuthUser): void;
      logout(): void;
    };
    sidebar: {
      open: boolean;
      toggle(): void;
    };
    notifications: {
      items: NotificationItem[];
      add(type: NotificationType, message: string): void;
      remove(id: string): void;
    };
  }
}

// ----------------------------------------------------------------

export default (Alpine: Alpine) => {
  Alpine.plugin(persist);

  // Auth store
  Alpine.store("auth", {
    token: Alpine.$persist(null as string | null).as("admin_token"),
    user: Alpine.$persist(null as AuthUser | null).as("admin_user"),

    get isAuthenticated() {
      return !!this.token;
    },

    setAuth(token: string, user: AuthUser) {
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
    items: [] as NotificationItem[],

    add(
      this: { items: NotificationItem[]; remove: (id: string) => void },
      type: NotificationType,
      message: string
    ) {
      const id = crypto.randomUUID();
      this.items.push({ id, type, message });
      setTimeout(() => this.remove(id), 5000);
    },

    remove(this: { items: NotificationItem[] }, id: string) {
      this.items = this.items.filter((n) => n.id !== id);
    },
  });
};
