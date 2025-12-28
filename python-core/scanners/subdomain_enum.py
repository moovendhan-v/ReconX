#!/usr/bin/env python3
"""
Subdomain Enumeration Scanner
Discovers subdomains for a target domain using DNS queries
Outputs results as JSON lines to stdout for real-time processing
"""

import sys
import json
import dns.resolver
import socket
from datetime import datetime
from typing import List, Dict
import argparse

# Common subdomain wordlist (top 100)
COMMON_SUBDOMAINS = [
    'www', 'mail', 'ftp', 'localhost', 'webmail', 'smtp', 'pop', 'ns1', 'webdisk',
    'ns2', 'cpanel', 'whm', 'autodiscover', 'autoconfig', 'mx', 'email', 'api',
    'dev', 'staging', 'test', 'portal', 'admin', 'beta', 'assets', 'cdn', 'img',
    'images', 'static', 'blog', 'shop', 'store', 'mobile', 'm', 'app', 'apps',
    'support', 'help', 'docs', 'documentation', 'wiki', 'vpn', 'remote', 'git',
    'gitlab', 'github', 'jenkins', 'ci', 'cd', 'dashboard', 'analytics', 'monitoring',
    'status', 'forum', 'forums', 'community', 'chat', 'imap', 'pop3', 'secure',
    'ssl', 'cpcontacts', 'cpcalendars', 'intranet', 'internal', 'private', 'public',
    'web', 'demo', 'sandbox', 'preview', 'old', 'new', 'backup', 'db', 'database',
    'mysql', 'postgres', 'redis', 'cache', 'video', 'videos', 'download', 'downloads',
    'files', 'upload', 'uploads', 'media', 'news', 'press', 'careers', 'jobs',
    'crm', 'erp', 'sso', 'auth', 'login', 'oauth', 'account', 'accounts'
]

def output_progress(percent: int):
    """Output progress update"""
    print(json.dumps({'type': 'progress', 'percent': percent}), flush=True)

def output_subdomain(subdomain: str, ip_addresses: List[str]):
    """Output subdomain discovery result"""
    result = {
        'type': 'subdomain',
        'subdomain': subdomain,
        'ip': ip_addresses,
        'discovered_at': datetime.now().isoformat()
    }
    print(json.dumps(result), flush=True)

def output_error(message: str):
    """Output error message"""
    print(json.dumps({'type': 'error', 'message': message}), flush=True, file=sys.stderr)

def resolve_subdomain(subdomain: str) -> List[str]:
    """Resolve subdomain to IP addresses"""
    try:
        answers = dns.resolver.resolve(subdomain, 'A')
        return [str(rdata) for rdata in answers]
    except (dns.resolver.NXDOMAIN, dns.resolver.NoAnswer, dns.resolver.NoNameservers):
        return []
    except Exception as e:
        # Silently skip resolution errors
        return []

def enumerate_subdomains(domain: str):
    """
    Enumerate subdomains for the given domain
    
    Args:
        domain: Target domain (e.g., example.com)
    """
    discovered = []
    total = len(COMMON_SUBDOMAINS)
    
    output_progress(0)
    
    for i, prefix in enumerate(COMMON_SUBDOMAINS):
        subdomain = f"{prefix}.{domain}"
        
        ip_addresses = resolve_subdomain(subdomain)
        if ip_addresses:
            discovered.append(subdomain)
            output_subdomain(subdomain, ip_addresses)
        
        # Update progress every 10 subdomains
        if i % 10 == 0 or i == total - 1:
            progress = int((i + 1) / total * 100)
            output_progress(progress)
    
    # Also check the root domain
    root_ips = resolve_subdomain(domain)
    if root_ips and domain not in discovered:
        output_subdomain(domain, root_ips)
    
    output_progress(100)

def main():
    parser = argparse.ArgumentParser(description='Subdomain Enumeration Scanner')
    parser.add_argument('domain', help='Target domain to scan (e.g., example.com)')
    args = parser.parse_args()
    
    domain = args.domain.strip()
    
    # Validate domain
    if not domain or '/' in domain or ' ' in domain:
        output_error(f"Invalid domain: {domain}")
        sys.exit(1)
    
    try:
        enumerate_subdomains(domain)
    except KeyboardInterrupt:
        output_error("Scan interrupted by user")
        sys.exit(1)
    except Exception as e:
        output_error(f"Scan failed: {str(e)}")
        sys.exit(1)

if __name__ == '__main__':
    main()
