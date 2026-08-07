import { useEffect, useState } from 'react';
import { api, type AccountsReport } from '../api';
import { toast } from '../components/ui';
import AccountsReportView from './AccountsReportView';

export default function ReportsPage() {
  const [report, setReport] = useState<AccountsReport | null>(null);

  useEffect(() => {
    api
      .accountsReport()
      .then(setReport)
      .catch(() => toast.err('Failed to load financial report'));
  }, []);

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Financial Report</h1>
          <p>Consolidated accounts report — receivables, payables, aging, cash flow and expenses by category.</p>
        </div>
      </div>
      <AccountsReportView report={report} />
    </>
  );
}
