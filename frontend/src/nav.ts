import {
  LayoutDashboard,
  Gem,
  Package,
  Warehouse,
  FileText,
  RotateCcw,
  Receipt,
  BookOpen,
  ListChecks,
  Mail,
  Folder,
  Image,
  Plug,
  Workflow,
  Shield,
  BarChart3,
  Users,
  TrendingUp,
  FilePlus,
  CreditCard,
  FileSignature,
  ShoppingCart,
  Activity as ActivityIcon,
  Code2,
  type LucideIcon,
} from 'lucide-react';

export interface NavItem {
  label: string;
  path: string;
  module?: string;
  icon: LucideIcon;
  group: string;
  keywords: string;
}

export interface NavGroup {
  title: string;
  items: NavItem[];
}

// Pages that get dedicated routes instead of the generic /m/:key module page.
export const SPECIAL_MODULES = [
  'diamonds',
  'accounts',
  'customers',
  'leads',
  'messages',
  'invoices',
  'payments',
  'quotations',
];

const STATIC_PAGES: NavItem[] = [
  { label: 'Dashboard', path: '/', icon: LayoutDashboard, group: 'Overview', keywords: 'home overview kpi stats dashboard' },
  { label: 'Customers CRM', path: '/customers', icon: Users, group: 'CRM', keywords: 'customers crm contacts clients party timeline' },
  { label: 'Leads Pipeline', path: '/leads', icon: TrendingUp, group: 'CRM', keywords: 'leads pipeline kanban opportunities deals' },
  { label: 'Sales Workspace', path: '/sales', icon: ShoppingCart, group: 'Sales', keywords: 'sales workspace invoices payments quotations' },
  { label: 'Messages', path: '/messages', icon: Mail, group: 'Operations', keywords: 'messages inbox whatsapp chat email sms' },
  { label: 'Reports Centre', path: '/reports', icon: BarChart3, group: 'Finance', keywords: 'reports accounts aging cashflow receivable payable inventory' },
  { label: 'Activity', path: '/activity', icon: ActivityIcon, group: 'Overview', keywords: 'activity feed timeline audit trail log' },
  { label: 'API Explorer', path: '/api-explorer', icon: Code2, group: 'Admin', keywords: 'api explorer endpoints developer rest swagger' },
];

const MODULE_ICONS: Record<string, LucideIcon> = {
  diamonds: Gem,
  products: Package,
  stock: Warehouse,
  memos: FileText,
  returns: RotateCcw,
  expenses: Receipt,
  accounts: BookOpen,
  tasks: ListChecks,
  messages: Mail,
  documents: Folder,
  media: Image,
  integrations: Plug,
  workflows: Workflow,
  roles: Shield,
  customers: Users,
  leads: TrendingUp,
  invoices: FilePlus,
  payments: CreditCard,
  quotations: FileSignature,
};

const GROUP_ORDER = ['Overview', 'Inventory', 'CRM', 'Sales', 'Finance', 'Operations', 'Admin'];

export function buildNav(modules: Array<{ key: string; name: string; icon: string; group: string }>): NavGroup[] {
  const groups = new Map<string, NavItem[]>();

  const add = (item: NavItem) => {
    const list = groups.get(item.group) || [];
    list.push(item);
    groups.set(item.group, list);
  };

  STATIC_PAGES.forEach(add);

  for (const m of modules) {
    if (SPECIAL_MODULES.includes(m.key)) continue;
    const icon = MODULE_ICONS[m.key] || Package;
    add({
      label: m.name,
      path: `/m/${m.key}`,
      module: m.key,
      icon,
      group: m.group || 'Admin',
      keywords: m.name.toLowerCase(),
    });
  }

  return GROUP_ORDER.filter((g) => groups.has(g) && groups.get(g)!.length > 0).map((g) => ({
    title: g,
    items: groups.get(g)!,
  }));
}

export function flattenNav(groups: NavGroup[]): NavItem[] {
  return groups.flatMap((g) => g.items);
}
