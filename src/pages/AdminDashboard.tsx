import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { OrderStatus, PaymentStatus, useOrders } from "@/context/OrderContext";
import { Product } from "@/data/products";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Navigate } from "react-router-dom";
import { Package, DollarSign, Users, ShoppingBag, Edit, Trash2, Plus, X } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { apiRequest } from "@/lib/api";

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

const emptyProductForm = {
  name: "",
  category: "wood" as Product["category"],
  price: 0,
  description: "",
  image: "",
  inStock: true,
};

export default function AdminDashboard() {
  const { user, isAdmin } = useAuth();
  const { adminOrders, fetchAdminOrders, updateOrderStatus, updatePaymentStatus } = useOrders();
  const [activeTab, setActiveTab] = useState<"overview" | "products" | "orders">("overview");
  const [productList, setProductList] = useState<Product[]>([]);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showProductForm, setShowProductForm] = useState(false);
  const [productForm, setProductForm] = useState(emptyProductForm);

  useEffect(() => {
    if (!user || !isAdmin) return;

    const load = async () => {
      try {
        await fetchAdminOrders();
        const products = await apiRequest<Product[]>("/products");
        setProductList(products);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to load admin data");
      }
    };

    void load();
  }, [user, isAdmin, fetchAdminOrders]);

  if (!user || !isAdmin) return <Navigate to="/login" replace />;

  const totalSales = useMemo(
    () => adminOrders.filter(o => o.paymentStatus === "paid").reduce((s, o) => s + o.totalAmount, 0),
    [adminOrders]
  );

  const tabs = [
    { id: "overview" as const, label: "Overview" },
    { id: "products" as const, label: "Products" },
    { id: "orders" as const, label: "Orders" },
  ];

  const openCreateForm = () => {
    setEditingProduct(null);
    setProductForm(emptyProductForm);
    setShowProductForm(true);
  };

  const openEditForm = (product: Product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      category: product.category,
      price: product.price,
      description: product.description,
      image: product.image,
      inStock: product.inStock,
    });
    setShowProductForm(true);
  };

  const handleDeleteProduct = async (id: string) => {
    try {
      await apiRequest(`/admin/products/${id}`, "DELETE");
      setProductList(prev => prev.filter(p => p.id !== id));
      toast.success("Product deleted");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete product");
    }
  };

  const handleSubmitProduct = async () => {
    try {
      const payload = {
        ...productForm,
        types: editingProduct?.types || [],
      };

      const updated = editingProduct
        ? await apiRequest<Product>(`/admin/products/${editingProduct.id}`, "PUT", payload)
        : await apiRequest<Product>("/admin/products", "POST", payload);

      setProductList(prev => {
        if (editingProduct) {
          return prev.map(product => (product.id === editingProduct.id ? updated : product));
        }
        return [updated, ...prev];
      });

      setShowProductForm(false);
      toast.success(editingProduct ? "Product updated" : "Product added");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save product");
    }
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
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`rounded-md px-4 py-2 text-sm font-medium transition-all ${
                  activeTab === tab.id ? "bg-card shadow-sm" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {activeTab === "overview" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard icon={Package} label="Total Orders" value={String(adminOrders.length)} color="bg-blue-50 text-blue-600" />
              <StatCard icon={DollarSign} label="Total Sales" value={`TZS ${totalSales.toLocaleString()}`} color="bg-green-50 text-green-600" />
              <StatCard icon={ShoppingBag} label="Products" value={String(productList.length)} color="bg-purple-50 text-purple-600" />
              <StatCard icon={Users} label="Pending Orders" value={String(adminOrders.filter(o => o.status === "pending").length)} color="bg-yellow-50 text-yellow-600" />
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
                    {adminOrders.slice(0, 5).map(order => (
                      <tr key={order.id} className="border-t">
                        <td className="px-4 py-3 font-medium">{order.orderCode}</td>
                        <td className="px-4 py-3 text-muted-foreground">{order.customerName}</td>
                        <td className="px-4 py-3">TZS {order.totalAmount.toLocaleString()}</td>
                        <td className="px-4 py-3">
                          <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                            order.status === "delivered" ? "bg-green-50 text-green-600" : order.status === "processing" ? "bg-blue-50 text-blue-600" : "bg-yellow-50 text-yellow-600"
                          }`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${order.paymentStatus === "paid" ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"}`}>
                            {order.paymentStatus}
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
              <button onClick={openCreateForm} className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
                <Plus className="h-4 w-4" /> Add Product
              </button>
            </div>
            <div className="mt-4 overflow-x-auto rounded-lg border">
              <table className="w-full text-sm">
                <thead className="bg-secondary/50">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium">Product</th>
                    <th className="px-4 py-3 text-left font-medium">Category</th>
                    <th className="px-4 py-3 text-left font-medium">Price</th>
                    <th className="px-4 py-3 text-left font-medium">Types</th>
                    <th className="px-4 py-3 text-left font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {productList.map(product => (
                    <tr key={product.id} className="border-t">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <img src={product.image} alt="" className="h-10 w-10 rounded object-cover" />
                          <span className="font-medium">{product.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 capitalize text-muted-foreground">{product.category}</td>
                      <td className="px-4 py-3">TZS {product.price.toLocaleString()}</td>
                      <td className="px-4 py-3 text-muted-foreground">{product.types?.length || "—"}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button onClick={() => openEditForm(product)} className="rounded p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground">
                            <Edit className="h-4 w-4" />
                          </button>
                          <button onClick={() => void handleDeleteProduct(product.id)} className="rounded p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {showProductForm && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/50 p-4">
                <div className="w-full max-w-lg rounded-xl bg-card p-6">
                  <div className="flex items-center justify-between">
                    <h3 className="font-heading text-lg font-bold">{editingProduct ? "Edit Product" : "Add Product"}</h3>
                    <button onClick={() => setShowProductForm(false)}>
                      <X className="h-5 w-5 text-muted-foreground" />
                    </button>
                  </div>
                  <div className="mt-4 space-y-3">
                    <input value={productForm.name} onChange={e => setProductForm(prev => ({ ...prev, name: e.target.value }))} placeholder="Product name" className="h-10 w-full rounded-md border bg-background px-3 text-sm" />
                    <select value={productForm.category} onChange={e => setProductForm(prev => ({ ...prev, category: e.target.value as Product["category"] }))} className="h-10 w-full rounded-md border bg-background px-3 text-sm">
                      <option value="wood">Wood</option>
                      <option value="paints">Paints</option>
                      <option value="designs">Architectural Designs</option>
                    </select>
                    <input value={productForm.price} onChange={e => setProductForm(prev => ({ ...prev, price: Number(e.target.value) }))} placeholder="Price (TZS)" type="number" className="h-10 w-full rounded-md border bg-background px-3 text-sm" />
                    <textarea value={productForm.description} onChange={e => setProductForm(prev => ({ ...prev, description: e.target.value }))} placeholder="Description" rows={3} className="w-full rounded-md border bg-background px-3 py-2 text-sm" />
                    <input value={productForm.image} onChange={e => setProductForm(prev => ({ ...prev, image: e.target.value }))} placeholder="Image URL" className="h-10 w-full rounded-md border bg-background px-3 text-sm" />
                  </div>
                  <div className="mt-6 flex justify-end gap-3">
                    <button onClick={() => setShowProductForm(false)} className="rounded-md border px-4 py-2 text-sm font-medium">Cancel</button>
                    <button onClick={() => void handleSubmitProduct()} className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
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
              {adminOrders.map(order => (
                <div key={order.id} className="rounded-lg border bg-card p-5">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <h3 className="font-heading font-bold">{order.orderCode}</h3>
                      <p className="text-sm text-muted-foreground">{order.customerName} · {order.customerPhone}</p>
                      <p className="text-sm text-muted-foreground">{order.customerAddress}</p>
                    </div>
                    <p className="font-heading text-lg font-bold text-primary">TZS {order.totalAmount.toLocaleString()}</p>
                  </div>

                  <div className="mt-3 border-t pt-3">
                    {order.items.map((item, i) => (
                      <p key={i} className="text-sm text-muted-foreground">
                        {item.productName} {item.selectedType && `(${item.selectedType})`} ×{item.quantity}
                      </p>
                    ))}
                  </div>

                  <div className="mt-4 flex flex-wrap gap-3">
                    <div>
                      <label className="text-xs font-medium text-muted-foreground">Order Status</label>
                      <select
                        value={order.status}
                        onChange={async e => {
                          await updateOrderStatus(order.id, e.target.value as OrderStatus);
                          toast.success("Status updated");
                        }}
                        className="mt-1 block h-9 rounded-md border bg-background px-3 text-sm"
                      >
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="delivered">Delivered</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground">Payment</label>
                      <select
                        value={order.paymentStatus}
                        onChange={async e => {
                          await updatePaymentStatus(order.id, e.target.value as PaymentStatus);
                          toast.success("Payment status updated");
                        }}
                        className="mt-1 block h-9 rounded-md border bg-background px-3 text-sm"
                      >
                        <option value="unpaid">Unpaid</option>
                        <option value="paid">Paid</option>
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
