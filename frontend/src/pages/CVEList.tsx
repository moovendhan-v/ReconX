import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, Shield, Plus, AlertTriangle } from 'lucide-react';
import { cveService } from '../services/api.service';
import type { CVE } from '../types';

const severityColors = {
  LOW: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  MEDIUM: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  HIGH: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  CRITICAL: 'bg-red-500/20 text-red-400 border-red-500/30',
};

export default function CVEList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [cves, setCves] = useState<CVE[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get('search') || '');

  useEffect(() => {
    loadCVEs();
  }, [searchParams]);

  const loadCVEs = async () => {
    try {
      setLoading(true);
      const data = await cveService.getAll({
        search: searchParams.get('search') || undefined,
        page: 1,
        limit: 50,
      });
      setCves(data.cves);
    } catch (error) {
      console.error('Failed to load CVEs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search) {
      setSearchParams({ search });
    } else {
      setSearchParams({});
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="glass border-b border-slate-700/50 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Shield className="w-8 h-8 text-primary-400" />
              <h1 className="text-2xl font-bold gradient-text">Bug Hunting Platform</h1>
            </div>
            <Link
              to="/cves/new"
              className="flex items-center space-x-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add CVE</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search */}
        <form onSubmit={handleSearch} className="mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search CVEs by ID, title, or description..."
              className="w-full pl-12 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </form>

        {/* CVE List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
            <p className="mt-4 text-slate-400">Loading CVEs...</p>
          </div>
        ) : cves.length === 0 ? (
          <div className="text-center py-12 glass rounded-xl">
            <AlertTriangle className="w-16 h-16 text-slate-500 mx-auto mb-4" />
            <p className="text-slate-400 text-lg">No CVEs found</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {cves.map((cve) => (
              <Link
                key={cve.id}
                to={`/cves/${cve.id}`}
                className="glass rounded-xl p-6 hover:bg-slate-800/60 transition-all hover:scale-[1.01] border border-slate-700/50"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-xl font-bold text-white">{cve.cveId}</h3>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                          severityColors[cve.severity]
                        }`}
                      >
                        {cve.severity}
                      </span>
                      {cve.cvssScore && (
                        <span className="px-2 py-1 bg-slate-700/50 rounded text-xs text-slate-300">
                          CVSS: {cve.cvssScore}
                        </span>
                      )}
                    </div>
                    <h4 className="text-lg text-slate-300 mb-2">{cve.title}</h4>
                    <p className="text-slate-400 line-clamp-2">{cve.description}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
