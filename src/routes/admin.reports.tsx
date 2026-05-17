import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { AdminLayout } from "@/components/admin/AdminLayout";

export const Route = createFileRoute("/admin/reports")({
  head: () => ({ meta: [{ title: "Reports — Auraa Admin" }] }),
  component: () => (
    <AdminLayout>
      <Reports />
    </AdminLayout>
  ),
});

interface DailyReport {
  date: string;
  total_orders: number;
  total_revenue: number;
  average_order_value: number;
  most_ordered_dish: string;
}

function Reports() {
  const [report, setReport] = useState<DailyReport | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api<DailyReport>("/admin/reports/daily", { auth: true })
      .then((data) => {
        setReport(data);
        setLoading(false);
      })
      .catch((e) => {
        toast.error(e.message);
        setLoading(false);
      });
  }, []);

  const cards = report
    ? [
        { label: "Total Orders", value: report.total_orders, icon: "📦" },
        { label: "Total Revenue", value: `₹${report.total_revenue}`, icon: "💰" },
        { label: "Avg Order Value", value: `₹${report.average_order_value}`, icon: "📊" },
        { label: "Most Ordered", value: report.most_ordered_dish, icon: "🍽️" },
      ]
    : [];

  return (
    <div className="p-6 md:p-10">
      <div className="mb-8">
        <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground">
          Daily Report
        </h2>
        <p className="text-muted-foreground text-sm mt-1">
          {report ? `Summary for ${report.date}` : "Loading today's summary..."}
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-32 rounded-xl skeleton-shimmer" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {cards.map((card) => (
            <div
              key={card.label}
              className="bg-card border border-border rounded-xl p-6 hover:border-primary transition"
            >
              <div className="text-3xl mb-3">{card.icon}</div>
              <p className="text-muted-foreground text-xs uppercase tracking-widest mb-1">
                {card.label}
              </p>
              <p className="text-foreground font-display text-2xl font-bold">{card.value}</p>
            </div>
          ))}
        </div>
      )}

      {report && report.total_orders === 0 && (
        <div className="mt-12 text-center">
          <p className="font-display italic text-primary text-lg">
            No orders yet today. The day is young!
          </p>
        </div>
      )}
    </div>
  );
}
