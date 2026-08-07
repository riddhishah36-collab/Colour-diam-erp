export type FieldType =
  | 'text'
  | 'number'
  | 'date'
  | 'select'
  | 'multiselect'
  | 'textarea'
  | 'boolean'
  | 'email';

export interface Field {
  key: string;
  label: string;
  type: FieldType;
  options?: string[];
  required?: boolean;
  searchable?: boolean;
  placeholder?: string;
  readonly?: boolean;
  step?: string;
}

export interface ModuleMeta {
  key: string;
  name: string;
  icon: string;
  group: string;
  description: string;
  fields: Field[];
  count: number;
}

export interface Row {
  id: string;
  [key: string]: unknown;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  });
  if (!res.ok) {
    let detail = res.statusText;
    try {
      const body = await res.json();
      detail = body.error || body.message || detail;
    } catch {
      /* ignore */
    }
    throw new Error(`${res.status}: ${detail}`);
  }
  return res.json() as Promise<T>;
}

export const api = {
  meta: () => request<{ modules: ModuleMeta[] }>('/api/meta'),
  list: (mod: string, params: Record<string, string> = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request<{ module: string; total: number; rows: Row[] }>(
      `/api/${mod}${qs ? `?${qs}` : ''}`,
    );
  },
  get: (mod: string, id: string) => request<Row>(`/api/${mod}/${id}`),
  create: (mod: string, body: Record<string, unknown>) =>
    request<Row>(`/api/${mod}`, { method: 'POST', body: JSON.stringify(body) }),
  update: (mod: string, id: string, body: Record<string, unknown>) =>
    request<Row>(`/api/${mod}/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  remove: (mod: string, id: string) =>
    request<{ ok: boolean }>(`/api/${mod}/${id}`, { method: 'DELETE' }),
  reset: () =>
    request<{ ok: boolean; message: string; counts: Record<string, number> }>(
      '/api/system/reset',
      { method: 'POST' },
    ),
  dashboard: () =>
    request<DashboardData>('/api/dashboard/summary'),
  accountsReport: () => request<AccountsReport>('/api/reports/accounts'),
  notifications: () =>
    request<{ notifications: AppNotification[] }>('/api/notifications'),
  activity: () =>
    request<{ activity: ActivityItem[] }>('/api/activity'),
  csvUrl: (mod: string, q = '') =>
    `/api/${mod}/export/csv${q ? `?q=${encodeURIComponent(q)}` : ''}`,
};

export interface DashboardCounts {
  diamondsTotal: number;
  diamondsAvailable: number;
  products: number;
  stockValue: number;
  pipelineValue: number;
  memosOutstanding: number;
  memosValue: number;
  tasksOpen: number;
  tasksDone: number;
  expensesMonth: number;
  receivables: number;
  payables: number;
  messagesUnread: number;
  returnsOpen: number;
  customers: number;
  leads: number;
  leadsByStage: Record<string, number>;
  invoicesOpen: number;
  invoicesValue: number;
  invoicesTotal: number;
  paymentsMonth: number;
  quotationsOpen: number;
}

export interface AppNotification {
  kind: string;
  severity: string;
  text: string;
  meta: string;
  date: string;
}

export interface ActivityItem {
  kind: string;
  text: string;
  date: string;
  meta: string;
}

export interface DashboardData {
  counts: DashboardCounts;
  recentDiamonds: Array<{
    id: string;
    stockNo: string;
    shape: string;
    carat: number;
    color: string;
    clarity: string;
    lab: string;
    intensity: string;
    modifier: string;
    price: number;
    status: string;
  }>;
  recentTasks: Array<{
    id: string;
    title: string;
    assignee: string;
    priority: string;
    status: string;
    dueDate: string;
  }>;
  recentLeads: Array<{
    id: string;
    name: string;
    company: string;
    stage: string;
    value: number;
    priority: string;
    owner: string;
    expectedClose: string;
    lastContact: string;
  }>;
  recentActivity: Array<{ kind: string; text: string; date: string; meta: string }>;
  accountAging: { current: number; d30: number; d60: number; d90: number };
}

export interface AccountsReport {
  generatedAt: string;
  summary: {
    totalReceivables: number;
    openReceivables: number;
    totalPayables: number;
    openPayables: number;
    receiptsTotal: number;
    paymentsTotal: number;
    netPosition: number;
    expensesTotal: number;
  };
  aging: { current: number; d30: number; d60: number; d90: number };
  byParty: Array<{ party: string; receivables: number; payables: number; open: number; openCount: number }>;
  cashflowSeries: Array<{ month: string; in: number; out: number; net: number }>;
  expenseByCategory: Record<string, number>;
}
