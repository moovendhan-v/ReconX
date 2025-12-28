#!/usr/bin/env python3
"""
Test the CVE Engine - Load and display CVE definitions
"""

from cve_engine import CVELoader

def main():
    print("=" * 70)
    print("CVE Engine Test - Loading YAML Definitions")
    print("=" * 70)
    
    loader = CVELoader(cves_dir="./cves")
    cves = loader.load_all()
    
    print(f"\nTotal CVEs Loaded: {len(cves)}\n")
    
    for cve_id, cve_def in cves.items():
        print(f"📋 {cve_id}")
        print(f"   Name: {cve_def.name}")
        print(f"   Category: {cve_def.category}")
        print(f"   Severity: {cve_def.severity} (CVSS: {cve_def.cvss})")
        print(f"   Inputs: {len(cve_def.inputs)}")
        
        for inp in cve_def.inputs:
            required = "* " if inp.required else "  "
            print(f"     {required}{inp.name} ({inp.type.value})")
        
        print(f"   Injection: {cve_def.injection.method} across {len(cve_def.injection.locations)} locations")
        print(f"   Detection: {cve_def.detection.type}")
        print()

if __name__ == "__main__":
    main()
