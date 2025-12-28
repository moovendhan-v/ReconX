import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Loader2 } from 'lucide-react';
import { useStartQuickScan } from '@/hooks/use-scans-graphql';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

export function NewScanDialog() {
    const [open, setOpen] = useState(false);
    const [target, setTarget] = useState('');
    const { startQuickScan, loading } = useStartQuickScan();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!target.trim()) {
            toast.error('Please enter a target domain');
            return;
        }

        // Basic domain validation
        const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?\.[a-zA-Z]{2,}$/;
        if (!domainRegex.test(target.trim())) {
            toast.error('Please enter a valid domain (e.g., example.com)');
            return;
        }

        try {
            const scan = await startQuickScan(target.trim());
            toast.success(`Scan started for ${target}`);
            setOpen(false);
            setTarget('');

            // Navigate to scan details after a short delay
            setTimeout(() => {
                navigate(`/scans/${scan.id}`);
            }, 500);
        } catch (error) {
            toast.error(`Failed to start scan: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    New Scan
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Start Quick Scan</DialogTitle>
                        <DialogDescription>
                            Enter a target domain to scan for subdomains and open ports.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="target">
                                Target Domain <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="target"
                                type="text"
                                placeholder="example.com"
                                value={target}
                                onChange={(e) => setTarget(e.target.value)}
                                disabled={loading}
                                autoFocus
                            />
                            <p className="text-xs text-muted-foreground">
                                Domain name without http:// or www (e.g., google.com)
                            </p>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setOpen(false)}
                            disabled={loading}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading || !target.trim()}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Start Scan
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
