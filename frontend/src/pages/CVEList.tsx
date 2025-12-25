import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, AlertTriangle, ExternalLink, Calendar, Shield } from 'lucide-react';
import { DashboardShell } from '@/components/dashboard/dashboard-shell';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EnhancedTable } from '@/components/dashboard/enhanced-table/enhanced-table';
import type { ColumnDef } from '@/components/dashboard/enhanced-table/table-column-customizer';
import { useCVEs } from '../hooks/use-cve-graphql';
import type { CVE } from '@/services/graphql/cve.service';
import { ErrorBoundary } from '../components/error-boundary';
import { ComponentErrorFallback } from '../components/error-fallback';

const severityColors = {
  LOW: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  MEDIUM: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  HIGH: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  CRITICAL: 'bg-red-500/20 text-red-400 border-red-500/30',
};

export default function CVEList() {
  const navigate = useNavigate();

  // Use GraphQL hook for CVEs
  const { data, loading, error, refetch } = useCVEs({
    page: 1,
    limit: 1000,
  });

  useEffect(() => {
    // Refetch on mount to ensure fresh data
    refetch();
  }, [refetch]);

  const cves = data?.cves?.cves || [];
  const totalCount = data?.cves?.total || 0;

  // Define table columns
  const columns: ColumnDef[] = [
    {
      id: 'cveId',
      header: 'CVE ID',
      accessorKey: 'cveId',
      enableSorting: true,
      cell: ({ row }) => (
        <div className="font-mono font-medium">
          {row.cveId}
        </div>
      ),
    },
    {
      id: 'title',
      header: 'Title',
      accessorKey: 'title',
      enableSorting: true,
      cell: ({ row }) => (
        <div className="max-w-[300px]">
          <div className="font-medium truncate">{row.title}</div>
          <div className="text-sm text-muted-foreground line-clamp-2 mt-1">
            {row.description}
          </div>
        </div>
      ),
    },
    {
      id: 'severity',
      header: 'Severity',
      accessorKey: 'severity',
      enableSorting: true,
      cell: ({ row }) => (
        <Badge className={severityColors[row.severity as keyof typeof severityColors]}>
          <Shield className="w-3 h-3 mr-1" />
          {row.severity}
        </Badge>
      ),
    },
    {
      id: 'cvssScore',
      header: 'CVSS Score',
      accessorKey: 'cvssScore',
      enableSorting: true,
      cell: ({ row }) => (
        row.cvssScore ? (
          <Badge variant="secondary">
            {row.cvssScore}
          </Badge>
        ) : (
          <span className="text-muted-foreground">N/A</span>
        )
      ),
    },
    {
      id: 'publishedDate',
      header: 'Published',
      accessorKey: 'publishedDate',
      enableSorting: true,
      cell: ({ row }) => (
        row.publishedDate ? (
          <div className="flex items-center text-sm">
            <Calendar className="w-3 h-3 mr-1" />
            {new Date(row.publishedDate).toLocaleDateString()}
          </div>
        ) : (
          <span className="text-muted-foreground">Unknown</span>
        )
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      enableSorting: false,
      enableHiding: false,
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/dashboard/cves/${row.id}`);
          }}
        >
          <ExternalLink className="w-4 h-4 mr-1" />
          View
        </Button>
      ),
    },
  ];

  // Define filter options
  const filterOptions = [
    {
      id: 'severity',
      label: 'Severity',
      type: 'select' as const,
      options: [
        { value: 'LOW', label: 'Low' },
        { value: 'MEDIUM', label: 'Medium' },
        { value: 'HIGH', label: 'High' },
        { value: 'CRITICAL', label: 'Critical' },
      ],
    },
    {
      id: 'publishedDate',
      label: 'Published Date',
      type: 'date' as const,
    },
  ];

  const handleRowClick = (cve: CVE) => {
    navigate(`/dashboard/cves/${cve.id}`);
  };

  const handleExport = (data: CVE[]) => {
    const csvContent = [
      ['CVE ID', 'Title', 'Severity', 'CVSS Score', 'Published Date', 'Description'].join(','),
      ...data.map(cve => [
        cve.cveId,
        `"${cve.title.replace(/"/g, '""')}"`,
        cve.severity,
        cve.cvssScore || 'N/A',
        cve.publishedDate || 'Unknown',
        `"${cve.description.replace(/"/g, '""')}"`,
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cves-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (error) {
    return (
      <ErrorBoundary fallback={<ComponentErrorFallback />}>
        <DashboardShell>
          <div className="flex flex-col items-center justify-center text-destructive py-12">
            <AlertTriangle className="w-16 h-16 mb-4" />
            <p className="text-lg font-medium">Error loading CVEs</p>
            <p className="text-sm text-muted-foreground">{error.message}</p>
            <Button onClick={() => refetch()} className="mt-4">
              Retry
            </Button>
          </div>
        </DashboardShell>      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary fallback={<ComponentErrorFallback />}>
      <DashboardShell>
        {/* Header Actions */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">CVE Database</h2>
            <p className="text-muted-foreground">
              Browse and manage {totalCount} Common Vulnerabilities and Exposures
            </p>
          </div>
          <Button asChild>
            <Link to="/dashboard/cves/new">
              <Plus className="mr-2 h-4 w-4" />
              Add CVE
            </Link>
          </Button>
        </div>

        {/* Enhanced CVE Table */}
        <EnhancedTable
          data={cves}
          columns={columns}
          filterOptions={filterOptions}
          tableId="cve-list"
          defaultPageSize={20}
          defaultSortColumn="publishedDate"
          defaultSortDirection="desc"
          onRowClick={handleRowClick}
          isLoading={loading}
          showExport={true}
          exportData={handleExport}
          emptyState={
            <div className="flex flex-col items-center justify-center text-muted-foreground py-12">
              <AlertTriangle className="w-16 h-16 mb-4" />
              <p className="text-lg font-medium">No CVEs found</p>
              <p className="text-sm">Try adjusting your search or filters</p>
            </div>
          }
        />
      </DashboardShell>    </ErrorBoundary>
  );
}
