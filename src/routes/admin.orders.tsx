import { createFileRoute } from "@tanstack/react-router";
import { Fragment as FragmentRow } from "react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { ChevronDown, ChevronRight, UtensilsCrossed } from "lucide-react";
import { api } from "@/lib/api";
import { AdminLayout } from "@/components/admin/AdminLayout";

export const Route = createFileRoute("/admin/orders")({
  head: () => ({ meta: [{ title: "Orders — Auraa Admin" }] }),
  component: () => (
    <AdminLayout>
      <Orders />
    </AdminLayout>
  ),
});

interface OrderItem {
  dish_name: string;
  quantity: number;
  price_at_time?: number;
  subtotal?: number;
}


interface Order {
  id: number;
  items?: OrderItem[];
  total_amount: number;
  created_at?: string;
  status: string;
  table_number?: string;
}

function Orders() {
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [details, setDetails] = useState<Record<number, Order>>({});
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const prevCountRef = useRef<number>(0);
  const playAlert = () => {
    const ctx = new AudioContext();

    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();

    oscillator.connect(gain);
    gain.connect(ctx.destination);

    oscillator.frequency.value = 800;

    gain.gain.setValueAtTime(0.3, ctx.currentTime);

    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.5);
  };

  const load = (silent = false, filter = activeFilter) => {
    const url = filter === "all" ? "/admin/orders" : `/admin/orders?filter=${filter}`;
    api<Order[]>(url, { auth: true })
      .then((data) => {
        if (silent && data.length > prevCountRef.current) {
          playAlert();
        }

        prevCountRef.current = data.length;

        setOrders(data);
        setLastUpdated(new Date());
      })
      .catch((e) => !silent && toast.error(e.message));
  };

  useEffect(() => {
    load(false, activeFilter);
    timer.current = setInterval(() => load(true, activeFilter), 30000);
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, []);

  const toggleExpand = async (o: Order) => {
    if (expanded === o.id) {
      setExpanded(null);
      return;
    }
    setExpanded(o.id);
    if (!details[o.id]) {
      try {
        const detail = await api<Order>(`/admin/orders/${o.id}`, { auth: true });
        setDetails((p) => ({ ...p, [o.id]: detail }));
      } catch (e: any) {
        toast.error(e.message);
      }
    }
  };
  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await api(`/admin/orders/${deleteTarget}`, { method: "DELETE", auth: true });
      toast.success(`Order #${deleteTarget} deleted`);
      setDeleteTarget(null);
      load();
    } catch (e: any) {
      toast.error(e.message);
    }
  };
  const fmtTime = (s?: string) => (s ? new Date(s).toLocaleString() : "—");
  const itemsLabel = (o: Order) =>
    (o.items ?? details[o.id]?.items ?? []).map((i) => `${i.dish_name} x${i.quantity}`).join(", ") || "—";

  return (
    <div className="p-6 md:p-10">
      <div className="flex items-center justify-between mb-8 flex-wrap gap-3">
        <div>
          <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground">
            Paid Orders
          </h2>
          <div className="flex items-center gap-2 mt-2">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full rounded-full bg-success opacity-75 animate-ping" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
            </span>
            <span className="text-success text-xs font-medium">Live</span>
          </div>
        </div>
                <div className="flex gap-2 flex-wrap">
          {["all", "today", "week", "month"].map((f) => (
            <button
              key={f}
              onClick={() => {
                setActiveFilter(f);
                load(false, f);
              }}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition ${
                activeFilter === f
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-border text-muted-foreground hover:border-primary hover:text-primary"
              }`}
            >
              {f === "all" ? "All Time" : f === "today" ? "Today" : f === "week" ? "This Week" : "This Month"}
            </button>
          ))}
        </div>
        {lastUpdated && (
          <p className="text-xs text-muted-foreground">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </p>
        )}
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-primary/40">
              <th className="w-10" />
              <th className="text-left text-[11px] uppercase tracking-widest text-muted-foreground px-4 py-4">
                Order
              </th>
              <th className="text-left text-[11px] uppercase tracking-widest text-muted-foreground px-4 py-4">
                Table
              </th>
              <th className="text-left text-[11px] uppercase tracking-widest text-muted-foreground px-4 py-4 hidden md:table-cell">
                Items
              </th>
              <th className="text-left text-[11px] uppercase tracking-widest text-muted-foreground px-4 py-4">
                Total
              </th>
              <th className="text-left text-[11px] uppercase tracking-widest text-muted-foreground px-4 py-4 hidden sm:table-cell">
                Time
              </th>
              <th className="text-left text-[11px] uppercase tracking-widest text-muted-foreground px-4 py-4">
                Status
              </th>
              <th className="text-left text-[11px] uppercase tracking-widest text-muted-foreground px-4 py-4">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {!orders &&
              Array.from({ length: 3 }).map((_, i) => (
                <tr key={i} className="border-b border-border">
                  <td colSpan={8} className="px-6 py-5">
                    <div className="h-4 rounded skeleton-shimmer" />
                  </td>
                </tr>
              ))}
            {orders && orders.length === 0 && (
              <tr>
                <td colSpan={8} className="text-center py-16">
                  <UtensilsCrossed className="h-10 w-10 text-primary mx-auto mb-3" />
                  <p className="text-muted-foreground">No paid orders yet</p>
                </td>
              </tr>
            )}
            {orders?.map((o) => {
              const isOpen = expanded === o.id;
              const full = details[o.id] ?? o;
              return (
                <FragmentRow key={o.id}>
                  <tr
                    onClick={() => toggleExpand(o)}
                    className="border-b border-border last:border-0 hover:bg-secondary/40 transition cursor-pointer"
                  >
                    <td className="px-2 py-4 text-muted-foreground">
                      {isOpen ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </td>
                    <td className="px-4 py-4 text-foreground font-medium">#{o.id}</td>
                    <td className="px-4 py-4 text-primary font-semibold">
                      {o.table_number ? `Table ${o.table_number}` : "—"}
                    </td>
                    <td className="px-4 py-4 text-muted-foreground hidden md:table-cell truncate max-w-xs">
                      {itemsLabel(o)}
                    </td>
                    <td className="px-4 py-4 text-primary font-semibold">₹{o.total_amount}</td>
                    <td className="px-4 py-4 text-muted-foreground text-sm hidden sm:table-cell">
                      {fmtTime(o.created_at)}
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className="inline-block text-xs font-semibold px-3 py-1 rounded-full border"
                        style={{
                          color: "oklch(0.7 0.18 145)",
                          borderColor: "oklch(0.7 0.18 145)",
                          background: "oklch(0.7 0.18 145 / 0.1)",
                        }}
                      >
                        Paid
                      </span>
                    </td>

                    <td className="px-4 py-4">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteTarget(o.id);
                        }}
                        className="flex items-center gap-1 border border-destructive text-destructive text-xs rounded-md px-3 py-1.5 hover:bg-destructive hover:text-destructive-foreground transition"
                      >
                        🗑 Delete
                      </button>
                    </td>
                  </tr>
                  {isOpen && (
                    <tr className="border-b border-border bg-background">
                      <td colSpan={8} className="px-8 py-5">
                        {full.items && full.items.length > 0 ? (
                          <div>
                            <div className="space-y-2">
                              {full.items.map((it, i) => (
                                <div key={i} className="flex items-center justify-between text-sm">
                                  <span className="text-foreground flex-1">{it.dish_name}</span>
                                  <span className="text-muted-foreground w-16 text-center">
                                    x{it.quantity}
                                  </span>
                                  <span className="text-muted-foreground w-20 text-right">
                                    ₹{it.price_at_time ?? "—"}
                                  </span>
                                  <span className="text-foreground w-20 text-right">
                                    ₹{it.subtotal ?? (it.price_at_time ?? 0) * it.quantity}
                                  </span>
                                </div>
                              ))}
                            </div>
                            <div className="my-3 h-px bg-primary/60" />
                            <div className="flex justify-end">
                              <span className="text-primary font-display text-lg font-bold">
                                Total: ₹{full.total_amount}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <div className="text-muted-foreground text-sm">Loading details...</div>
                        )}
                      </td>
                    </tr>
                  )}
                </FragmentRow>
              );
            })}
          </tbody>
        </table>
      </div>
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/70" onClick={() => setDeleteTarget(null)} />
          <div className="relative w-full max-w-md bg-card border border-primary rounded-xl p-6">
            <h3 className="text-lg font-bold text-foreground mb-2">Delete Order?</h3>
            <p className="text-muted-foreground text-sm mb-6">
              Are you sure you want to delete{" "}
              <span className="text-primary">Order #{deleteTarget}</span>? This cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 text-sm bg-destructive text-destructive-foreground rounded-lg font-bold hover:opacity-90"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
