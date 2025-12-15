import { skipLinks } from '@/lib/accessibility'

export function SkipLinks() {
  return (
    <div className="sr-only focus-within:not-sr-only">
      <div className="fixed top-0 left-0 z-50 bg-primary text-primary-foreground p-2 rounded-br-md">
        {skipLinks.map((link) => (
          <a
            key={link.href}
            href={link.href}
            className="block p-2 underline hover:no-underline focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          >
            {link.label}
          </a>
        ))}
      </div>
    </div>
  )
}