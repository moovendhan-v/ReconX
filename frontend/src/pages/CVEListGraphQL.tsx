import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, AlertTriangle, ExternalLink, Calendar, Shield, Search, Filter } from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import { DashboardShell } from '@/components/dashboard/dashboard-shell';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCVEs, useSearchCVEs } from '@/hooks/use-cve-graphql';
import { CVEFilters } from '@/services/graphql/cve.service';
import { ErrorBoundary } from '@/components/error-boundary';
import { ComponentErrorFallback } from '@/components/error-fallback';

const severityColors = {
  LOW: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  MEDIUM: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  HIGH: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  CRITICAL: 'bg-red-500/20 text-red-400 border-red-500/30',
};

export default function CVEListGraphQL() {
  const navigate = useNavigate();
  const { searchCVEs } = useSearchCVEs();

  const [filters, setFilters] = useState<CVEFilters>({
    page: 1,
    limit: 20,
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  const { data, loading, error, refetch } = useCVEs(filters);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      const results = await searchCVEs(query);
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  };

  const handleFilterChange = (key: keyof CVEFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1, // Reset to first page when filters change
    }));
  };

  const handleRowClick = (cve: any) => {
    navigate(`/dashboard/cves/${cve.id}`);
  };

  const cves = searchQuery ? searchResults : data?.cves?.cves || [];
  const totalCount = data?.cves?.total || 0;

  if (error) {
    return (
      <DashboardLayout title="CVEs" description="Manage and browse Common Vulnerabilities and Exposures">
        <DashboardShell>
          <Card>
            <CardContent className="flex items-center justify-center py-8">
              <div className="text-center">
                <AlertTriangle className="h-8 w-8 text-destructive mx-auto mb-2" />
                <p className="text-muted-foreground">Failed to load CVE data</p>
                <p className="text-sm text-muted-foreground mb-4">{error.message}</p>
                <Button onClick={() => refetch()} variant="outline">
                  Retry
                </Button>
              </div>
            </CardContent>
          </Card>
        </DashboardShell>
      </DashboardLayout>
    );
  }

  return (
    <ErrorBoundary fallback={<ComponentErrorFallback />}>
      <DashboardLayout title="CVEs" description="Manage and browse Common Vulnerabilities and Exposures with GraphQL">
        <DashboardShell>
          {/* Header Actions */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">CVE Database (GraphQL)</h2>
              <p className="text-muted-foreground">
                Browse and manage {totalCount} Common Vulnerabilities and Exposures
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                GraphQL API
              </Badge>
              <Button asChild>
                <Link to="/dashboard/cves/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Add CVE
                </Link>
              </Button>
            </div>
          </div>

          {/* Search and Filters */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Search & Filter
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-4">
                <div className="md:col-span-2">
                  <Input
                    placeholder="Search CVEs..."
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="w-full"
                  />
                </div>
                <Select
                  value={filters.severity || 'all'}
                  onValueChange={(value) => 
                    handleFilterChange('severity', value === 'all' ? undefined : value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Severity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Severities</SelectItem>
                    <SelectItem value="CRITICAL">Critical</SelectItem>
                    <SelectItem value="HIGH">High</SelectItem>
                    <SelectItem value="MEDIUM">Medium</SelectItem>
                    <SelectItem value="LOW">Low</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  onClick={() => {
                    setFilters({ page: 1, limit: 20 });
                    setSearchQuery('');
                    setSearchResults([]);
                  }}
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Clear
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* CVE List */}
          <Card>
            <CardHeader>
              <CardTitle>CVE List</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-muted rounded w-1/2"></div>
                    </div>
                  ))}
                </div>
              ) : cves.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-muted-foreground py-12">
                  <AlertTriangle className="w-16 h-16 mb-4" />
                  <p className="text-lg font-medium">No CVEs found</p>
                  <p className="text-sm">Try adjusting your search or filters</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {cves.map((cve: any) => (
                    <div
                      key={cve.id}
                      className="p-4 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => handleRowClick(cve)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-mono font-medium">{cve.cveId}</h3>
                            <Badge className={severityColors[cve.severity as keyof typeof severityColors]}>
                              <Shield className="w-3 h-3 mr-1" />
                              {cve.severity}
                            </Badge>
                            {cve.cvssScore && (
                              <Badge variant="secondary">
                                CVSS: {cve.cvssScore}
                              </Badge>
                            )}
                          </div>
                          <h4 className="font-medium mb-1">{cve.title}</h4>
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                            {cve.description}
                          </p>
                          {cve.publishedDate && (
                            <div className="flex items-center text-xs text-muted-foreground">
                              <Calendar className="w-3 h-3 mr-1" />
                              Published: {new Date(cve.publishedDate).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/dashboard/cves/${cve.id}`);
                          }}
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Pagination */}
          {!searchQuery && data?.cves && (
            <div className="flex items-center justify-between mt-6">
              <p className="text-sm text-muted-foreground">
                Showing {((filters.page || 1) - 1) * (filters.limit || 20) + 1} to{' '}
                {Math.min((filters.page || 1) * (filters.limit || 20), totalCount)} of{' '}
                {totalCount} CVEs
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={(filters.page || 1) <= 1}
                  onClick={() => handleFilterChange('page', (filters.page || 1) - 1)}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={(filters.page || 1) >= (data.cves.totalPages || 1)}
                  onClick={() => handleFilterChange('page', (filters.page || 1) + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </DashboardShell>
      </DashboardLayout>
    </ErrorBoundary>
  );
}