import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { api, getToken, setToken } from "@/lib/api";

export const Route = createFileRoute("/admin/login")({
  head: () => ({ meta: [{ title: "Admin Login — Auraa" }] }),
  component: AdminLogin,
});

function AdminLogin() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (getToken()) navigate({ to: "/admin/dashboard" });
  }, [navigate]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await api<{ access_token?: string; token?: string }>("/admin/login", {
        method: "POST",
        json: { username, password },
      });
      const token = res.access_token ?? res.token;
      if (!token) throw new Error("No token returned");
      setToken(token);
      navigate({ to: "/admin/dashboard" });
    } catch {
      setError("Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-[400px] bg-card border border-primary rounded-2xl p-10 gold-glow-strong">
        <div className="text-center">
          <h1 className="font-display text-4xl font-bold text-primary">Auraa</h1>
          <p className="text-muted-foreground text-xs mt-1">Admin Portal</p>
        </div>

        <div className="my-6 h-px bg-primary/60" />

        <form onSubmit={submit} className="space-y-5">
          <div>
            <label className="block text-[11px] uppercase tracking-widest text-muted-foreground mb-2">
              Username
            </label>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoComplete="off"
              className="w-full bg-input border border-border focus:border-primary outline-none rounded-lg px-4 py-3 text-foreground transition"
              placeholder="admin"
            />
          </div>
          <div>
            <label className="block text-[11px] uppercase tracking-widest text-muted-foreground mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-input border border-border focus:border-primary outline-none rounded-lg px-4 py-3 text-foreground transition"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-primary-foreground font-bold rounded-lg py-3 transition hover:bg-primary-hover disabled:opacity-60"
          >
            {loading ? "Signing in..." : "Login to Dashboard"}
          </button>

          {error && <p className="text-destructive text-sm text-center">{error}</p>}
        </form>
      </div>
    </div>
  );
}
