#!/usr/bin/env python3
"""
Port Scanner
Multi-threaded port scanner with service detection
Outputs results as JSON lines to stdout for real-time processing
"""

import sys
import json
import socket
import threading
from datetime import datetime
from typing import List, Tuple
from queue import Queue
import argparse

# Common ports to scan (top 100 most common)
COMMON_PORTS = [
    20, 21, 22, 23, 25, 53, 80, 110, 111, 135, 139, 143, 443, 445, 993, 995,
    1723, 3306, 3389, 5900, 8080, 8443, 8888, 9090, 27017, 5432, 6379, 11211,
    1521, 2375, 2376, 2377, 3000, 3001, 3128

, 4444, 5000, 5001, 5432, 5672,
    5984, 6000, 6001, 6379, 7000, 7001, 7547, 8000, 8001, 8008, 8009, 8010,
    8081, 8082, 8089, 8090, 8091, 8100, 8161, 8200, 8300, 8400, 8500, 8600,
    8888, 9000, 9001, 9009, 9090, 9091, 9092, 9093, 9094, 9095, 9096, 9097,
    9100, 9200, 9300, 9999, 10000, 10001, 27015, 27016, 27017, 50070
]

# Service identification by port
PORT_SERVICES = {
    20: 'ftp-data', 21: 'ftp', 22: 'ssh', 23: 'telnet', 25: 'smtp', 53: 'dns',
    80: 'http', 110: 'pop3', 111: 'rpcbind', 135: 'msrpc', 139: 'netbios-ssn',
    143: 'imap', 443: 'https', 445: 'microsoft-ds', 993: 'imaps', 995: 'pop3s',
    1723: 'pptp', 3306: 'mysql', 3389: 'rdp', 5900: 'vnc', 8080: 'http-proxy',
    8443: 'https-alt', 8888: 'http-alt', 9090: 'http-admin', 27017: 'mongodb',
    5432: 'postgresql', 6379: 'redis', 11211: 'memcached', 1521: 'oracle',
    2375: 'docker', 2376: 'docker-tls', 2377: 'docker-swarm', 3000: 'node',
    5672: 'rabbitmq', 5984: 'couchdb', 9200: 'elasticsearch', 50070: 'hadoop'
}

NUM_THREADS = 50
scan_queue = Queue()
results_lock = threading.Lock()

def output_progress(percent: int):
    """Output progress update"""
    with results_lock:
        print(json.dumps({'type': 'progress', 'percent': percent}), flush=True)

def output_port(subdomain: str, port: int, state: str, service: str):
    """Output port scan result"""
    result = {
        'type': 'port',
        'subdomain': subdomain,
        'port': port,
        'service': service,
        'state': state,
        'discovered_at': datetime.now().isoformat()
    }
    with results_lock:
        print(json.dumps(result), flush=True)

def output_error(message: str):
    """Output error message"""
    with results_lock:
        print(json.dumps({'type': 'error', 'message': message}), flush=True, file=sys.stderr)

def scan_port(target: str, port: int, timeout: float = 1.0) -> Tuple[bool, str]:
    """
    Scan a single port
    
    Returns:
        (is_open, service_name)
    """
    try:
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.settimeout(timeout)
        result = sock.connect_ex((target, port))
        sock.close()
        
        if result == 0:
            service = PORT_SERVICES.get(port, f'unknown-{port}')
            return True, service
        return False, ''
    except socket.gaierror:
        # DNS resolution failed
        return False, ''
    except socket.error:
        # Connection error
        return False, ''
    except Exception:
        return False, ''

def worker(target: str, progress_callback):
    """Thread worker to scan ports from the queue"""
    while True:
        port = scan_queue.get()
        if port is None:
            break
        
        is_open, service = scan_port(target, port)
        if is_open:
            output_port(target, port, 'open', service)
        
        progress_callback()
        scan_queue.task_done()

def scan_ports(target: str, ports: List[int] = None):
    """
    Scan ports on the target host
    
    Args:
        target: Target hostname or IP
        ports: List of ports to scan (defaults to COMMON_PORTS)
    """
    if ports is None:
        ports = COMMON_PORTS
    
    total_ports = len(ports)
    scanned = [0]  # Mutable container for closure
    
    def update_progress():
        scanned[0] += 1
        if scanned[0] % 10 == 0 or scanned[0] == total_ports:
            progress = int((scanned[0] / total_ports) * 100)
            output_progress(progress)
    
    output_progress(0)
    
    # Add ports to queue
    for port in ports:
        scan_queue.put(port)
    
    # Start worker threads
    threads = []
    for _ in range(NUM_THREADS):
        t = threading.Thread(target=worker, args=(target, update_progress))
        t.start()
        threads.append(t)
    
    # Wait for all ports to be scanned
    scan_queue.join()
    
    # Stop workers
    for _ in range(NUM_THREADS):
        scan_queue.put(None)
    for t in threads:
        t.join()
    
    output_progress(100)

def main():
    parser = argparse.ArgumentParser(description='Port Scanner')
    parser.add_argument('target', help='Target hostname or IP to scan')
    parser.add_argument('--ports', help='Comma-separated list of ports to scan', default=None)
    args = parser.parse_args()
    
    target = args.target.strip()
    
    # Parse custom ports if provided
    ports = COMMON_PORTS
    if args.ports:
        try:
            ports = [int(p.strip()) for p in args.ports.split(',')]
        except ValueError:
            output_error("Invalid port list format")
            sys.exit(1)
    
    try:
        scan_ports(target, ports)
    except KeyboardInterrupt:
        output_error("Scan interrupted by user")
        sys.exit(1)
    except Exception as e:
        output_error(f"Scan failed: {str(e)}")
        sys.exit(1)

if __name__ == '__main__':
    main()
