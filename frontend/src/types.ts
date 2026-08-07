export interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "manager" | "sales" | "inventory" | "viewer";
  title?: string;
  phone?: string;
  active: boolean;
  createdAt: string;
}

export interface InventoryItem {
  id: string;
  sku: string;
  name: string;
  quantity: number;
  location: string;
  price: number;
  cost?: number;
  status: string;
  photos?: string[];
  notes?: string;
  createdAt: string;
  [key: string]: unknown;
}

export interface Customer {
  id: string;
  code: string;
  name: string;
  company?: string;
  contact?: string;
  email?: string;
  phone?: string;
  city?: string;
  country?: string;
  segment?: string;
  tier?: string;
  tags?: string[];
  source?: string;
  status?: string;
  creditLimit?: number;
  balance?: number;
  notes?: string;
  createdAt: string;
}

export interface Lead {
  id: string;
  name: string;
  company?: string;
  email?: string;
  phone?: string;
  source?: string;
  status: string;
  value: number;
  owner: string;
  nextAction?: string;
  nextActionDate?: string | null;
  notes?: string;
  createdAt: string;
}

export interface Supplier {
  id: string;
  code: string;
  name: string;
  contact?: string;
  email?: string;
  phone?: string;
  type: string;
  city?: string;
  country?: string;
  terms?: string;
  leadTime?: number;
  rating?: number;
  notes?: string;
  createdAt: string;
}

export interface LineItem {
  inventoryType: string;
  inventoryId?: string | null;
  name: string;
  qty: number;
  unitPrice: number;
}

export interface Order {
  id: string;
  number: string;
  customerId: string;
  customerName: string;
  date: string;
  expectedDate?: string | null;
  status: string;
  items: LineItem[];
  discountPct: number;
  taxRate: number;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  paymentStatus: string;
  paymentMethod?: string;
  notes?: string;
  createdAt: string;
}

export interface Quote extends Order {
  validUntil?: string | null;
  convertedTo?: string;
  convertedNumber?: string;
}

export interface Invoice {
  id: string;
  number: string;
  orderId: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  date: string;
  dueDate?: string | null;
  items: LineItem[];
  subtotal: number;
  tax: number;
  total: number;
  paidAmount: number;
  balance: number;
  status: string;
  createdAt: string;
}

export interface Payment {
  id: string;
  number: string;
  invoiceId: string;
  invoiceNumber: string;
  customerId: string;
  customerName: string;
  date: string;
  method: string;
  amount: number;
  reference?: string;
  createdAt: string;
}

export interface PurchaseOrder {
  id: string;
  number: string;
  supplierId: string;
  supplierName: string;
  date: string;
  expectedDate?: string | null;
  status: string;
  items: LineItem[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  notes?: string;
  createdAt: string;
}

export interface Activity {
  id: string;
  type: string;
  message: string;
  userId?: string | null;
  userName?: string;
  target?: string | null;
  createdAt: string;
}

export type ResourceName =
  | "diamonds"
  | "gemstones"
  | "jewellery"
  | "products"
  | "customers"
  | "leads"
  | "suppliers"
  | "quotes"
  | "orders"
  | "invoices"
  | "payments"
  | "memos"
  | "returns"
  | "expenses"
  | "tasks"
  | "messages"
  | "documents"
  | "purchaseOrders"
  | "users";

export const canWriteResource = (role: string, resource: ResourceName): boolean => {
  const writes: Record<ResourceName, string[]> = {
    diamonds: ["admin", "manager", "inventory"],
    gemstones: ["admin", "manager", "inventory"],
    jewellery: ["admin", "manager", "inventory"],
    products: ["admin", "manager", "inventory", "sales"],
    customers: ["admin", "manager", "sales"],
    leads: ["admin", "manager", "sales"],
    suppliers: ["admin", "manager"],
    quotes: ["admin", "manager", "sales"],
    orders: ["admin", "manager", "sales"],
    invoices: ["admin", "manager", "sales"],
    payments: ["admin", "manager", "sales"],
    memos: ["admin", "manager", "sales"],
    returns: ["admin", "manager", "sales"],
    expenses: ["admin", "manager"],
    tasks: ["admin", "manager", "sales", "inventory"],
    messages: ["admin", "manager", "sales"],
    documents: ["admin", "manager", "inventory", "sales"],
    purchaseOrders: ["admin", "manager", "inventory"],
    users: ["admin"]
  };
  return writes[resource].includes(role);
};
