import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, FileCode, Play, Clock, CheckCircle, XCircle } from 'lucide-react';
import { cveService, pocService } from '../services/api.service';
import type { CVE, POC, ExecutionLog } from '../types';

const severityColors = {
  LOW: 'bg-blue-500/20 text-blue-400',
  MEDIUM: 'bg-yellow-500/20 text-yellow-400',
  HIGH: 'bg-orange-500/20 text-orange-400',
  CRITICAL: 'bg-red-500/20 text-red-400',
};

export default function CVEDetail() {
  const { id } = useParams<{ id: string }>();
  const [cve, setCve] = useState<CVE & { pocs: POC[] } | null>(null);
  const [selectedPoc, setSelectedPoc] = useState<POC & { executionLogs: ExecutionLog[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [executing, setExecuting] = useState(false);
  const [targetUrl, setTargetUrl] = useState('');
  const [command, setCommand] = useState('');

  useEffect(() => {
    if (id) {
      loadCVE();
    }
  }, [id]);

  const loadCVE = async () => {
    try {
      setLoading(true);
      const data = await cveService.getById(id!);
      setCve(data as any);
    } catch (error) {
      console.error('Failed to load CVE:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadPocDetails = async (pocId: string) => {
    try {
      const data = await pocService.getById(pocId);
      setSelectedPoc(data as any);
      
      // Set default command if available
      if (data.usageExamples) {
        const lines = data.usageExamples.split('\n');
        const cmdLine = lines.find(l => l.includes('-c'));
        if (cmdLine) {
          const match = cmdLine.match(/-c\s+"([^"]+)"/);
          if (match) setCommand(match[1]);
        }
      }
    } catch (error) {
      console.error('Failed to load POC:', error);
    }
  };

  const executePoc = async () => {
    if (!selectedPoc || !targetUrl) return;

    try {
      setExecuting(true);
      await pocService.execute(selectedPoc.id, { targetUrl, command });
      await loadPocDetails(selectedPoc.id); // Reload to get new logs
    } catch (error) {
      console.error('Execution failed:', error);
      alert('POC execution failed. Check console for details.');
    } finally {
      setExecuting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
          <p className="mt-4 text-slate-400">Loading CVE details...</p>
        </div>
      </div>
    );
  }

  if (!cve) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <p className="text-slate-400">CVE not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <header className="glass border-b border-slate-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link to="/" className="inline-flex items-center space-x-2 text-primary-400 hover:text-primary-300">
            <ArrowLeft className="w-5 h-5" />
            <span>Back to CVEs</span>
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* CVE Info */}
        <div className="glass rounded-xl p-8 mb-8">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">{cve.cveId}</h1>
              <h2 className="text-xl text-slate-300">{cve.title}</h2>
            </div>
            <span className={`px-4 py-2 rounded-lg text-sm font-bold ${severityColors[cve.severity]}`}>
              {cve.severity}
            </span>
          </div>
          <p className="text-slate-400 mb-4">{cve.description}</p>
          {cve.cvssScore && (
            <div className="text-sm text-slate-400">
              <strong>CVSS Score:</strong> {cve.cvssScore}
            </div>
          )}
        </div>

        {/* POCs */}
        <h3 className="text-2xl font-bold text-white mb-4">Available POCs</h3>
        <div className="grid md:grid-cols-2 gap-6">
          {cve.pocs.map((poc) => (
            <div
              key={poc.id}
              className={`glass rounded-xl p-6 cursor-pointer transition-all hover:scale-[1.02] border-2 ${
                selectedPoc?.id === poc.id ? 'border-primary-500' : 'border-transparent'
              }`}
              onClick={() => loadPocDetails(poc.id)}
            >
              <div className="flex items-start space-x-3">
                <FileCode className="w-6 h-6 text-primary-400 flex-shrink-0" />
                <div className="flex-1">
                  <h4 className="text-lg font-bold text-white mb-1">{poc.name}</h4>
                  <p className="text-slate-400 text-sm mb-2">{poc.description}</p>
                  <div className="flex items-center space-x-3 text-xs text-slate-500">
                    <span className="px-2 py-1 bg-slate-700/50 rounded">{poc.language}</span>
                    {poc.author && <span>by {poc.author}</span>}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* POC Execution */}
        {selectedPoc && (
          <div className="mt-8 glass rounded-xl p-8">
            <h3 className="text-xl font-bold text-white mb-4">Execute POC: {selectedPoc.name}</h3>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Target URL</label>
                <input
                  type="text"
                  value={targetUrl}
                  onChange={(e) => setTargetUrl(e.target.value)}
                  placeholder="http://localhost:3000"
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Command</label>
                <input
                  type="text"
                  value={command}
                  onChange={(e) => setCommand(e.target.value)}
                  placeholder="whoami"
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>

            <button
              onClick={executePoc}
              disabled={executing || !targetUrl}
              className="flex items-center space-x-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 disabled:bg-slate-700 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
            >
              <Play className="w-4 h-4" />
              <span>{executing ? 'Executing...' : 'Execute POC'}</span>
            </button>

            {/* Execution Logs */}
            {selectedPoc.executionLogs && selectedPoc.executionLogs.length > 0 && (
              <div className="mt-8">
                <h4 className="text-lg font-bold text-white mb-4">Execution History</h4>
                <div className="space-y-3">
                  {selectedPoc.executionLogs.map((log) => (
                    <div key={log.id} className="bg-slate-800/50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          {log.status === 'SUCCESS' ? (
                            <CheckCircle className="w-5 h-5 text-green-400" />
                          ) : (
                            <XCircle className="w-5 h-5 text-red-400" />
                          )}
                          <span className="text-slate-300 font-medium">{log.status}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-slate-500">
                          <Clock className="w-4 h-4" />
                          <span>{new Date(log.executedAt).toLocaleString()}</span>
                        </div>
                      </div>
                      {log.output && (
                        <pre className="text-sm text-slate-300 overflow-x-auto">{log.output}</pre>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
