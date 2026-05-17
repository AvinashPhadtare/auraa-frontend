import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { ChefHat, ClipboardList, LogOut, Menu, X, BarChart2 } from "lucide-react";
import { clearToken, getToken } from "@/lib/api";

export function AdminLayout({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const path = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!getToken() && path !== "/admin/login") {
      navigate({ to: "/admin/login" });
    }
  }, [navigate, path]);

  const logout = () => {
    clearToken();
    navigate({ to: "/admin/login" });
  };

  const items = [
    { to: "/admin/dashboard", label: "Dishes", icon: ChefHat },
    { to: "/admin/orders", label: "Orders", icon: ClipboardList },
    { to: "/admin/reports", label: "Reports", icon: BarChart2 },
  ] as const;

  const Sidebar = (
    <aside className="w-60 shrink-0 bg-card border-r border-border min-h-screen flex flex-col">
      <div className="px-6 py-6 border-b border-border">
        <h1 className="font-display text-2xl font-bold text-primary">Auraa</h1>
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground mt-1">Admin</p>
      </div>
      <nav className="flex-1 py-4">
        {items.map((it) => {
          const active = path === it.to;
          const Icon = it.icon;
          return (
            <Link
              key={it.to}
              to={it.to}
              onClick={() => setOpen(false)}
              className={`flex items-center gap-3 px-6 py-3 text-sm transition border-l-2 ${
                active
                  ? "text-primary border-primary bg-primary/10"
                  : "text-muted-foreground border-transparent hover:text-foreground"
              }`}
            >
              <Icon className="h-4 w-4" />
              {it.label}
            </Link>
          );
        })}
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-6 py-3 text-sm text-muted-foreground hover:text-destructive transition border-l-2 border-transparent"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </nav>
    </aside>
  );

  return (
    <div className="min-h-screen bg-background flex">
      <div className="hidden md:block">{Sidebar}</div>

      {/* mobile */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-30 bg-card border-b border-border h-14 flex items-center justify-between px-4">
        <h1 className="font-display text-xl font-bold text-primary">Auraa</h1>
        <button onClick={() => setOpen(true)} aria-label="Open menu">
          <Menu className="h-5 w-5 text-primary" />
        </button>
      </div>
      {open && (
        <div className="md:hidden fixed inset-0 z-40 flex">
          <div className="absolute inset-0 bg-black/60" onClick={() => setOpen(false)} />
          <div className="relative">
            {Sidebar}
            <button
              onClick={() => setOpen(false)}
              className="absolute top-4 right-4 text-muted-foreground"
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}

      <main className="flex-1 min-w-0 pt-14 md:pt-0">{children}</main>
    </div>
  );
}
