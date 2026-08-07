import React from "react";

export interface NavItem {
  to: string;
  label: string;
  icon: React.ReactNode;
  end?: boolean;
}

export interface NavSection {
  section: string;
  items: NavItem[];
}

const s = "h-[18px] w-[18px]";

function Path({ d, extra }: { d: string; extra?: string }) {
  return (
    <svg className={s} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7}>
      <path strokeLinecap="round" strokeLinejoin="round" d={d} />
      {extra && <path strokeLinecap="round" strokeLinejoin="round" d={extra} />}
    </svg>
  );
}

export const Icons = {
  dashboard: <Path d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />,
  diamond: <Path d="M6 3h12l3 5-9 13L3 8l3-5zM3 8h18M9 3l3 5 3-5M12 21l-3-13" />,
  ring: <Path d="M12 3a6 6 0 016 6c0 1.7-.7 3.2-1.8 4.3l1.1 3.1a1 1 0 01-.9 1.4H6.6a1 1 0 01-.9-1.4l1.1-3.1A6 6 0 0112 3zM9 21h6" />,
  gem: <Path d="M6 3h12l4 6-10 12L2 9l4-6zM2 9h20M9 3l3 6 3-6M12 21l-3-12" />,
  box: <Path d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M8.25 3.75h7.5l1.5 2.25h-10.5l1.5-2.25zM12 12.75v3" />,
  stock: <Path d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 5.625c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125" />,
  purchase: <Path d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />,
  users: <Path d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />,
  supplier: <Path d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72m-13.5 8.65h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v3.75c0 .414.336.75.75.75z" />,
  quote: <Path d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />,
  cart: <Path d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />,
  invoice: <Path d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />,
  card: <Path d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />,
  memo: <Path d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9zM12 11.25h4.5M12 14.25h4.5M8.25 8.25H8.251v.001H8.25V8.25z" />,
  return: <Path d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />,
  expense: <Path d="M12 9.75v6m-3-3h6M3.75 12a8.25 8.25 0 1016.5 0 8.25 8.25 0 00-16.5 0z" />,
  accounts: <Path d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />,
  message: <Path d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />,
  task: <Path d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />,
  chart: <Path d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />,
  document: <Path d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />,
  media: <Path d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />,
  activity: <Path d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />,
  settings: <Path d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" extra="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />,
  integration: <Path d="M13.5 10.5V6.75a4.5 4.5 0 119 0v3.75M3.75 21.75h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H3.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />,
  search: <Path d="M21 21l-4.35-4.35M17 10.5a6.5 6.5 0 11-13 0 6.5 6.5 0 0113 0z" />
};

export const NAV: NavSection[] = [
  {
    section: "Overview",
    items: [{ to: "/", label: "Dashboard", icon: Icons.dashboard, end: true }]
  },
  {
    section: "Inventory",
    items: [
      { to: "/inventory/diamonds", label: "Diamonds", icon: Icons.diamond },
      { to: "/inventory/jewellery", label: "Jewellery", icon: Icons.ring },
      { to: "/inventory/gemstones", label: "Gemstones", icon: Icons.gem },
      { to: "/inventory/products", label: "Products", icon: Icons.box },
      { to: "/inventory/stock", label: "Stock", icon: Icons.stock },
      { to: "/purchasing/orders", label: "Purchases", icon: Icons.purchase }
    ]
  },
  {
    section: "Customers",
    items: [
      { to: "/crm/customers", label: "Customers", icon: Icons.users },
      { to: "/crm/suppliers", label: "Suppliers", icon: Icons.supplier },
      { to: "/crm/leads", label: "Leads", icon: Icons.quote }
    ]
  },
  {
    section: "Sales",
    items: [
      { to: "/sales/orders", label: "Orders", icon: Icons.cart },
      { to: "/sales/quotes", label: "Quotes", icon: Icons.quote },
      { to: "/sales/invoices", label: "Invoices", icon: Icons.invoice },
      { to: "/sales/payments", label: "Payments", icon: Icons.card },
      { to: "/sales/memos", label: "Consignments", icon: Icons.memo },
      { to: "/sales/returns", label: "Returns", icon: Icons.return },
      { to: "/sales/expenses", label: "Expenses", icon: Icons.expense }
    ]
  },
  {
    section: "Finance",
    items: [{ to: "/finance/accounts", label: "Accounts", icon: Icons.accounts }]
  },
  {
    section: "Engagement",
    items: [
      { to: "/messages", label: "Messages", icon: Icons.message },
      { to: "/tasks", label: "Tasks", icon: Icons.task }
    ]
  },
  {
    section: "Insights",
    items: [{ to: "/reports", label: "Reports", icon: Icons.chart }]
  },
  {
    section: "Files",
    items: [
      { to: "/documents", label: "Documents", icon: Icons.document },
      { to: "/media", label: "Media", icon: Icons.media }
    ]
  },
  {
    section: "Administration",
    items: [
      { to: "/admin/users", label: "Users", icon: Icons.users },
      { to: "/admin/activity", label: "Activity", icon: Icons.activity },
      { to: "/admin/integrations", label: "Integrations", icon: Icons.integration },
      { to: "/admin/settings", label: "Settings", icon: Icons.settings }
    ]
  }
];

export const GROUP_ROUTES: Record<string, string> = {
  diamonds: "/inventory/diamonds",
  gemstones: "/inventory/gemstones",
  jewellery: "/inventory/jewellery",
  products: "/inventory/products",
  customers: "/crm/customers",
  leads: "/crm/leads",
  suppliers: "/crm/suppliers",
  orders: "/sales/orders",
  quotes: "/sales/quotes",
  invoices: "/sales/invoices",
  payments: "/sales/payments",
  memos: "/sales/memos",
  returns: "/sales/returns",
  expenses: "/sales/expenses",
  tasks: "/tasks",
  messages: "/messages",
  documents: "/documents",
  purchaseOrders: "/purchasing/orders"
};

export const GROUP_LABELS: Record<string, string> = {
  diamonds: "Diamonds",
  gemstones: "Gemstones",
  jewellery: "Jewellery",
  products: "Products",
  customers: "Customers",
  leads: "Leads",
  suppliers: "Suppliers",
  orders: "Orders",
  quotes: "Quotes",
  invoices: "Invoices",
  payments: "Payments",
  memos: "Consignments",
  returns: "Returns",
  expenses: "Expenses",
  tasks: "Tasks",
  messages: "Messages",
  documents: "Documents",
  purchaseOrders: "Purchases"
};

export interface PageMeta {
  title: string;
  sub: string;
}

export function pageMeta(path: string): PageMeta {
  const EXACT: Record<string, PageMeta> = {
    "/": { title: "Dashboard", sub: "Welcome back to Colour Diam" },
    "/inventory/diamonds": { title: "Diamonds", sub: "Fancy colour and white diamonds" },
    "/inventory/jewellery": { title: "Jewellery", sub: "Fine jewellery creations" },
    "/inventory/gemstones": { title: "Gemstones", sub: "Rubies, sapphires, emeralds and more" },
    "/inventory/products": { title: "Products", sub: "Curated product offerings" },
    "/inventory/stock": { title: "Stock", sub: "Live inventory position" },
    "/purchasing/orders": { title: "Purchases", sub: "Procurement and receiving" },
    "/crm/customers": { title: "Customers", sub: "Your client relationships" },
    "/crm/suppliers": { title: "Suppliers", sub: "Vendors and sourcing partners" },
    "/crm/leads": { title: "Leads", sub: "Pipeline and opportunities" },
    "/sales/orders": { title: "Orders", sub: "Confirmed client orders" },
    "/sales/quotes": { title: "Quotes", sub: "Proposals and offers to clients" },
    "/sales/invoices": { title: "Invoices", sub: "Billing and receivables" },
    "/sales/payments": { title: "Payments", sub: "Payments received from clients" },
    "/sales/memos": { title: "Consignments", sub: "Memos out and client consignments" },
    "/sales/returns": { title: "Returns", sub: "Returns and exchanges" },
    "/sales/expenses": { title: "Expenses", sub: "Outgoing spend and claims" },
    "/finance/accounts": { title: "Accounts", sub: "Cash, receivables and payables" },
    "/messages": { title: "Messages", sub: "Client and team conversations" },
    "/tasks": { title: "Tasks", sub: "Team to-dos and follow-ups" },
    "/reports": { title: "Reports", sub: "Analytics and exportable insights" },
    "/documents": { title: "Documents", sub: "Certificates, contracts and files" },
    "/media": { title: "Media", sub: "Photography and asset library" },
    "/admin/users": { title: "Users & Roles", sub: "Team access and permissions" },
    "/admin/activity": { title: "Activity Log", sub: "Audit trail of every change" },
    "/admin/integrations": { title: "Integrations", sub: "API keys and connected services" },
    "/admin/settings": { title: "Settings", sub: "Company and system preferences" }
  };
  if (EXACT[path]) return EXACT[path];
  const match = Object.keys(EXACT)
    .filter((k) => k !== "/" && path.startsWith(k))
    .sort((a, b) => b.length - a.length)[0];
  return match ? EXACT[match] : { title: "Colour Diam", sub: "" };
}
