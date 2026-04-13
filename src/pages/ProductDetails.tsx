import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { ArrowLeft, ShoppingCart, Minus, Plus, Check } from "lucide-react";
import { useProduct } from "@/hooks/useProducts";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { toast } from "sonner";

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { user } = useAuth();
  const { data: product, isLoading } = useProduct(id);

  const [selectedType, setSelectedType] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [typeInitialized, setTypeInitialized] = useState(false);

  if (!typeInitialized && product?.types?.length) {
    setSelectedType(product.types[0].label);
    setTypeInitialized(true);
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <div className="container py-8">
          <div className="h-96 animate-pulse rounded-lg bg-secondary" />
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <div className="flex flex-1 items-center justify-center">
          <p className="text-muted-foreground">Product not found.</p>
        </div>
      </div>
    );
  }

  const typeObj = product.types?.find(t => t.label === selectedType);
  const currentPrice = product.price + (typeObj?.priceModifier || 0);

  const handleAddToCart = () => {
    if (!user) {
      toast.error("Please login to add items to cart");
      navigate("/login");
      return;
    }
    addItem(product, selectedType || undefined, quantity);
    toast.success(`${product.name} added to cart!`);
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <div className="container py-8">
        <button onClick={() => navigate(-1)} className="mb-6 flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back
        </button>

        <div className="grid gap-10 lg:grid-cols-2">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="overflow-hidden rounded-xl">
            <img src={product.image_url} alt={product.name} className="h-full max-h-[500px] w-full object-cover" />
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
            <span className="inline-block rounded-md bg-secondary px-3 py-1 text-xs font-semibold uppercase tracking-wider text-secondary-foreground">
              {product.category}
            </span>
            <h1 className="mt-3 font-heading text-3xl font-bold">{product.name}</h1>
            <p className="mt-4 leading-relaxed text-muted-foreground">{product.description}</p>

            {product.types && product.types.length > 0 && (
              <div className="mt-6">
                <label className="text-sm font-semibold">Select Type</label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {product.types.map(type => (
                    <button
                      key={type.value}
                      onClick={() => setSelectedType(type.label)}
                      className={`flex items-center gap-1.5 rounded-md border px-4 py-2 text-sm font-medium transition-all ${
                        selectedType === type.label ? "border-primary bg-primary/5 text-primary" : "border-border hover:border-primary/50"
                      }`}
                    >
                      {selectedType === type.label && <Check className="h-3.5 w-3.5" />}
                      {type.label}
                      {type.priceModifier > 0 && <span className="text-xs text-muted-foreground">(+{type.priceModifier.toLocaleString()})</span>}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-6">
              <label className="text-sm font-semibold">Quantity</label>
              <div className="mt-2 flex items-center gap-3">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="flex h-10 w-10 items-center justify-center rounded-md border transition-colors hover:bg-secondary">
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-12 text-center font-heading text-lg font-semibold">{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)} className="flex h-10 w-10 items-center justify-center rounded-md border transition-colors hover:bg-secondary">
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="mt-8 rounded-lg border bg-secondary/50 p-6">
              <div className="flex items-end justify-between">
                <div>
                  <span className="text-sm text-muted-foreground">Total Price</span>
                  <p className="font-heading text-3xl font-bold text-primary">
                    TZS {(currentPrice * quantity).toLocaleString()}
                  </p>
                </div>
                <button onClick={handleAddToCart} className="flex items-center gap-2 rounded-md bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90">
                  <ShoppingCart className="h-4 w-4" />
                  Add to Cart
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
      <div className="flex-1" />
      <Footer />
    </div>
  );
}
