import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Minus, Plus, ShoppingBag } from "lucide-react";
import { api } from "@/lib/api";

export const Route = createFileRoute("/menu")({
  head: () => ({
    meta: [
      { title: "Menu — Auraa Fine Dining" },
      { name: "description", content: "Explore Auraa's curated dishes and place your order." },
    ],
  }),
  component: MenuPage,
});

interface Dish {
  id: number;
  dish_name: string;
  price: number;
  category: string;
  image_url: string | null;
}

function MenuPage() {
  const navigate = useNavigate();
  const [tableNumber, setTableNumber] = useState<string | null>(null);
  const [dishes, setDishes] = useState<Dish[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [qty, setQty] = useState<Record<number, number>>({});
  const [placing, setPlacing] = useState(false);
  const [activeCategory, setActiveCategory] = useState("All");


  useEffect(() => {
    if (typeof window !== "undefined") {
      const search = new URLSearchParams(window.location.search);
      setTableNumber(search.get("table"));
    }

    api<Dish[]>("/menu")
      .then((d) => setDishes(d))
      .catch((e) => setError(e.message ?? "Failed to load menu"));
  }, []);

  const setQ = (id: number, n: number) => setQty((p) => ({ ...p, [id]: Math.max(0, n) }));

  const totalItems = Object.values(qty).reduce((a, b) => a + b, 0);
  const categories = ["All", "Starters", "Main Course", "Desserts", "Drinks", "Specials"];

  const filteredDishes = dishes
    ? activeCategory === "All"
      ? dishes
      : dishes.filter((d) => d.category === activeCategory)
    : null;

  const placeOrder = async () => {
    const items = Object.entries(qty)
      .filter(([, n]) => n > 0)
      .map(([id, n]) => ({ dish_id: Number(id), quantity: n }));
    if (!items.length) return;
    setPlacing(true);
    try {
      const res = await api<{ order_id: number }>("/user/order", {
        method: "POST",
        json: {
          table_number: tableNumber,
          items,
        },
      });
      navigate({ to: "/bill/$orderId", params: { orderId: String(res.order_id) } });
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to place order");
      setPlacing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-32">
      <header className="border-b border-border">
        <div className="mx-auto max-w-6xl px-6 py-6 flex items-center justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold text-primary tracking-wide">Auraa</h1>
            {tableNumber && <p>Table {tableNumber}</p>}
            <p className="text-xs italic text-primary/80 mt-0.5">Fine Dining Experience</p>
          </div>
          <div className="relative">
            <ShoppingBag className="h-6 w-6 text-primary" />
            {totalItems > 0 && (
              <span className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-primary text-primary-foreground text-[11px] font-bold flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </div>
        </div>
        <div className="h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent" />
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10">
        <h2 className="font-display text-2xl text-foreground mb-2">Our Menu</h2>
        <p className="text-muted-foreground text-sm mb-4">
          Crafted with passion. Served with elegance.
        </p>

        <div className="flex gap-2 flex-wrap mb-8">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium border transition ${
                activeCategory === cat
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-border text-muted-foreground hover:border-primary hover:text-primary"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {error && (
          <div className="text-center py-20 text-primary italic font-display text-lg">{error}</div>
        )}

        {!dishes && !error && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-36 rounded-xl skeleton-shimmer" />
            ))}
          </div>
        )}

        {dishes && dishes.length === 0 && (
          <div className="text-center py-20 font-display italic text-primary text-lg">
            Menu is being updated...
          </div>
        )}

        {filteredDishes && filteredDishes.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDishes.map((d) => {
              const n = qty[d.id] ?? 0;
              const active = n > 0;
              return (
                <div
                  key={d.id}
                  className={`group rounded-xl bg-card border overflow-hidden transition-all duration-200 hover:border-primary hover:gold-glow ${
                    active ? "border-primary border-l-4" : "border-border"
                  }`}
                >
                  {d.image_url ? (
                    <img
                      src={`http://localhost:8000${d.image_url}`}
                      alt={d.dish_name}
                      className="w-full h-40 object-cover"
                    />
                  ) : (
                    <div className="w-full h-40 bg-secondary flex items-center justify-center">
                      <span className="text-muted-foreground text-xs">No image</span>
                    </div>
                  )}
                  <div className="p-5">
                    <h3 className="text-lg font-semibold text-foreground">{d.dish_name}</h3>
                    <p className="text-primary font-medium mt-1">₹{d.price}</p>
                    <p className="text-muted-foreground text-xs mt-0.5">{d.category}</p>

                    <div className="mt-5 flex items-center gap-4">
                      <button
                        onClick={() => setQ(d.id, n - 1)}
                        disabled={n === 0}
                        aria-label="Decrease"
                        className="h-8 w-8 rounded-full border border-primary/60 text-primary flex items-center justify-center transition hover:bg-primary hover:text-primary-foreground disabled:opacity-30 disabled:cursor-not-allowed disabled:border-border disabled:text-muted-foreground disabled:hover:bg-transparent"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="min-w-8 text-center font-bold text-foreground">{n}</span>
                      <button
                        onClick={() => setQ(d.id, n + 1)}
                        aria-label="Increase"
                        className="h-8 w-8 rounded-full border border-primary text-primary flex items-center justify-center transition hover:bg-primary hover:text-primary-foreground"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {totalItems > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-card border-t-2 border-primary z-40">
          <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between gap-4">
            <span className="text-foreground text-sm sm:text-base">
              <span className="font-bold text-primary">{totalItems}</span>{" "}
              {totalItems === 1 ? "item" : "items"} selected
            </span>
            <button
              onClick={placeOrder}
              disabled={placing}
              className="bg-primary text-primary-foreground font-bold rounded-lg px-6 py-3 transition hover:bg-primary-hover disabled:opacity-60"
            >
              {placing ? "Placing..." : "Place Order →"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
