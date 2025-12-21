import { useRef, useEffect } from 'react';
import { ExecutionLog } from '../hooks/use-execution-logs';

interface ExecutionTerminalProps {
    logs: ExecutionLog[];
    isExecuting: boolean;
    className?: string;
}

export function ExecutionTerminal({ logs, isExecuting, className = '' }: ExecutionTerminalProps) {
    const terminalRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom when new logs arrive
    useEffect(() => {
        if (terminalRef.current) {
            terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
        }
    }, [logs]);

    const getLogColor = (type: ExecutionLog['type']) => {
        switch (type) {
            case 'START':
                return 'text-blue-400';
            case 'STDOUT':
                return 'text-green-400';
            case 'STDERR':
                return 'text-yellow-400';
            case 'COMPLETE':
                return 'text-green-500 font-semibold';
            case 'ERROR':
                return 'text-red-500 font-semibold';
            default:
                return 'text-gray-300';
        }
    };

    const getLogPrefix = (type: ExecutionLog['type']) => {
        switch (type) {
            case 'START':
                return '[▶]';
            case 'STDOUT':
                return '[○]';
            case 'STDERR':
                return '[⚠]';
            case 'COMPLETE':
                return '[✓]';
            case 'ERROR':
                return '[✗]';
            default:
                return '[·]';
        }
    };

    return (
        <div
            className={`bg-gray-950 border border-gray-800 rounded-lg p-4 font-mono text-sm ${className}`}
        >
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-800">
                <div className="flex items-center gap-2">
                    <div className="flex gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                        <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    </div>
                    <span className="text-gray-400 ml-2">Execution Terminal</span>
                </div>
                {isExecuting && (
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-green-500 text-xs">Running...</span>
                    </div>
                )}
            </div>

            <div
                ref={terminalRef}
                className="h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900"
            >
                {logs.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                        <p className="text-gray-600">Waiting for execution to start...</p>
                    </div>
                ) : (
                    <div className="space-y-1">
                        {logs.map((log, index) => (
                            <div key={index} className={`${getLogColor(log.type)} flex gap-2`}>
                                <span className="select-none opacity-60">{getLogPrefix(log.type)}</span>
                                <span className="flex-1 whitespace-pre-wrap break-all">{log.message}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
