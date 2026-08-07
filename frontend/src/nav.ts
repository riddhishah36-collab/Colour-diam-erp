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

const STATIC_PAGES: NavItem[] = [
  { label: 'Dashboard', path: '/', icon: LayoutDashboard, group: 'Overview', keywords: 'home overview kpi stats' },
  { label: 'Financial Report', path: '/reports', icon: BarChart3, group: 'Finance', keywords: 'accounts report aging cashflow receivable payable' },
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
};

const GROUP_ORDER = ['Overview', 'Inventory', 'Sales', 'Finance', 'Operations', 'Admin'];

export function buildNav(modules: Array<{ key: string; name: string; icon: string; group: string }>): NavGroup[] {
  const groups = new Map<string, NavItem[]>();

  const add = (item: NavItem) => {
    const list = groups.get(item.group) || [];
    list.push(item);
    groups.set(item.group, list);
  };

  STATIC_PAGES.forEach(add);

  for (const m of modules) {
    const icon = MODULE_ICONS[m.key] || Package;
    add({
      label: m.name,
      path: m.key === 'diamonds' ? '/diamonds' : m.key === 'accounts' ? '/accounts' : `/m/${m.key}`,
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
