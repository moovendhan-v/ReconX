import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Badge } from '@/components/ui/badge'
import { Loader2, Play, FileText, AlertTriangle } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import type { POC, ExecuteRequest, ExecuteResponse } from '@/types'

const executeFormSchema = z.object({
  targetUrl: z.string().url('Please enter a valid URL'),
  command: z.string().min(1, 'Command is required'),
  additionalParams: z.string().optional(),
})

type ExecuteFormData = z.infer<typeof executeFormSchema>

interface POCExecutionFormProps {
  poc: POC
  onExecute: (request: ExecuteRequest) => Promise<ExecuteResponse>
  isExecuting?: boolean
  className?: string
}

export function POCExecutionForm({ poc, onExecute, isExecuting = false, className }: POCExecutionFormProps) {
  const [executionResult, setExecutionResult] = useState<ExecuteResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  const form = useForm<ExecuteFormData>({
    resolver: zodResolver(executeFormSchema),
    defaultValues: {
      targetUrl: '',
      command: '',
      additionalParams: '',
    },
  })

  const handleExecute = async (data: ExecuteFormData) => {
    try {
      setError(null)
      setExecutionResult(null)

      const request: ExecuteRequest = {
        targetUrl: data.targetUrl,
        command: data.command,
        additionalParams: data.additionalParams ? JSON.parse(data.additionalParams) : undefined,
      }

      const result = await onExecute(request)
      setExecutionResult(result)
    } catch (err: any) {
      setError(err.message || 'Failed to execute POC')
    }
  }

  const getSeverityColor = (language: string) => {
    switch (language.toLowerCase()) {
      case 'python':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'bash':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'javascript':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'ruby':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                {poc.name}
              </CardTitle>
              <CardDescription>{poc.description}</CardDescription>
              <div className="flex items-center gap-2">
                <Badge className={getSeverityColor(poc.language)}>
                  {poc.language}
                </Badge>
                <Badge variant="outline">
                  CVE: {poc.cveId}
                </Badge>
                {poc.author && (
                  <Badge variant="secondary">
                    By: {poc.author}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Usage Examples */}
          {poc.usageExamples && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Usage Examples</h4>
              <div className="bg-muted p-3 rounded-md">
                <pre className="text-sm whitespace-pre-wrap">{poc.usageExamples}</pre>
              </div>
            </div>
          )}

          {/* Execution Form */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleExecute)} className="space-y-4">
              <FormField
                control={form.control}
                name="targetUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Target URL</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://example.com"
                        {...field}
                        disabled={isExecuting}
                      />
                    </FormControl>
                    <FormDescription>
                      The target URL to test the POC against
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="command"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Command</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="python3 script.py --target {TARGET_URL}"
                        {...field}
                        disabled={isExecuting}
                      />
                    </FormControl>
                    <FormDescription>
                      The command to execute the POC script. Use {'{TARGET_URL}'} as a placeholder.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="additionalParams"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Additional Parameters (JSON)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder='{"timeout": 30, "verbose": true}'
                        {...field}
                        disabled={isExecuting}
                        rows={3}
                      />
                    </FormControl>
                    <FormDescription>
                      Optional JSON object with additional parameters for the POC execution
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" disabled={isExecuting} className="w-full">
                {isExecuting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Executing POC...
                  </>
                ) : (
                  <>
                    <Play className="mr-2 h-4 w-4" />
                    Execute POC
                  </>
                )}
              </Button>
            </form>
          </Form>

          {/* Error Display */}
          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Execution Result */}
          {executionResult && (
            <div className="space-y-4">
              <h4 className="text-sm font-medium">Execution Result</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant={executionResult.result.success ? 'default' : 'destructive'}>
                    {executionResult.result.success ? 'Success' : 'Failed'}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    Executed at: {new Date(executionResult.log.executedAt).toLocaleString()}
                  </span>
                </div>
                
                <div className="bg-muted p-3 rounded-md">
                  <pre className="text-sm whitespace-pre-wrap font-mono">
                    {executionResult.result.output}
                  </pre>
                </div>

                {executionResult.result.error && (
                  <div className="bg-destructive/10 border border-destructive/20 p-3 rounded-md">
                    <h5 className="text-sm font-medium text-destructive mb-2">Error Details</h5>
                    <pre className="text-sm whitespace-pre-wrap font-mono text-destructive">
                      {executionResult.result.error}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}