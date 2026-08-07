import React from "react";
import type { Column } from "../components/DataTable";
import { Badge, statusTone, humanize, Avatar } from "../components/ui";
import { currency } from "../api";
import type { ResourceName } from "../types";

export interface FieldSpec {
  name: string;
  label: string;
  type?: "text" | "number" | "select" | "textarea" | "date" | "tags" | "email";
  options?: string[];
  required?: boolean;
  placeholder?: string;
  span?: 1 | 2;
  hint?: string;
}

export interface FilterSpec {
  name: string;
  label: string;
  options: string[];
}

export interface ResourceConfig {
  title: string;
  subtitle: string;
  singular: string;
  columns: Column<Record<string, unknown>>[];
  fields: FieldSpec[];
  filters: FilterSpec[];
  searchPlaceholder: string;
  getDisplay: (row: Record<string, unknown>) => string;
}

const SHAPES = ["Round", "Oval", "Pear", "Cushion", "Emerald", "Princess", "Radiant", "Marquise", "Asscher", "Heart"];
const CLARITIES = ["FL", "IF", "VVS1", "VVS2", "VS1", "VS2", "SI1", "SI2", "I1", "I2", "I3", "Eye Clean", "Minor Inclusions"];
const CUTS = ["Excellent", "Very Good", "Good", "Fair", "Poor"];
const LABS = ["GIA", "IGI", "HRD", "AGL", "Gubelin", "SSEF", "None"];
const STATUSES = ["in-stock", "reserved", "pending", "sold", "on-consignment", "lost"];
const GEM_STATUSES = ["in-stock", "reserved", "pending", "sold", "on-consignment"];
const JEW_STATUSES = ["in-stock", "reserved", "pending", "sold"];
const CUST_STATUSES = ["active", "lead", "inactive"];
const SEGMENTS = ["retail", "wholesale", "trade"];
const TIERS = ["VIP", "Gold", "Silver", "Standard"];
const LEAD_STATUSES = ["new", "contacted", "qualified", "proposal", "negotiation", "won", "lost"];
const SUPPLIER_TYPES = ["rough-supplier", "cutter", "gem-supplier", "setting-house", "logistics"];
const INV_STATUSES = ["in-stock", "reserved", "sold", "issued", "partial", "paid", "overdue", "void"];
const PAY_METHODS = ["Wire Transfer", "Bank Transfer", "Card", "Cheque", "Crypto", "Trade-In"];
const PROD_STATUSES = ["in-stock", "reserved", "pending", "sold", "on-consignment"];
const MEMO_STATUSES = ["out-standing", "partial-return", "sold", "returned"];
const RETURN_STATUSES = ["pending", "inspected", "approved", "resolved", "rejected"];
const EXPENSE_STATUSES = ["recorded", "approved", "paid", "rejected"];
const TASK_STATUSES = ["todo", "in-progress", "done"];
const TASK_PRIORITIES = ["low", "medium", "high"];
const MSG_STATUSES = ["unread", "read"];
const MSG_DIRECTIONS = ["inbound", "outbound"];
const MSG_CHANNELS = ["email", "phone", "whatsapp", "meeting"];
const DOC_TYPES = ["certificate", "invoice", "memo", "contract", "media", "regulatory"];
const PARTY_TYPES = ["inventory", "customer", "lead", "supplier", "internal"];

const money = (v: unknown) => currency(v as number);
const num = (v: unknown, d = 2) => (v == null ? "—" : Number(v).toFixed(d));
const plain = (v: unknown) => (v == null || v === "" ? "—" : String(v));

function StatusBadge(row: Record<string, unknown>) {
  return <Badge label={humanize(String(row.status || "—"))} tone={statusTone(String(row.status))} />;
}

const diamondForm: FieldSpec[] = [
  { name: "sku", label: "SKU", required: true, placeholder: "FD-PK-3021" },
  { name: "name", label: "Name / Description", required: true, placeholder: "Fancy Vivid Pink" },
  { name: "shape", label: "Shape", type: "select", options: SHAPES },
  { name: "carat", label: "Carat", type: "number", required: true },
  { name: "color", label: "Colour", placeholder: "Fancy Vivid Pink" },
  { name: "colourIntensity", label: "Colour Intensity", type: "select", options: ["Faint", "Very Light", "Light", "Fancy Light", "Fancy", "Fancy Intense", "Fancy Vivid", "Fancy Deep", "Fancy Dark"] },
  { name: "colourModifier", label: "Colour Modifier", placeholder: "e.g. Pink, Brownish" },
  { name: "clarity", label: "Clarity", type: "select", options: CLARITIES },
  { name: "cut", label: "Cut", type: "select", options: CUTS },
  { name: "polish", label: "Polish", type: "select", options: CUTS },
  { name: "symmetry", label: "Symmetry", type: "select", options: CUTS },
  { name: "fluorescence", label: "Fluorescence", options: ["None", "Faint", "Medium", "Strong", "Very Strong"] },
  { name: "lab", label: "Laboratory", type: "select", options: LABS },
  { name: "certNumber", label: "Certificate No.", placeholder: "GIA 2201345567" },
  { name: "origin", label: "Origin", placeholder: "Argyle" },
  { name: "measurements", label: "Measurements", placeholder: "9.40 × 9.40 × 5.93 mm" },
  { name: "depth", label: "Depth %", type: "number" },
  { name: "table", label: "Table %", type: "number" },
  { name: "quantity", label: "Quantity", type: "number" },
  { name: "location", label: "Location", placeholder: "Geneva Vault" },
  { name: "pricePerCarat", label: "Price / Carat (USD)", type: "number" },
  { name: "costPerCarat", label: "Cost / Carat (USD)", type: "number" },
  { name: "status", label: "Status", type: "select", options: STATUSES },
  { name: "notes", label: "Notes", type: "textarea", span: 2 }
];

const diamondFilters: FilterSpec[] = [
  { name: "status", label: "Status", options: STATUSES },
  { name: "shape", label: "Shape", options: SHAPES }
];

const gemstoneForm: FieldSpec[] = [
  { name: "sku", label: "SKU", required: true },
  { name: "name", label: "Name", required: true },
  { name: "stoneType", label: "Stone Type", options: ["Ruby", "Sapphire", "Emerald", "Tourmaline", "Alexandrite", "Garnet", "Spinel", "Tanzanite", "Pearl", "Other"] },
  { name: "carat", label: "Carat", type: "number", required: true },
  { name: "color", label: "Colour", placeholder: "Pigeon Blood Red" },
  { name: "clarity", label: "Clarity", type: "select", options: CLARITIES },
  { name: "cut", label: "Cut", type: "select", options: SHAPES },
  { name: "treatment", label: "Treatment", options: ["None", "Heated", "Minor Oil", "Fracture Filled", "Unknown"] },
  { name: "lab", label: "Laboratory", type: "select", options: LABS },
  { name: "certNumber", label: "Certificate No." },
  { name: "origin", label: "Origin", placeholder: "Mogok, Burma" },
  { name: "quantity", label: "Quantity", type: "number" },
  { name: "location", label: "Location" },
  { name: "pricePerCarat", label: "Price / Carat (USD)", type: "number" },
  { name: "costPerCarat", label: "Cost / Carat (USD)", type: "number" },
  { name: "status", label: "Status", type: "select", options: GEM_STATUSES },
  { name: "notes", label: "Notes", type: "textarea", span: 2 }
];

const jewelleryForm: FieldSpec[] = [
  { name: "sku", label: "SKU", required: true },
  { name: "name", label: "Name", required: true },
  { name: "jewelleryType", label: "Type", options: ["Ring", "Necklace", "Earrings", "Bracelet", "Bangle", "Pendant", "Brooch", "Cufflinks", "Tiara"] },
  { name: "material", label: "Material", options: ["18k Yellow Gold", "18k White Gold", "18k Rose Gold", "Platinum", "14k Gold", "Sterling Silver"] },
  { name: "totalCarat", label: "Total Carat Weight", type: "number" },
  { name: "primaryStone", label: "Primary Stone" },
  { name: "colour", label: "Colour" },
  { name: "price", label: "Price (USD)", type: "number", required: true },
  { name: "cost", label: "Cost (USD)", type: "number" },
  { name: "quantity", label: "Quantity", type: "number" },
  { name: "location", label: "Location" },
  { name: "status", label: "Status", type: "select", options: JEW_STATUSES },
  { name: "notes", label: "Notes", type: "textarea", span: 2 }
];

const customerForm: FieldSpec[] = [
  { name: "code", label: "Code", required: true, placeholder: "C-013" },
  { name: "name", label: "Name", required: true },
  { name: "company", label: "Company" },
  { name: "contact", label: "Contact Person" },
  { name: "email", label: "Email", type: "email" },
  { name: "phone", label: "Phone" },
  { name: "address", label: "Address", span: 2 },
  { name: "city", label: "City" },
  { name: "country", label: "Country" },
  { name: "segment", label: "Segment", type: "select", options: SEGMENTS },
  { name: "tier", label: "Tier", type: "select", options: TIERS },
  { name: "tags", label: "Tags (comma separated)", type: "tags" },
  { name: "source", label: "Source", options: ["Referral", "Website", "Trade show", "Social media", "Walk-in", "Other"] },
  { name: "status", label: "Status", type: "select", options: CUST_STATUSES },
  { name: "creditLimit", label: "Credit Limit (USD)", type: "number" },
  { name: "balance", label: "Current Balance (USD)", type: "number" },
  { name: "notes", label: "Notes", type: "textarea", span: 2 }
];

const leadForm: FieldSpec[] = [
  { name: "name", label: "Name", required: true },
  { name: "company", label: "Company" },
  { name: "email", label: "Email", type: "email" },
  { name: "phone", label: "Phone" },
  { name: "source", label: "Source", options: ["Referral", "Website", "Trade show", "Social media", "Walk-in", "Other"] },
  { name: "status", label: "Status", type: "select", options: LEAD_STATUSES },
  { name: "value", label: "Potential Value (USD)", type: "number" },
  { name: "owner", label: "Owner", type: "select", options: [], hint: "Assigned team member" },
  { name: "nextAction", label: "Next Action" },
  { name: "nextActionDate", label: "Next Action Date", type: "date" },
  { name: "notes", label: "Notes", type: "textarea", span: 2 }
];

const supplierForm: FieldSpec[] = [
  { name: "code", label: "Code", required: true, placeholder: "S-007" },
  { name: "name", label: "Name", required: true },
  { name: "contact", label: "Contact Person" },
  { name: "email", label: "Email", type: "email" },
  { name: "phone", label: "Phone" },
  { name: "type", label: "Type", type: "select", options: SUPPLIER_TYPES },
  { name: "city", label: "City" },
  { name: "country", label: "Country" },
  { name: "terms", label: "Payment Terms", options: ["Net 30", "Net 60", "50% Deposit", "100% Advance"] },
  { name: "leadTime", label: "Lead Time (days)", type: "number" },
  { name: "rating", label: "Rating (1-5)", type: "number" },
  { name: "notes", label: "Notes", type: "textarea", span: 2 }
];

const invoiceForm: FieldSpec[] = [
  { name: "number", label: "Invoice Number", required: true, placeholder: "INV-2026-0011" },
  { name: "customerId", label: "Customer ID", hint: "Select customer below" },
  { name: "customerName", label: "Customer Name", required: true },
  { name: "date", label: "Invoice Date", type: "date" },
  { name: "dueDate", label: "Due Date", type: "date" },
  { name: "subtotal", label: "Subtotal (USD)", type: "number" },
  { name: "tax", label: "Tax (USD)", type: "number" },
  { name: "total", label: "Total (USD)", type: "number" },
  { name: "paidAmount", label: "Paid Amount (USD)", type: "number" },
  { name: "status", label: "Status", type: "select", options: INV_STATUSES },
  { name: "notes", label: "Notes", type: "textarea", span: 2 }
];

const paymentForm: FieldSpec[] = [
  { name: "number", label: "Payment Number", required: true, placeholder: "PAY-2026-0019" },
  { name: "invoiceNumber", label: "Invoice Number", required: true },
  { name: "customerName", label: "Customer Name", required: true },
  { name: "date", label: "Payment Date", type: "date" },
  { name: "method", label: "Method", type: "select", options: PAY_METHODS },
  { name: "amount", label: "Amount (USD)", type: "number", required: true },
  { name: "reference", label: "Reference" },
  { name: "notes", label: "Notes", type: "textarea", span: 2 }
];

function nameCell(row: Record<string, unknown>, sub?: string) {
  return (
    <div className="min-w-0">
      <p className="truncate font-medium text-ink-900">{plain(row.name)}</p>
      <p className="truncate text-xs text-ink-500">{sub ? plain(row[sub]) : plain(row.sku)}</p>
    </div>
  );
}

function customerCell(row: Record<string, unknown>) {
  return (
    <div className="flex items-center gap-2.5">
      <Avatar name={String(row.name || "")} size="sm" />
      <div className="min-w-0">
        <p className="truncate font-medium text-ink-900">{plain(row.name)}</p>
        <p className="truncate text-xs text-ink-500">{plain(row.contact)}</p>
      </div>
    </div>
  );
}

const CONFIGS: Partial<Record<ResourceName, ResourceConfig>> = {
  diamonds: {
    title: "Diamonds",
    subtitle: "Fancy colour and white diamonds",
    singular: "diamond",
    searchPlaceholder: "Search by name, SKU, colour, clarity, cert…",
    getDisplay: (r) => String(r.name || r.sku || ""),
    filters: diamondFilters,
    fields: diamondForm,
    columns: [
      { key: "sku", header: "SKU", render: (r) => <span className="font-mono text-xs text-ink-500">{plain(r.sku)}</span> },
      { key: "name", header: "Stone", render: (r) => nameCell(r) },
      { key: "carat", header: "Carat", align: "right", sortable: true, render: (r) => <span className="font-medium">{num(r.carat, 2)} ct</span> },
      { key: "color", header: "Colour", hideOnMobile: true, render: (r) => plain(r.color) },
      { key: "clarity", header: "Clarity", hideOnMobile: true, render: (r) => plain(r.clarity) },
      { key: "lab", header: "Lab", hideOnMobile: true, render: (r) => <span className="text-xs">{plain(r.lab)}</span> },
      { key: "pricePerCarat", header: "$ / ct", align: "right", sortable: true, hideOnMobile: true, render: (r) => money(r.pricePerCarat) },
      { key: "price", header: "Price", align: "right", sortable: true, render: (r) => <span className="font-semibold text-ink-950">{money(r.price)}</span> },
      { key: "status", header: "Status", render: StatusBadge }
    ]
  },
  gemstones: {
    title: "Gemstones",
    subtitle: "Rubies, sapphires, emeralds and more",
    singular: "gemstone",
    searchPlaceholder: "Search by name, SKU, origin, type…",
    getDisplay: (r) => String(r.name || r.sku || ""),
    filters: [
      { name: "status", label: "Status", options: GEM_STATUSES },
      { name: "stoneType", label: "Type", options: ["Ruby", "Sapphire", "Emerald", "Tourmaline", "Alexandrite", "Garnet", "Spinel"] }
    ],
    fields: gemstoneForm,
    columns: [
      { key: "sku", header: "SKU", render: (r) => <span className="font-mono text-xs text-ink-500">{plain(r.sku)}</span> },
      { key: "name", header: "Stone", render: (r) => nameCell(r, "stoneType") },
      { key: "carat", header: "Carat", align: "right", sortable: true, render: (r) => <span className="font-medium">{num(r.carat, 2)} ct</span> },
      { key: "color", header: "Colour", hideOnMobile: true, render: (r) => plain(r.color) },
      { key: "origin", header: "Origin", hideOnMobile: true, render: (r) => plain(r.origin) },
      { key: "pricePerCarat", header: "$ / ct", align: "right", sortable: true, hideOnMobile: true, render: (r) => money(r.pricePerCarat) },
      { key: "price", header: "Price", align: "right", sortable: true, render: (r) => <span className="font-semibold text-ink-950">{money(r.price)}</span> },
      { key: "status", header: "Status", render: StatusBadge }
    ]
  },
  jewellery: {
    title: "Jewellery",
    subtitle: "Fine jewellery creations",
    singular: "piece",
    searchPlaceholder: "Search by name, SKU, material, type…",
    getDisplay: (r) => String(r.name || r.sku || ""),
    filters: [
      { name: "status", label: "Status", options: JEW_STATUSES },
      { name: "jewelleryType", label: "Type", options: ["Ring", "Necklace", "Earrings", "Bracelet", "Bangle", "Pendant", "Brooch", "Cufflinks"] },
      { name: "colour", label: "Colour", options: ["White", "Yellow", "Pink", "Blue", "Green"] }
    ],
    fields: jewelleryForm,
    columns: [
      { key: "sku", header: "SKU", render: (r) => <span className="font-mono text-xs text-ink-500">{plain(r.sku)}</span> },
      { key: "name", header: "Piece", render: (r) => nameCell(r, "jewelleryType") },
      { key: "material", header: "Material", hideOnMobile: true, render: (r) => plain(r.material) },
      { key: "totalCarat", header: "Total Ct", align: "right", sortable: true, hideOnMobile: true, render: (r) => (r.totalCarat != null ? `${num(r.totalCarat, 1)} ct` : "—") },
      { key: "price", header: "Price", align: "right", sortable: true, render: (r) => <span className="font-semibold text-ink-950">{money(r.price)}</span> },
      { key: "status", header: "Status", render: StatusBadge }
    ]
  },
  customers: {
    title: "Customers",
    subtitle: "Your client relationships",
    singular: "customer",
    searchPlaceholder: "Search by name, company, email, city…",
    getDisplay: (r) => String(r.name || ""),
    filters: [
      { name: "status", label: "Status", options: CUST_STATUSES },
      { name: "segment", label: "Segment", options: SEGMENTS },
      { name: "tier", label: "Tier", options: TIERS }
    ],
    fields: customerForm,
    columns: [
      { key: "code", header: "Code", render: (r) => <span className="font-mono text-xs text-ink-500">{plain(r.code)}</span> },
      { key: "name", header: "Customer", render: customerCell },
      { key: "email", header: "Email", hideOnMobile: true, render: (r) => plain(r.email) },
      { key: "city", header: "Location", hideOnMobile: true, render: (r) => `${plain(r.city)} · ${plain(r.country)}` },
      { key: "segment", header: "Segment", hideOnMobile: true, render: (r) => <Badge label={humanize(String(r.segment))} tone="gold" /> },
      { key: "tier", header: "Tier", hideOnMobile: true, render: (r) => <Badge label={String(r.tier)} tone={r.tier === "VIP" ? "purple" : "blue"} /> },
      { key: "balance", header: "Balance", align: "right", sortable: true, render: (r) => <span className={Number(r.balance) > 0 ? "font-medium text-ink-900" : "text-ink-400"}>{money(r.balance)}</span> },
      { key: "status", header: "Status", render: StatusBadge }
    ]
  },
  leads: {
    title: "Leads",
    subtitle: "Pipeline and opportunities",
    singular: "lead",
    searchPlaceholder: "Search by name, company, email, source…",
    getDisplay: (r) => String(r.name || ""),
    filters: [{ name: "status", label: "Status", options: LEAD_STATUSES }, { name: "source", label: "Source", options: ["Referral", "Website", "Trade show", "Social media"] }],
    fields: leadForm,
    columns: [
      { key: "name", header: "Lead", render: (r) => nameCell(r, "company") },
      { key: "email", header: "Contact", hideOnMobile: true, render: (r) => <div className="min-w-0"><p className="truncate text-xs">{plain(r.email)}</p><p className="truncate text-xs text-ink-400">{plain(r.phone)}</p></div> },
      { key: "source", header: "Source", hideOnMobile: true, render: (r) => plain(r.source) },
      { key: "value", header: "Value", align: "right", sortable: true, render: (r) => <span className="font-semibold">{money(r.value)}</span> },
      { key: "nextActionDate", header: "Next Action", hideOnMobile: true, render: (r) => (r.nextActionDate ? <span className="text-xs">{new Date(String(r.nextActionDate)).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}</span> : "—") },
      { key: "status", header: "Status", render: StatusBadge }
    ]
  },
  suppliers: {
    title: "Suppliers",
    subtitle: "Vendors and sourcing partners",
    singular: "supplier",
    searchPlaceholder: "Search by name, contact, type, city…",
    getDisplay: (r) => String(r.name || ""),
    filters: [{ name: "type", label: "Type", options: SUPPLIER_TYPES }],
    fields: supplierForm,
    columns: [
      { key: "code", header: "Code", render: (r) => <span className="font-mono text-xs text-ink-500">{plain(r.code)}</span> },
      { key: "name", header: "Supplier", render: (r) => nameCell(r, "contact") },
      { key: "type", header: "Type", render: (r) => <Badge label={humanize(String(r.type))} tone="gold" /> },
      { key: "city", header: "Location", hideOnMobile: true, render: (r) => `${plain(r.city)} · ${plain(r.country)}` },
      { key: "terms", header: "Terms", hideOnMobile: true, render: (r) => plain(r.terms) },
      { key: "leadTime", header: "Lead Time", align: "right", hideOnMobile: true, render: (r) => (r.leadTime != null ? `${r.leadTime} days` : "—") },
      { key: "rating", header: "Rating", align: "right", render: (r) => <span className="text-gold-600">{"★".repeat(Math.max(0, Math.min(5, Number(r.rating) || 0)))}<span className="text-ink-200">{"★".repeat(Math.max(0, 5 - (Number(r.rating) || 0)))}</span></span> }
    ]
  },
  invoices: {
    title: "Invoices",
    subtitle: "Billing and receivables",
    singular: "invoice",
    searchPlaceholder: "Search by number, customer, status…",
    getDisplay: (r) => String(r.number || ""),
    filters: [
      { name: "status", label: "Status", options: ["issued", "partial", "paid", "overdue", "void"] }
    ],
    fields: invoiceForm,
    columns: [
      { key: "number", header: "Invoice", render: (r) => <span className="font-medium text-ink-900">{plain(r.number)}</span> },
      { key: "customerName", header: "Customer", render: (r) => nameCell(r, "orderNumber") },
      { key: "date", header: "Date", hideOnMobile: true, render: (r) => (r.date ? <span className="text-xs">{new Date(String(r.date)).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</span> : "—") },
      { key: "total", header: "Total", align: "right", sortable: true, render: (r) => <span className="font-semibold">{money(r.total)}</span> },
      { key: "paidAmount", header: "Paid", align: "right", hideOnMobile: true, render: (r) => money(r.paidAmount) },
      { key: "balance", header: "Balance", align: "right", sortable: true, render: (r) => <span className={Number(r.balance) > 0 ? "font-medium text-red-600" : "text-ink-400"}>{money(r.balance)}</span> },
      { key: "status", header: "Status", render: StatusBadge }
    ]
  },
  payments: {
    title: "Payments",
    subtitle: "Payments received from clients",
    singular: "payment",
    searchPlaceholder: "Search by number, customer, method…",
    getDisplay: (r) => String(r.number || ""),
    filters: [{ name: "method", label: "Method", options: PAY_METHODS }],
    fields: paymentForm,
    columns: [
      { key: "number", header: "Payment", render: (r) => <span className="font-medium text-ink-900">{plain(r.number)}</span> },
      { key: "invoiceNumber", header: "Invoice", render: (r) => <span className="font-mono text-xs text-ink-500">{plain(r.invoiceNumber)}</span> },
      { key: "customerName", header: "Customer", hideOnMobile: true, render: (r) => plain(r.customerName) },
      { key: "date", header: "Date", hideOnMobile: true, render: (r) => (r.date ? <span className="text-xs">{new Date(String(r.date)).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</span> : "—") },
      { key: "method", header: "Method", hideOnMobile: true, render: (r) => <Badge label={String(r.method)} tone="blue" /> },
      { key: "amount", header: "Amount", align: "right", sortable: true, render: (r) => <span className="font-semibold text-emerald-700">+{money(r.amount)}</span> },
      { key: "reference", header: "Reference", hideOnMobile: true, render: (r) => <span className="font-mono text-xs text-ink-400">{plain(r.reference)}</span> }
    ]
  },
  products: {
    title: "Products",
    subtitle: "Curated product offerings",
    singular: "product",
    searchPlaceholder: "Search by name, SKU, category, tag…",
    getDisplay: (r) => String(r.name || r.sku || ""),
    filters: [
      { name: "status", label: "Status", options: PROD_STATUSES },
      { name: "category", label: "Category", options: ["Ring", "Necklace", "Earrings", "Bracelet", "Bangle", "Pendant", "Brooch", "Cufflinks"] }
    ],
    fields: [
      { name: "sku", label: "SKU", required: true },
      { name: "name", label: "Name", required: true },
      { name: "category", label: "Category", type: "select", options: ["Ring", "Necklace", "Earrings", "Bracelet", "Bangle", "Pendant", "Brooch", "Cufflinks"] },
      { name: "material", label: "Material" },
      { name: "description", label: "Description", type: "textarea", span: 2 },
      { name: "price", label: "Price (USD)", type: "number", required: true },
      { name: "cost", label: "Cost (USD)", type: "number" },
      { name: "quantity", label: "Quantity", type: "number" },
      { name: "location", label: "Location" },
      { name: "status", label: "Status", type: "select", options: PROD_STATUSES },
      { name: "tags", label: "Tags (comma separated)", type: "tags" },
      { name: "notes", label: "Notes", type: "textarea", span: 2 }
    ],
    columns: [
      { key: "sku", header: "SKU", render: (r) => <span className="font-mono text-xs text-ink-500">{plain(r.sku)}</span> },
      { key: "name", header: "Product", render: (r) => nameCell(r, "category") },
      { key: "material", header: "Material", hideOnMobile: true, render: (r) => plain(r.material) },
      { key: "quantity", header: "Qty", align: "right", hideOnMobile: true, render: (r) => <span className="font-medium">{num(r.quantity, 0)}</span> },
      { key: "price", header: "Price", align: "right", sortable: true, render: (r) => <span className="font-semibold text-ink-950">{money(r.price)}</span> },
      { key: "status", header: "Status", render: StatusBadge }
    ]
  },
  memos: {
    title: "Consignments",
    subtitle: "Memos out and client consignments",
    singular: "memo",
    searchPlaceholder: "Search by number, customer, status…",
    getDisplay: (r) => String(r.number || ""),
    filters: [{ name: "status", label: "Status", options: MEMO_STATUSES }],
    fields: [
      { name: "number", label: "Memo Number", required: true, placeholder: "MEM-2026-0006" },
      { name: "customerId", label: "Customer ID" },
      { name: "customerName", label: "Customer Name", required: true },
      { name: "date", label: "Memo Date", type: "date" },
      { name: "dueDate", label: "Due Date", type: "date" },
      { name: "totalValue", label: "Total Value (USD)", type: "number" },
      { name: "status", label: "Status", type: "select", options: MEMO_STATUSES },
      { name: "notes", label: "Notes", type: "textarea", span: 2 }
    ],
    columns: [
      { key: "number", header: "Memo", render: (r) => <span className="font-medium text-ink-900">{plain(r.number)}</span> },
      { key: "customerName", header: "Customer", render: (r) => nameCell(r) },
      { key: "date", header: "Date", hideOnMobile: true, render: (r) => (r.date ? <span className="text-xs">{new Date(String(r.date)).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</span> : "—") },
      { key: "dueDate", header: "Due", hideOnMobile: true, render: (r) => (r.dueDate ? <span className="text-xs">{new Date(String(r.dueDate)).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}</span> : "—") },
      { key: "totalValue", header: "Value", align: "right", sortable: true, render: (r) => <span className="font-semibold">{money(r.totalValue)}</span> },
      { key: "status", header: "Status", render: StatusBadge }
    ]
  },
  returns: {
    title: "Returns",
    subtitle: "Returns and exchanges",
    singular: "return",
    searchPlaceholder: "Search by number, customer, reason…",
    getDisplay: (r) => String(r.number || ""),
    filters: [{ name: "status", label: "Status", options: RETURN_STATUSES }],
    fields: [
      { name: "number", label: "Return Number", required: true, placeholder: "RET-2026-0004" },
      { name: "orderNumber", label: "Order Number" },
      { name: "customerId", label: "Customer ID" },
      { name: "customerName", label: "Customer Name", required: true },
      { name: "date", label: "Return Date", type: "date" },
      { name: "reason", label: "Reason" },
      { name: "condition", label: "Condition" },
      { name: "refundAmount", label: "Refund Amount (USD)", type: "number" },
      { name: "status", label: "Status", type: "select", options: RETURN_STATUSES },
      { name: "notes", label: "Notes", type: "textarea", span: 2 }
    ],
    columns: [
      { key: "number", header: "Return", render: (r) => <span className="font-medium text-ink-900">{plain(r.number)}</span> },
      { key: "customerName", header: "Customer", render: (r) => nameCell(r, "orderNumber") },
      { key: "reason", header: "Reason", hideOnMobile: true, render: (r) => plain(r.reason) },
      { key: "date", header: "Date", hideOnMobile: true, render: (r) => (r.date ? <span className="text-xs">{new Date(String(r.date)).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</span> : "—") },
      { key: "refundAmount", header: "Refund", align: "right", sortable: true, render: (r) => <span className="font-semibold">{money(r.refundAmount)}</span> },
      { key: "status", header: "Status", render: StatusBadge }
    ]
  },
  expenses: {
    title: "Expenses",
    subtitle: "Outgoing spend and claims",
    singular: "expense",
    searchPlaceholder: "Search by number, vendor, category…",
    getDisplay: (r) => String(r.number || ""),
    filters: [{ name: "status", label: "Status", options: EXPENSE_STATUSES }, { name: "category", label: "Category", options: ["Security & Insurance", "Marketing", "Logistics", "Travel", "Office", "Professional Fees"] }],
    fields: [
      { name: "number", label: "Expense Number", required: true, placeholder: "EXP-2026-0017" },
      { name: "date", label: "Date", type: "date" },
      { name: "category", label: "Category", options: ["Security & Insurance", "Marketing", "Logistics", "Travel", "Office", "Professional Fees"] },
      { name: "vendor", label: "Vendor / Payee" },
      { name: "description", label: "Description", span: 2 },
      { name: "amount", label: "Amount (USD)", type: "number", required: true },
      { name: "paymentMethod", label: "Payment Method", type: "select", options: PAY_METHODS },
      { name: "status", label: "Status", type: "select", options: EXPENSE_STATUSES },
      { name: "notes", label: "Notes", type: "textarea", span: 2 }
    ],
    columns: [
      { key: "number", header: "Expense", render: (r) => <span className="font-medium text-ink-900">{plain(r.number)}</span> },
      { key: "date", header: "Date", hideOnMobile: true, render: (r) => (r.date ? <span className="text-xs">{new Date(String(r.date)).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</span> : "—") },
      { key: "category", header: "Category", render: (r) => <Badge label={plain(r.category)} tone="blue" /> },
      { key: "vendor", header: "Vendor", hideOnMobile: true, render: (r) => plain(r.vendor) },
      { key: "amount", header: "Amount", align: "right", sortable: true, render: (r) => <span className="font-semibold text-red-600">-{money(r.amount)}</span> },
      { key: "status", header: "Status", render: StatusBadge }
    ]
  },
  tasks: {
    title: "Tasks",
    subtitle: "Team to-dos and follow-ups",
    singular: "task",
    searchPlaceholder: "Search by title, assignee, module…",
    getDisplay: (r) => String(r.title || ""),
    filters: [{ name: "status", label: "Status", options: TASK_STATUSES }, { name: "priority", label: "Priority", options: TASK_PRIORITIES }],
    fields: [
      { name: "title", label: "Title", required: true },
      { name: "description", label: "Description", type: "textarea", span: 2 },
      { name: "assigneeName", label: "Assignee" },
      { name: "dueDate", label: "Due Date", type: "date" },
      { name: "priority", label: "Priority", type: "select", options: TASK_PRIORITIES },
      { name: "status", label: "Status", type: "select", options: TASK_STATUSES },
      { name: "module", label: "Module" },
      { name: "relatedName", label: "Related Record" }
    ],
    columns: [
      { key: "title", header: "Task", render: (r) => nameCell(r, "relatedName") },
      { key: "assigneeName", header: "Assignee", hideOnMobile: true, render: (r) => <div className="flex items-center gap-2"><Avatar name={String(r.assigneeName || "")} size="sm" /><span className="text-sm">{plain(r.assigneeName)}</span></div> },
      { key: "dueDate", header: "Due", hideOnMobile: true, render: (r) => (r.dueDate ? <span className="text-xs">{new Date(String(r.dueDate)).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}</span> : "—") },
      { key: "priority", header: "Priority", render: (r) => <Badge label={String(r.priority)} tone={r.priority === "high" ? "red" : r.priority === "medium" ? "amber" : "gray"} /> },
      { key: "status", header: "Status", render: StatusBadge }
    ]
  },
  messages: {
    title: "Messages",
    subtitle: "Client and team conversations",
    singular: "message",
    searchPlaceholder: "Search by subject, party, channel…",
    getDisplay: (r) => String(r.subject || ""),
    filters: [{ name: "status", label: "Status", options: MSG_STATUSES }, { name: "direction", label: "Direction", options: MSG_DIRECTIONS }],
    fields: [
      { name: "subject", label: "Subject", required: true },
      { name: "partyType", label: "Party Type", type: "select", options: PARTY_TYPES },
      { name: "partyName", label: "Party" },
      { name: "direction", label: "Direction", type: "select", options: MSG_DIRECTIONS },
      { name: "channel", label: "Channel", type: "select", options: MSG_CHANNELS },
      { name: "owner", label: "Owner ID" },
      { name: "ownerName", label: "Owner Name" },
      { name: "date", label: "Date", type: "date" },
      { name: "status", label: "Status", type: "select", options: MSG_STATUSES },
      { name: "body", label: "Body", type: "textarea", span: 2 }
    ],
    columns: [
      { key: "subject", header: "Subject", render: (r) => nameCell(r, "partyName") },
      { key: "partyName", header: "Party", hideOnMobile: true, render: (r) => <div className="flex items-center gap-2"><Avatar name={String(r.partyName || "")} size="sm" /><span className="text-sm">{plain(r.partyName)}</span></div> },
      { key: "direction", header: "Dir", hideOnMobile: true, render: (r) => <Badge label={String(r.direction)} tone={r.direction === "inbound" ? "blue" : "green"} /> },
      { key: "channel", header: "Channel", hideOnMobile: true, render: (r) => plain(r.channel) },
      { key: "date", header: "Date", hideOnMobile: true, render: (r) => (r.date ? <span className="text-xs">{new Date(String(r.date)).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</span> : "—") },
      { key: "status", header: "Status", render: (r) => <Badge label={String(r.status)} tone={r.status === "unread" ? "amber" : "gray"} /> }
    ]
  },
  documents: {
    title: "Documents",
    subtitle: "Certificates, contracts and files",
    singular: "document",
    searchPlaceholder: "Search by name, type, party, tag…",
    getDisplay: (r) => String(r.name || ""),
    filters: [{ name: "type", label: "Type", options: DOC_TYPES }],
    fields: [
      { name: "name", label: "Name", required: true },
      { name: "type", label: "Type", type: "select", options: DOC_TYPES },
      { name: "partyType", label: "Party Type", type: "select", options: PARTY_TYPES },
      { name: "partyName", label: "Party" },
      { name: "date", label: "Date", type: "date" },
      { name: "tags", label: "Tags (comma separated)", type: "tags" },
      { name: "url", label: "File URL" },
      { name: "notes", label: "Notes", type: "textarea", span: 2 }
    ],
    columns: [
      { key: "name", header: "Document", render: (r) => nameCell(r, "type") },
      { key: "type", header: "Type", render: (r) => <Badge label={String(r.type)} tone="gold" /> },
      { key: "partyName", header: "Party", hideOnMobile: true, render: (r) => plain(r.partyName) },
      { key: "date", header: "Date", hideOnMobile: true, render: (r) => (r.date ? <span className="text-xs">{new Date(String(r.date)).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</span> : "—") },
      { key: "url", header: "File", hideOnMobile: true, render: (r) => (r.url ? <a href={String(r.url)} target="_blank" rel="noreferrer" className="text-gold-700 hover:underline">Open ↗</a> : <span className="text-ink-400">—</span>) }
    ]
  },
  users: {
    title: "Users",
    subtitle: "Team access and permissions",
    singular: "user",
    searchPlaceholder: "Search users…",
    getDisplay: (r) => String(r.name || ""),
    filters: [{ name: "role", label: "Role", options: ["admin", "manager", "sales", "inventory", "viewer"] }],
    fields: [],
    columns: [
      { key: "name", header: "User", render: (r) => (
          <div className="flex items-center gap-2.5">
            <Avatar name={String(r.name || "")} size="sm" />
            <div className="min-w-0">
              <p className="truncate font-medium text-ink-900">{plain(r.name)}</p>
              <p className="truncate text-xs text-ink-500">{plain(r.title)}</p>
            </div>
          </div>
        ) },
      { key: "email", header: "Email", hideOnMobile: true, render: (r) => plain(r.email) },
      { key: "role", header: "Role", render: (r) => <Badge label={String(r.role)} tone={r.role === "admin" ? "purple" : r.role === "manager" ? "gold" : "blue"} /> },
      { key: "active", header: "Status", render: (r) => (r.active ? <Badge label="Active" tone="green" /> : <Badge label="Inactive" tone="gray" />) }
    ]
  }
};

export function getResourceConfig(resource: ResourceName): ResourceConfig {
  return CONFIGS[resource] as ResourceConfig;
}

export function leaderOptions(users: Array<{ id: string; name: string }>) {
  return users.map((u) => ({ value: u.id, label: u.name }));
}

export const ownerName = (users: Array<{ id: string; name: string }>, id: unknown) =>
  users.find((u) => u.id === id)?.name || "—";

export { money, num, plain };
