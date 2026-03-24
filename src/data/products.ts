export interface ProductType {
  value: string;
  label: string;
  priceModifier: number;
}

export interface Product {
  id: string;
  name: string;
  category: "wood" | "paints" | "designs";
  types?: ProductType[];
  price: number;
  description: string;
  image: string;
  inStock: boolean;
}

export interface OrderItem {
  product: Product;
  selectedType?: string;
  quantity: number;
  unitPrice: number;
}

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  totalAmount: number;
  status: "pending" | "processing" | "delivered";
  paymentStatus: "paid" | "unpaid";
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  createdAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "customer";
}

export const CATEGORIES = [
  { value: "all", label: "All Products" },
  { value: "wood", label: "Wood" },
  { value: "paints", label: "Paints" },
  { value: "designs", label: "Architectural Designs" },
] as const;

export const products: Product[] = [
  {
    id: "1",
    name: "Premium Hardwood Timber",
    category: "wood",
    types: [
      { value: "mninga", label: "Mninga", priceModifier: 0 },
      { value: "mvule", label: "Mvule", priceModifier: 15000 },
      { value: "teak", label: "Teak", priceModifier: 25000 },
      { value: "mahogany", label: "Mahogany", priceModifier: 20000 },
    ],
    price: 85000,
    description: "High-quality hardwood timber sourced from sustainable forests. Perfect for structural beams, flooring, and premium furniture construction. Each piece is carefully selected and treated for durability.",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=600&h=400&fit=crop",
    inStock: true,
  },
  {
    id: "2",
    name: "Construction Grade Plywood",
    category: "wood",
    types: [
      { value: "standard", label: "Standard (12mm)", priceModifier: 0 },
      { value: "marine", label: "Marine Grade (18mm)", priceModifier: 12000 },
      { value: "structural", label: "Structural (24mm)", priceModifier: 18000 },
    ],
    price: 45000,
    description: "Versatile plywood sheets suitable for various construction applications. Available in different thicknesses and grades for walls, roofing, and formwork.",
    image: "https://images.unsplash.com/photo-1504148455328-c376907d081c?w=600&h=400&fit=crop",
    inStock: true,
  },
  {
    id: "3",
    name: "Mninga Door Frame Set",
    category: "wood",
    types: [
      { value: "single", label: "Single Door", priceModifier: 0 },
      { value: "double", label: "Double Door", priceModifier: 65000 },
    ],
    price: 120000,
    description: "Beautifully crafted Mninga wood door frame set. Pre-finished with weather-resistant coating. Includes frame, hinges, and installation hardware.",
    image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&h=400&fit=crop",
    inStock: true,
  },
  {
    id: "4",
    name: "Weathershield Exterior Paint",
    category: "paints",
    types: [
      { value: "white", label: "Arctic White", priceModifier: 0 },
      { value: "cream", label: "Desert Cream", priceModifier: 2000 },
      { value: "grey", label: "Storm Grey", priceModifier: 2000 },
      { value: "terracotta", label: "Terracotta", priceModifier: 3000 },
    ],
    price: 35000,
    description: "Premium exterior wall paint with 10-year weather protection guarantee. UV-resistant formula prevents fading. Coverage: 12-14 sq meters per liter.",
    image: "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=600&h=400&fit=crop",
    inStock: true,
  },
  {
    id: "5",
    name: "Interior Silk Emulsion",
    category: "paints",
    types: [
      { value: "magnolia", label: "Magnolia", priceModifier: 0 },
      { value: "dove", label: "Dove White", priceModifier: 0 },
      { value: "sage", label: "Sage Green", priceModifier: 1500 },
      { value: "sky", label: "Sky Blue", priceModifier: 1500 },
    ],
    price: 28000,
    description: "Smooth silk finish interior paint. Low odor, quick drying formula. Washable surface ideal for living rooms and bedrooms. Coverage: 14-16 sq meters per liter.",
    image: "https://images.unsplash.com/photo-1562259929-b4e1fd3aef09?w=600&h=400&fit=crop",
    inStock: true,
  },
  {
    id: "6",
    name: "Roof Waterproof Coating",
    category: "paints",
    price: 55000,
    description: "Industrial-strength waterproof coating for flat and pitched roofs. Elastic membrane technology bridges hairline cracks. Reflects heat to keep buildings cooler.",
    image: "https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=600&h=400&fit=crop",
    inStock: true,
  },
  {
    id: "7",
    name: "Modern Villa Blueprint",
    category: "designs",
    types: [
      { value: "3bed", label: "3 Bedroom", priceModifier: 0 },
      { value: "4bed", label: "4 Bedroom", priceModifier: 200000 },
      { value: "5bed", label: "5 Bedroom", priceModifier: 450000 },
    ],
    price: 500000,
    description: "Complete architectural blueprint for a modern villa. Includes structural plans, electrical layout, plumbing design, and 3D visualization. Compliant with local building codes.",
    image: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=600&h=400&fit=crop",
    inStock: true,
  },
  {
    id: "8",
    name: "Commercial Building Design",
    category: "designs",
    types: [
      { value: "small", label: "Small Office", priceModifier: 0 },
      { value: "medium", label: "Medium Complex", priceModifier: 500000 },
      { value: "large", label: "Large Complex", priceModifier: 1500000 },
    ],
    price: 800000,
    description: "Professional architectural design for commercial buildings. Includes office layout optimization, parking design, fire safety compliance, and environmental impact assessment.",
    image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&h=400&fit=crop",
    inStock: true,
  },
  {
    id: "9",
    name: "Residential Estate Plan",
    category: "designs",
    price: 1200000,
    description: "Comprehensive estate development plan for residential housing projects. Includes master plan, individual unit designs, landscaping, and infrastructure layout for roads and drainage.",
    image: "https://images.unsplash.com/photo-1448630360428-65456659e933?w=600&h=400&fit=crop",
    inStock: true,
  },
];

export const sampleOrders: Order[] = [
  {
    id: "ORD-001",
    userId: "2",
    items: [
      { product: products[0], selectedType: "Mninga", quantity: 10, unitPrice: 85000 },
      { product: products[3], selectedType: "Arctic White", quantity: 5, unitPrice: 35000 },
    ],
    totalAmount: 1025000,
    status: "processing",
    paymentStatus: "paid",
    customerName: "John Mwangi",
    customerPhone: "+255 712 345 678",
    customerAddress: "Plot 45, Mikocheni, Dar es Salaam",
    createdAt: "2026-03-20T10:30:00Z",
  },
  {
    id: "ORD-002",
    userId: "2",
    items: [
      { product: products[6], selectedType: "4 Bedroom", quantity: 1, unitPrice: 700000 },
    ],
    totalAmount: 700000,
    status: "pending",
    paymentStatus: "unpaid",
    customerName: "John Mwangi",
    customerPhone: "+255 712 345 678",
    customerAddress: "Plot 45, Mikocheni, Dar es Salaam",
    createdAt: "2026-03-22T14:15:00Z",
  },
  {
    id: "ORD-003",
    userId: "3",
    items: [
      { product: products[1], selectedType: "Marine Grade (18mm)", quantity: 20, unitPrice: 57000 },
    ],
    totalAmount: 1140000,
    status: "delivered",
    paymentStatus: "paid",
    customerName: "Sarah Kimaro",
    customerPhone: "+255 756 789 012",
    customerAddress: "Block C, Masaki, Dar es Salaam",
    createdAt: "2026-03-15T09:00:00Z",
  },
];
