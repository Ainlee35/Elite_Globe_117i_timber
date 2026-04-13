import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useOrders } from "@/context/OrderContext";
import { useProducts, DbProduct } from "@/hooks/useProducts";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Navigate } from "react-router-dom";
import { Package, DollarSign, Users, ShoppingBag, Edit, Trash2, Plus, X, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

function StatCard({ icon: Icon, label, value, color }: { icon: any; label: string; value: string; color: string }) {
  return (
    <div className="rounded-lg border bg-card p-5">
      <div className="flex items-center gap-3">
        <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${color}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="font-heading text-xl font-bold">{value}</p>
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const { orders, updateOrderStatus, updatePaymentStatus } = useOrders();
  const { data: productList = [], isLoading: productsLoading } = useProducts();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"overview" | "products" | "orders">("overview");
  const [editingProduct, setEditingProduct] = useState<DbProduct | null>(null);
  const [showProductForm, setShowProductForm] = useState(false);
  const [productForm, setProductForm] = useState({ name: "", category: "wood", price: "", description: "", image_url: "", stock: "0" });

  if (authLoading) return <div className="flex min-h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  if (!user || !isAdmin) return <Navigate to="/login" replace />;

  const totalSales = orders.filter(o => o.payment_status === "paid").reduce((s, o) => s + o.total, 0);
  const tabs = [
    { id: "overview" as const, label: "Overview" },
    { id: "products" as const, label: "Products" },
    { id: "orders" as const, label: "Orders" },
  ];

  const openProductForm = (product?: DbProduct) => {
    if (product) {
      setEditingProduct(product);
      setProductForm({
        name: product.name,
        category: product.category,
        price: String(product.price),
        description: product.description,
        image_url: product.image_url,
        stock: String(product.stock),
      });
    } else {
      setEditingProduct(null);
      setProductForm({ name: "", category: "wood", price: "", description: "", image_url: "", stock: "0" });
    }
    setShowProductForm(true);
  };

  const handleSaveProduct = async () => {
    const payload = {
      name: productForm.name,
      category: productForm.category,
      price: Number(productForm.price),
      description: productForm.description,
      image_url: productForm.image_url,
      stock: Number(productForm.stock),
    };

    if (editingProduct) {
      const { error } = await supabase.from("products").update(payload).eq("id", editingProduct.id);
      if (error) { toast.error("Failed to update"); return; }
      toast.success("Product updated");
    } else {
      const { error } = await supabase.from("products").insert(payload);
      if (error) { toast.error("Failed to add product"); return; }
      toast.success("Product added");
    }
    queryClient.invalidateQueries({ queryKey: ["products"] });
    setShowProductForm(false);
  };

  const handleDeleteProduct = async (id: string) => {
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) { toast.error("Failed to delete"); return; }
    toast.success("Product deleted");
    queryClient.invalidateQueries({ queryKey: ["products"] });
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <div className="container py-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-heading text-2xl font-bold">Admin Dashboard</h1>
            <p className="text-sm text-muted-foreground">Manage your store</p>
          </div>
          <div className="flex gap-1 rounded-lg border bg-secondary/50 p-1">
            {tabs.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`rounded-md px-4 py-2 text-sm font-medium transition-all ${activeTab === tab.id ? "bg-card shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {activeTab === "overview" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard icon={Package} label="Total Orders" value={String(orders.length)} color="bg-blue-50 text-blue-600" />
              <StatCard icon={DollarSign} label="Total Sales" value={`TZS ${totalSales.toLocaleString()}`} color="bg-green-50 text-green-600" />
              <StatCard icon={ShoppingBag} label="Products" value={String(productList.length)} color="bg-purple-50 text-purple-600" />
              <StatCard icon={Users} label="Pending Orders" value={String(orders.filter(o => o.status === "pending").length)} color="bg-yellow-50 text-yellow-600" />
            </div>

            <div className="mt-8">
              <h3 className="font-heading text-lg font-semibold">Recent Orders</h3>
              <div className="mt-4 overflow-x-auto rounded-lg border">
                <table className="w-full text-sm">
                  <thead className="bg-secondary/50">
                    <tr>
                      <th className="px-4 py-3 text-left font-medium">Order ID</th>
                      <th className="px-4 py-3 text-left font-medium">Customer</th>
                      <th className="px-4 py-3 text-left font-medium">Amount</th>
                      <th className="px-4 py-3 text-left font-medium">Status</th>
                      <th className="px-4 py-3 text-left font-medium">Payment</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.slice(0, 5).map(order => (
                      <tr key={order.id} className="border-t">
                        <td className="px-4 py-3 font-medium">{order.id.slice(0, 8).toUpperCase()}</td>
                        <td className="px-4 py-3 text-muted-foreground">{order.profile?.name || "—"}</td>
                        <td className="px-4 py-3">TZS {order.total.toLocaleString()}</td>
                        <td className="px-4 py-3">
                          <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${order.status === "delivered" ? "bg-green-50 text-green-600" : order.status === "processing" ? "bg-blue-50 text-blue-600" : "bg-yellow-50 text-yellow-600"}`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${order.payment_status === "paid" ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"}`}>
                            {order.payment_status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === "products" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-6">
            <div className="flex justify-end">
              <button onClick={() => openProductForm()} className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
                <Plus className="h-4 w-4" /> Add Product
              </button>
            </div>
            {productsLoading ? (
              <div className="mt-8 flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
            ) : (
              <div className="mt-4 overflow-x-auto rounded-lg border">
                <table className="w-full text-sm">
                  <thead className="bg-secondary/50">
                    <tr>
                      <th className="px-4 py-3 text-left font-medium">Product</th>
                      <th className="px-4 py-3 text-left font-medium">Category</th>
                      <th className="px-4 py-3 text-left font-medium">Price</th>
                      <th className="px-4 py-3 text-left font-medium">Stock</th>
                      <th className="px-4 py-3 text-left font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {productList.map(product => (
                      <tr key={product.id} className="border-t">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <img src={product.image_url} alt="" className="h-10 w-10 rounded object-cover" />
                            <span className="font-medium">{product.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 capitalize text-muted-foreground">{product.category}</td>
                        <td className="px-4 py-3">TZS {product.price.toLocaleString()}</td>
                        <td className="px-4 py-3">{product.stock}</td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <button onClick={() => openProductForm(product)} className="rounded p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground">
                              <Edit className="h-4 w-4" />
                            </button>
                            <button onClick={() => handleDeleteProduct(product.id)} className="rounded p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {showProductForm && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/50 p-4">
                <div className="w-full max-w-lg rounded-xl bg-card p-6">
                  <div className="flex items-center justify-between">
                    <h3 className="font-heading text-lg font-bold">{editingProduct ? "Edit Product" : "Add Product"}</h3>
                    <button onClick={() => setShowProductForm(false)}><X className="h-5 w-5 text-muted-foreground" /></button>
                  </div>
                  <div className="mt-4 space-y-3">
                    <input value={productForm.name} onChange={e => setProductForm(p => ({ ...p, name: e.target.value }))} placeholder="Product name" className="h-10 w-full rounded-md border bg-background px-3 text-sm" />
                    <select value={productForm.category} onChange={e => setProductForm(p => ({ ...p, category: e.target.value }))} className="h-10 w-full rounded-md border bg-background px-3 text-sm">
                      <option value="wood">Wood</option>
                      <option value="paints">Paints</option>
                      <option value="designs">Architectural Designs</option>
                    </select>
                    <input value={productForm.price} onChange={e => setProductForm(p => ({ ...p, price: e.target.value }))} placeholder="Price (TZS)" type="number" className="h-10 w-full rounded-md border bg-background px-3 text-sm" />
                    <input value={productForm.stock} onChange={e => setProductForm(p => ({ ...p, stock: e.target.value }))} placeholder="Stock" type="number" className="h-10 w-full rounded-md border bg-background px-3 text-sm" />
                    <textarea value={productForm.description} onChange={e => setProductForm(p => ({ ...p, description: e.target.value }))} placeholder="Description" rows={3} className="w-full rounded-md border bg-background px-3 py-2 text-sm" />
                    <input value={productForm.image_url} onChange={e => setProductForm(p => ({ ...p, image_url: e.target.value }))} placeholder="Image URL" className="h-10 w-full rounded-md border bg-background px-3 text-sm" />
                  </div>
                  <div className="mt-6 flex justify-end gap-3">
                    <button onClick={() => setShowProductForm(false)} className="rounded-md border px-4 py-2 text-sm font-medium">Cancel</button>
                    <button onClick={handleSaveProduct} className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
                      {editingProduct ? "Update" : "Add Product"}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {activeTab === "orders" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-6">
            <div className="space-y-4">
              {orders.map(order => (
                <div key={order.id} className="rounded-lg border bg-card p-5">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <h3 className="font-heading font-bold">{order.id.slice(0, 8).toUpperCase()}</h3>
                      <p className="text-sm text-muted-foreground">{order.profile?.name || "—"} · {order.profile?.phone || ""}</p>
                      <p className="text-sm text-muted-foreground">{order.shipping_address}</p>
                    </div>
                    <p className="font-heading text-lg font-bold text-primary">TZS {order.total.toLocaleString()}</p>
                  </div>

                  <div className="mt-3 border-t pt-3">
                    {order.order_items?.map((item) => (
                      <p key={item.id} className="text-sm text-muted-foreground">
                        {item.product?.name || "Product"} {item.selected_type && `(${item.selected_type})`} ×{item.quantity}
                      </p>
                    ))}
                  </div>

                  <div className="mt-4 flex flex-wrap gap-3">
                    <div>
                      <label className="text-xs font-medium text-muted-foreground">Order Status</label>
                      <select
                        value={order.status}
                        onChange={e => { updateOrderStatus(order.id, e.target.value); toast.success("Status updated"); }}
                        className="mt-1 block h-9 rounded-md border bg-background px-3 text-sm"
                      >
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground">Payment</label>
                      <select
                        value={order.payment_status}
                        onChange={e => { updatePaymentStatus(order.id, e.target.value); toast.success("Payment status updated"); }}
                        className="mt-1 block h-9 rounded-md border bg-background px-3 text-sm"
                      >
                        <option value="pending">Pending</option>
                        <option value="paid">Paid</option>
                        <option value="failed">Failed</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
      <div className="flex-1" />
      <Footer />
    </div>
  );
}
