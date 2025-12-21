import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Loader2, Save, FileText, AlertTriangle } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { graphqlPocService } from '@/services/graphql/poc.service'
import { useNavigate } from 'react-router-dom'

const createPocSchema = z.object({
    name: z.string().min(3, 'Name must be at least 3 characters'),
    description: z.string().min(10, 'Description must be at least 10 characters'),
    language: z.string().min(1, 'Language is required'),
    scriptPath: z.string().min(1, 'Script path is required'),
    cveId: z.string().min(1, 'CVE ID is required'),
    author: z.string().optional(),
    usageExamples: z.string().optional(),
})

type CreatePocFormData = z.infer<typeof createPocSchema>

export function POCCreationForm() {
    const navigate = useNavigate()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const form = useForm<CreatePocFormData>({
        resolver: zodResolver(createPocSchema),
        defaultValues: {
            name: '',
            description: '',
            language: '',
            scriptPath: '',
            cveId: '',
            author: '',
            usageExamples: '',
        },
    })

    const onSubmit = async (data: CreatePocFormData) => {
        try {
            setIsSubmitting(true)
            setError(null)

            await graphqlPocService.create({
                name: data.name,
                description: data.description,
                language: data.language,
                scriptPath: data.scriptPath,
                cveId: data.cveId,
                author: data.author,
                usageExamples: data.usageExamples
            })

            navigate('/dashboard/pocs')
        } catch (err: any) {
            setError(err.message || 'Failed to create POC')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Create New POC
                </CardTitle>
                <CardDescription>
                    Register a new Proof of Concept script in the system
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g. Exploiting CVE-2024-1234" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="cveId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>CVE ID</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g. CVE-2024-1234" {...field} />
                                        </FormControl>
                                        <FormDescription>
                                            The CVE ID this POC targets
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Description</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Describe what this POC does..."
                                            className="resize-none"
                                            rows={3}
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="language"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Language</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select language" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="python">Python</SelectItem>
                                                <SelectItem value="bash">Bash</SelectItem>
                                                <SelectItem value="javascript">JavaScript</SelectItem>
                                                <SelectItem value="ruby">Ruby</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="scriptPath"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Script Path</FormLabel>
                                        <FormControl>
                                            <Input placeholder="/app/exploits/..." {...field} />
                                        </FormControl>
                                        <FormDescription>
                                            Absolute path to the script on the server
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="usageExamples"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Usage Examples</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="python exploit.py -t <target>"
                                            className="font-mono text-sm"
                                            rows={3}
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="author"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Author (Optional)</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Your Name" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {error && (
                            <Alert variant="destructive">
                                <AlertTriangle className="h-4 w-4" />
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}

                        <div className="flex justify-end gap-4">
                            <Button type="button" variant="outline" onClick={() => navigate('/dashboard/pocs')}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Creating...
                                    </>
                                ) : (
                                    <>
                                        <Save className="mr-2 h-4 w-4" />
                                        Create POC
                                    </>
                                )}
                            </Button>
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
    )
}
