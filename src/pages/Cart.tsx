import { Link, useNavigate } from "react-router-dom";
import { Trash2, Minus, Plus, ShoppingBag, ArrowLeft } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion, AnimatePresence } from "framer-motion";

export default function Cart() {
  const { items, removeItem, updateQuantity, totalAmount } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <div className="flex flex-1 flex-col items-center justify-center gap-4 py-20">
          <ShoppingBag className="h-16 w-16 text-muted-foreground/30" />
          <h2 className="font-heading text-2xl font-bold">Your cart is empty</h2>
          <p className="text-muted-foreground">Add some construction materials to get started.</p>
          <Link
            to="/"
            className="mt-4 rounded-md bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground"
          >
            Browse Products
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <div className="container py-8">
        <button onClick={() => navigate(-1)} className="mb-6 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Continue Shopping
        </button>

        <h1 className="font-heading text-2xl font-bold">Shopping Cart</h1>

        <div className="mt-6 grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <AnimatePresence>
              {items.map((item, index) => (
                <motion.div
                  key={`${item.product.id}-${item.selectedType}`}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  className="mb-4 flex gap-4 rounded-lg border bg-card p-4"
                >
                  <img
                    src={item.product.image_url}
                    alt={item.product.name}
                    className="h-24 w-24 rounded-md object-cover"
                  />
                  <div className="flex flex-1 flex-col justify-between">
                    <div>
                      <h3 className="font-heading font-semibold">{item.product.name}</h3>
                      {item.selectedType && (
                        <p className="text-sm text-muted-foreground">Type: {item.selectedType}</p>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(index, item.quantity - 1)}
                          className="flex h-8 w-8 items-center justify-center rounded border hover:bg-secondary"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-8 text-center text-sm font-semibold">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(index, item.quantity + 1)}
                          className="flex h-8 w-8 items-center justify-center rounded border hover:bg-secondary"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                      <span className="font-heading font-bold">
                        TZS {(item.unitPrice * item.quantity).toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => removeItem(index)}
                    className="self-start text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Summary */}
          <div className="h-fit rounded-lg border bg-card p-6">
            <h3 className="font-heading text-lg font-bold">Order Summary</h3>
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">TZS {totalAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Delivery</span>
                <span className="font-medium text-primary">Free</span>
              </div>
            </div>
            <div className="mt-4 border-t pt-4">
              <div className="flex justify-between">
                <span className="font-heading font-bold">Total</span>
                <span className="font-heading text-xl font-bold text-primary">
                  TZS {totalAmount.toLocaleString()}
                </span>
              </div>
            </div>
            {user ? (
              <Link
                to="/checkout"
                className="mt-6 block w-full rounded-md bg-primary py-3 text-center text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Proceed to Checkout
              </Link>
            ) : (
              <Link
                to="/login"
                className="mt-6 block w-full rounded-md bg-primary py-3 text-center text-sm font-semibold text-primary-foreground"
              >
                Login to Checkout
              </Link>
            )}
          </div>
        </div>
      </div>
      <div className="flex-1" />
      <Footer />
    </div>
  );
}
