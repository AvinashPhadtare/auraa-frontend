import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { api, API_BASE } from "@/lib/api";

export const Route = createFileRoute("/bill/$orderId")({
  head: () => ({
    meta: [{ title: "Your Bill — Auraa" }],
  }),
  component: BillPage,
});

interface BillItem {
  dish_name: string;
  quantity: number;
  price_at_time: number;
  subtotal: number;
}

interface Bill {
  order_id: number;
  items: BillItem[];
  total_amount: number;   
  qr_code_url: string;
  status?: string;
}

function BillPage() {
  const { orderId } = Route.useParams();
  const [bill, setBill] = useState<Bill | null>(null);
  const [error, setError] = useState(false);
  const [paid, setPaid] = useState(false);
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    api<Bill>(`/user/order/${orderId}/bill`)
      .then((b) => {
        setBill(b);
        if (b.status === "paid") setPaid(true);
      })
      .catch(() => setError(true));
  }, [orderId]);

  const handlePay = async () => {
    setPaying(true);
    try {
      await api(`/user/order/${orderId}/pay`, { method: "POST" });
      setPaid(true);
    } catch {
      toast.error("Payment confirmation failed");
    } finally {
      setPaying(false);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <p className="font-display italic text-primary text-2xl">Order not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-[480px] rounded-2xl bg-card border border-primary p-8 gold-glow-strong">
        <div className="text-center">
          <h1 className="font-display text-4xl font-bold text-primary">Auraa</h1>
          <p className="text-muted-foreground text-sm mt-1">Your Order</p>
        </div>

        <div className="my-6 h-px bg-primary/60" />

        {!bill ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-6 rounded skeleton-shimmer" />
            ))}
          </div>
        ) : (
          <>
            <div className="space-y-3">
              {bill.items.map((it, i) => (
                <div key={i}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-foreground flex-1 pr-2">{it.dish_name}</span>
                    <span className="text-muted-foreground w-12 text-center">x{it.quantity}</span>
                    <span className="text-foreground w-20 text-right">₹{it.subtotal}</span>
                  </div>
                  {i < bill.items.length - 1 && <div className="my-2 h-px bg-border" />}
                </div>
              ))}
            </div>

            <div className="my-5 h-px bg-primary/60" />

            <div className="flex items-center justify-between">
              <span className="text-foreground font-bold">Total</span>
              <span className="text-primary font-display text-3xl font-bold">
                ₹{bill.total_amount}
              </span>
            </div>

            {!paid && (
              <>
                <div className="mt-8 text-center">
                  <h2 className="text-primary font-semibold mb-3">Scan to Pay</h2>
                  <div className="inline-block bg-white p-3 rounded-lg">
                    <img
                      src={`${API_BASE}${bill.qr_code_url}`}
                      alt="UPI payment QR code"
                      className="h-[200px] w-[200px] block"
                    />
                  </div>
                  <p className="text-muted-foreground text-xs mt-3">Scan with any UPI app</p>
                </div>

                <button
                  onClick={handlePay}
                  disabled={paying}
                  className="mt-8 w-full bg-primary text-primary-foreground font-bold rounded-lg py-4 transition hover:bg-primary-hover disabled:opacity-60"
                >
                  {paying ? "Confirming..." : "✓ I have Paid"}
                </button>
              </>
            )}

            {paid && (
              <div className="mt-8 text-center">
                <button
                  disabled
                  className="w-full rounded-lg py-4 font-bold text-white"
                  style={{ background: "oklch(0.7 0.18 145)" }}
                >
                  ✓ Payment Confirmed
                </button>
                <p className="mt-6 font-display italic text-primary">
                  Thank you for dining at Auraa
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
