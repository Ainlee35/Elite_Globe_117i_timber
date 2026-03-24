import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useOrders } from "@/context/OrderContext";
import { Order } from "@/data/products";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { CreditCard, Smartphone, CheckCircle2 } from "lucide-react";

export default function Checkout() {
  const { items, totalAmount, clearCart } = useCart();
  const { user } = useAuth();
  const { addOrder } = useOrders();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: user?.name || "",
    phone: "",
    address: "",
  });
  const [paymentMethod, setPaymentMethod] = useState<"mobile" | "card">("mobile");
  const [processing, setProcessing] = useState(false);
  const [completed, setCompleted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.address) {
      toast.error("Please fill in all fields");
      return;
    }

    setProcessing(true);
    setTimeout(() => {
      const order: Order = {
        id: `ORD-${Date.now().toString().slice(-6)}`,
        userId: user?.id || "",
        items,
        totalAmount,
        status: "pending",
        paymentStatus: "paid",
        customerName: form.name,
        customerPhone: form.phone,
        customerAddress: form.address,
        createdAt: new Date().toISOString(),
      };
      addOrder(order);
      clearCart();
      setProcessing(false);
      setCompleted(true);
    }, 2000);
  };

  if (completed) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <div className="flex flex-1 flex-col items-center justify-center gap-4 py-20">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring" }}>
            <CheckCircle2 className="h-20 w-20 text-primary" />
          </motion.div>
          <h2 className="font-heading text-2xl font-bold">Order Placed Successfully!</h2>
          <p className="text-muted-foreground">Thank you for your order. You can track it from your orders page.</p>
          <button
            onClick={() => navigate("/orders")}
            className="mt-4 rounded-md bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground"
          >
            View My Orders
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  if (items.length === 0) {
    navigate("/cart");
    return null;
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <div className="container py-8">
        <h1 className="font-heading text-2xl font-bold">Checkout</h1>

        <form onSubmit={handleSubmit} className="mt-6 grid gap-8 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            {/* Customer info */}
            <div className="rounded-lg border bg-card p-6">
              <h3 className="font-heading text-lg font-semibold">Delivery Details</h3>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-sm font-medium">Full Name</label>
                  <input
                    value={form.name}
                    onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                    className="mt-1 h-10 w-full rounded-md border bg-background px-3 text-sm outline-none ring-ring focus:ring-2"
                    placeholder="John Mwangi"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Phone Number</label>
                  <input
                    value={form.phone}
                    onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                    className="mt-1 h-10 w-full rounded-md border bg-background px-3 text-sm outline-none ring-ring focus:ring-2"
                    placeholder="+255 7XX XXX XXX"
                  />
                </div>
              </div>
              <div className="mt-4">
                <label className="text-sm font-medium">Delivery Address</label>
                <textarea
                  value={form.address}
                  onChange={e => setForm(p => ({ ...p, address: e.target.value }))}
                  rows={3}
                  className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm outline-none ring-ring focus:ring-2"
                  placeholder="Plot number, street, area, city"
                />
              </div>
            </div>

            {/* Payment */}
            <div className="rounded-lg border bg-card p-6">
              <h3 className="font-heading text-lg font-semibold">Payment Method</h3>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod("mobile")}
                  className={`flex items-center gap-3 rounded-lg border p-4 text-left transition-all ${
                    paymentMethod === "mobile" ? "border-primary bg-primary/5" : "hover:border-primary/50"
                  }`}
                >
                  <Smartphone className={`h-5 w-5 ${paymentMethod === "mobile" ? "text-primary" : "text-muted-foreground"}`} />
                  <div>
                    <p className="text-sm font-semibold">Mobile Money</p>
                    <p className="text-xs text-muted-foreground">M-Pesa / Airtel Money</p>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod("card")}
                  className={`flex items-center gap-3 rounded-lg border p-4 text-left transition-all ${
                    paymentMethod === "card" ? "border-primary bg-primary/5" : "hover:border-primary/50"
                  }`}
                >
                  <CreditCard className={`h-5 w-5 ${paymentMethod === "card" ? "text-primary" : "text-muted-foreground"}`} />
                  <div>
                    <p className="text-sm font-semibold">Card Payment</p>
                    <p className="text-xs text-muted-foreground">Visa / Mastercard</p>
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Order summary */}
          <div className="h-fit rounded-lg border bg-card p-6">
            <h3 className="font-heading text-lg font-bold">Order Summary</h3>
            <div className="mt-4 space-y-3">
              {items.map((item, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    {item.product.name} ×{item.quantity}
                  </span>
                  <span className="font-medium">TZS {(item.unitPrice * item.quantity).toLocaleString()}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 border-t pt-4">
              <div className="flex justify-between">
                <span className="font-heading font-bold">Total</span>
                <span className="font-heading text-xl font-bold text-primary">
                  TZS {totalAmount.toLocaleString()}
                </span>
              </div>
            </div>
            <button
              type="submit"
              disabled={processing}
              className="mt-6 w-full rounded-md bg-primary py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
            >
              {processing ? "Processing Payment..." : "Place Order & Pay"}
            </button>
          </div>
        </form>
      </div>
      <div className="flex-1" />
      <Footer />
    </div>
  );
}
