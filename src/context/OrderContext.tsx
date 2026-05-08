import { createContext, useContext, useMemo, useState, ReactNode } from "react";
import { apiRequest } from "@/lib/api";

export type OrderStatus = "pending" | "processing" | "delivered";
export type PaymentStatus = "paid" | "unpaid";

export interface OrderItem {
  productId: string;
  productName: string;
  selectedType?: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface Order {
  id: string;
  orderCode: string;
  userId: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: "mobile" | "card";
  totalAmount: number;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  createdAt: string;
  items: OrderItem[];
}

interface CreateOrderPayload {
  items: { productId: string; selectedType?: string; quantity: number }[];
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  paymentMethod: "mobile" | "card";
}

interface OrderContextType {
  myOrders: Order[];
  adminOrders: Order[];
  createOrder: (payload: CreateOrderPayload) => Promise<Order>;
  fetchMyOrders: () => Promise<void>;
  fetchAdminOrders: () => Promise<void>;
  updateOrderStatus: (orderId: string, status: OrderStatus) => Promise<void>;
  updatePaymentStatus: (orderId: string, status: PaymentStatus) => Promise<void>;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

function normalizeOrder(order: any): Order {
  return {
    id: order.id,
    orderCode: order.orderCode,
    userId: order.userId,
    status: order.status,
    paymentStatus: order.paymentStatus,
    paymentMethod: order.paymentMethod,
    totalAmount: order.totalAmount,
    customerName: order.customerName,
    customerPhone: order.customerPhone,
    customerAddress: order.customerAddress,
    createdAt: order.createdAt,
    items: (order.items || []).map((item: any) => ({
      productId: item.productId,
      productName: item.productName,
      selectedType: item.selectedType,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      lineTotal: item.lineTotal,
    })),
  };
}

export function OrderProvider({ children }: { children: ReactNode }) {
  const [myOrders, setMyOrders] = useState<Order[]>([]);
  const [adminOrders, setAdminOrders] = useState<Order[]>([]);

  const createOrder = async (payload: CreateOrderPayload): Promise<Order> => {
    const created = await apiRequest<any>("/orders", "POST", payload);
    const normalized = normalizeOrder(created);
    setMyOrders(prev => [normalized, ...prev]);
    return normalized;
  };

  const fetchMyOrders = async () => {
    const orders = await apiRequest<any[]>("/orders/me");
    setMyOrders(orders.map(normalizeOrder));
  };

  const fetchAdminOrders = async () => {
    const orders = await apiRequest<any[]>("/admin/orders");
    setAdminOrders(orders.map(normalizeOrder));
  };

  const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
    const updated = normalizeOrder(
      await apiRequest<any>(`/admin/orders/${orderId}/status`, "PATCH", { status })
    );
    setAdminOrders(prev => prev.map(order => (order.id === orderId ? updated : order)));
    setMyOrders(prev => prev.map(order => (order.id === orderId ? updated : order)));
  };

  const updatePaymentStatus = async (orderId: string, status: PaymentStatus) => {
    const updated = normalizeOrder(
      await apiRequest<any>(`/admin/orders/${orderId}/payment-status`, "PATCH", { paymentStatus: status })
    );
    setAdminOrders(prev => prev.map(order => (order.id === orderId ? updated : order)));
    setMyOrders(prev => prev.map(order => (order.id === orderId ? updated : order)));
  };

  const value = useMemo(
    () => ({
      myOrders,
      adminOrders,
      createOrder,
      fetchMyOrders,
      fetchAdminOrders,
      updateOrderStatus,
      updatePaymentStatus,
    }),
    [myOrders, adminOrders]
  );

  return <OrderContext.Provider value={value}>{children}</OrderContext.Provider>;
}

export function useOrders() {
  const ctx = useContext(OrderContext);
  if (!ctx) throw new Error("useOrders must be inside OrderProvider");
  return ctx;
}
