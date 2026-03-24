import { useAuth } from "@/context/AuthContext";
import { useOrders } from "@/context/OrderContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Link } from "react-router-dom";
import { Package, Clock, Truck, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

const statusConfig = {
  pending: { icon: Clock, label: "Pending", color: "text-yellow-600", bg: "bg-yellow-50", step: 1 },
  processing: { icon: Package, label: "Processing", color: "text-blue-600", bg: "bg-blue-50", step: 2 },
  delivered: { icon: CheckCircle2, label: "Delivered", color: "text-green-600", bg: "bg-green-50", step: 3 },
};

const steps = [
  { label: "Order Placed", icon: Package },
  { label: "Processing", icon: Truck },
  { label: "Delivered", icon: CheckCircle2 },
];

export default function Orders() {
  const { user } = useAuth();
  const { getOrdersByUser } = useOrders();

  if (!user) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <div className="flex flex-1 flex-col items-center justify-center gap-4">
          <p className="text-muted-foreground">Please login to view your orders.</p>
          <Link to="/login" className="rounded-md bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground">
            Login
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const orders = getOrdersByUser(user.id);

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <div className="container py-8">
        <h1 className="font-heading text-2xl font-bold">My Orders</h1>

        {orders.length === 0 ? (
          <div className="mt-20 text-center">
            <Package className="mx-auto h-16 w-16 text-muted-foreground/30" />
            <p className="mt-4 text-muted-foreground">No orders yet.</p>
            <Link to="/" className="mt-4 inline-block rounded-md bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground">
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="mt-6 space-y-6">
            {orders.map((order, idx) => {
              const config = statusConfig[order.status];
              const StatusIcon = config.icon;

              return (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="rounded-lg border bg-card p-6"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-3">
                        <h3 className="font-heading text-lg font-bold">{order.id}</h3>
                        <span className={`flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${config.bg} ${config.color}`}>
                          <StatusIcon className="h-3 w-3" />
                          {config.label}
                        </span>
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          order.paymentStatus === "paid" ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"
                        }`}>
                          {order.paymentStatus === "paid" ? "Paid" : "Unpaid"}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {new Date(order.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                      </p>
                    </div>
                    <p className="font-heading text-xl font-bold text-primary">
                      TZS {order.totalAmount.toLocaleString()}
                    </p>
                  </div>

                  {/* Timeline */}
                  <div className="mt-6 flex items-center gap-0">
                    {steps.map((step, i) => {
                      const active = i < config.step;
                      const StepIcon = step.icon;
                      return (
                        <div key={i} className="flex flex-1 items-center">
                          <div className="flex flex-col items-center">
                            <div className={`flex h-8 w-8 items-center justify-center rounded-full ${
                              active ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
                            }`}>
                              <StepIcon className="h-4 w-4" />
                            </div>
                            <span className={`mt-1 text-[11px] font-medium ${active ? "text-foreground" : "text-muted-foreground"}`}>
                              {step.label}
                            </span>
                          </div>
                          {i < steps.length - 1 && (
                            <div className={`mx-1 h-0.5 flex-1 ${active ? "bg-primary" : "bg-border"}`} />
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Items */}
                  <div className="mt-4 border-t pt-4">
                    {order.items.map((item, i) => (
                      <div key={i} className="flex items-center justify-between py-1 text-sm">
                        <span>
                          {item.product.name}
                          {item.selectedType && <span className="text-muted-foreground"> ({item.selectedType})</span>}
                          {" "}×{item.quantity}
                        </span>
                        <span className="font-medium">TZS {(item.unitPrice * item.quantity).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
      <div className="flex-1" />
      <Footer />
    </div>
  );
}
