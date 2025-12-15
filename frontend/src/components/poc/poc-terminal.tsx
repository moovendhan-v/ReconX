import { useState, useEffect, useRef, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Terminal, 
  Download, 
  Trash2, 
  Maximize2, 
  Minimize2,
  Palette,
  Monitor,
  Copy,
  CheckCircle
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ExecutionLog } from '@/types'

interface POCTerminalProps {
  logs: ExecutionLog[]
  isExecuting?: boolean
  onClear?: () => void
  onDownload?: () => void
  className?: string
  title?: string
}

interface TerminalTheme {
  bg: string
  text: string
  accent: string
  border: string
  success: string
  error: string
  warning: string
}

const themes: Record<string, TerminalTheme> = {
  dark: {
    bg: '#1e1e1e',
    text: '#d4d4d4',
    accent: '#007acc',
    border: '#3e3e3e',
    success: '#4ade80',
    error: '#ef4444',
    warning: '#f59e0b',
  },
  monokai: {
    bg: '#272822',
    text: '#f8f8f2',
    accent: '#a6e22e',
    border: '#49483e',
    success: '#a6e22e',
    error: '#f92672',
    warning: '#fd971f',
  },
  solarized: {
    bg: '#002b36',
    text: '#839496',
    accent: '#268bd2',
    border: '#073642',
    success: '#859900',
    error: '#dc322f',
    warning: '#b58900',
  },
}

export function POCTerminal({ 
  logs, 
  isExecuting = false, 
  onClear, 
  onDownload, 
  className, 
  title = 'POC Execution Terminal' 
}: POCTerminalProps) {
  const [theme, setTheme] = useState<keyof typeof themes>('dark')
  const [fontSize, setFontSize] = useState(14)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)
  
  const terminalRef = useRef<HTMLDivElement>(null)
  const currentTheme = themes[theme]

  // Auto-scroll to bottom when new logs are added
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight
    }
  }, [logs])

  const handleCopyOutput = useCallback(async (output: string, index: number) => {
    try {
      await navigator.clipboard.writeText(output)
      setCopiedIndex(index)
      setTimeout(() => setCopiedIndex(null), 2000)
    } catch (err) {
      console.error('Failed to copy to clipboard:', err)
    }
  }, [])

  const handleDownloadLogs = useCallback(() => {
    if (onDownload) {
      onDownload()
    } else {
      // Default download implementation
      const logText = logs.map(log => {
        const timestamp = new Date(log.executedAt).toLocaleString()
        const status = log.status
        const command = log.command || 'N/A'
        const output = log.output || 'No output'
        
        return `[${timestamp}] Status: ${status}
Command: ${command}
Target: ${log.targetUrl || 'N/A'}
Output:
${output}
${'='.repeat(80)}`
      }).join('\n\n')

      const blob = new Blob([logText], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `poc-execution-logs-${Date.now()}.txt`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }
  }, [logs, onDownload])

  const getStatusColor = (status: ExecutionLog['status']) => {
    switch (status) {
      case 'SUCCESS':
        return currentTheme.success
      case 'FAILED':
        return currentTheme.error
      case 'TIMEOUT':
        return currentTheme.warning
      case 'RUNNING':
        return currentTheme.accent
      default:
        return currentTheme.text
    }
  }

  const getStatusBadgeVariant = (status: ExecutionLog['status']) => {
    switch (status) {
      case 'SUCCESS':
        return 'default'
      case 'FAILED':
        return 'destructive'
      case 'TIMEOUT':
        return 'secondary'
      case 'RUNNING':
        return 'outline'
      default:
        return 'secondary'
    }
  }

  return (
    <div className={cn(isFullscreen && 'fixed inset-0 z-50 bg-black/80 backdrop-blur-sm', className)}>
      <Card 
        className={cn(
          'flex flex-col',
          isFullscreen && 'h-full w-full rounded-none border-0'
        )}
        style={{
          backgroundColor: currentTheme.bg,
          borderColor: currentTheme.border,
        }}
      >
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Terminal className="h-5 w-5" style={{ color: currentTheme.accent }} />
              <CardTitle style={{ color: currentTheme.text }}>{title}</CardTitle>
              {isExecuting && (
                <Badge variant="outline" className="animate-pulse">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                  Executing
                </Badge>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              {/* Theme Selector */}
              <div className="flex items-center gap-2">
                <Palette className="h-4 w-4" style={{ color: currentTheme.text }} />
                <Select value={theme} onValueChange={(value: keyof typeof themes) => setTheme(value)}>
                  <SelectTrigger className="w-24 h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="monokai">Monokai</SelectItem>
                    <SelectItem value="solarized">Solarized</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Font Size */}
              <div className="flex items-center gap-2">
                <Monitor className="h-4 w-4" style={{ color: currentTheme.text }} />
                <input
                  type="range"
                  min="12"
                  max="20"
                  value={fontSize}
                  onChange={(e) => setFontSize(Number(e.target.value))}
                  className="w-16"
                />
                <span className="text-xs w-8" style={{ color: currentTheme.text }}>
                  {fontSize}px
                </span>
              </div>

              {/* Actions */}
              <Button variant="ghost" size="sm" onClick={handleDownloadLogs}>
                <Download className="h-4 w-4" />
              </Button>
              
              {onClear && (
                <Button variant="ghost" size="sm" onClick={onClear}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
              
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setIsFullscreen(!isFullscreen)}
              >
                {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex-1 p-0">
          <div
            ref={terminalRef}
            className="h-96 overflow-y-auto p-4 font-mono leading-relaxed"
            style={{
              backgroundColor: currentTheme.bg,
              color: currentTheme.text,
              fontSize: `${fontSize}px`,
              maxHeight: isFullscreen ? 'calc(100vh - 120px)' : '400px',
            }}
          >
            {logs.length === 0 ? (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                <div className="text-center">
                  <Terminal className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No execution logs yet</p>
                  <p className="text-sm">Execute a POC to see output here</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {logs.map((log, index) => (
                  <div key={log.id} className="border-b pb-4 last:border-b-0" style={{ borderColor: currentTheme.border }}>
                    {/* Log Header */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Badge variant={getStatusBadgeVariant(log.status)}>
                          {log.status}
                        </Badge>
                        <span className="text-sm" style={{ color: currentTheme.text }}>
                          {new Date(log.executedAt).toLocaleString()}
                        </span>
                      </div>
                      
                      {log.output && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCopyOutput(log.output || '', index)}
                          className="h-6 w-6 p-0"
                        >
                          {copiedIndex === index ? (
                            <CheckCircle className="h-3 w-3 text-green-500" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </Button>
                      )}
                    </div>

                    {/* Command and Target */}
                    {log.command && (
                      <div className="mb-2">
                        <span style={{ color: currentTheme.accent }}>$ </span>
                        <span className="break-all">{log.command}</span>
                      </div>
                    )}
                    
                    {log.targetUrl && (
                      <div className="mb-2 text-sm" style={{ color: currentTheme.text }}>
                        Target: <span className="break-all">{log.targetUrl}</span>
                      </div>
                    )}

                    {/* Output */}
                    {log.output && (
                      <div 
                        className="whitespace-pre-wrap break-words p-2 rounded border"
                        style={{ 
                          backgroundColor: `${currentTheme.border}20`,
                          borderColor: currentTheme.border,
                          color: getStatusColor(log.status)
                        }}
                      >
                        {log.output}
                      </div>
                    )}
                  </div>
                ))}

                {/* Live execution indicator */}
                {isExecuting && (
                  <div className="flex items-center gap-2 animate-pulse">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    <span style={{ color: currentTheme.accent }}>Executing...</span>
                    <div className="w-2 h-5 ml-1 animate-pulse" style={{ backgroundColor: currentTheme.accent }} />
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}