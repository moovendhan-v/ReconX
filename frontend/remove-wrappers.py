#!/usr/bin/env python3
"""
Script to remove DashboardLayout JSX wrappers from React component files.
This removes both <DashboardLayout ...> and </DashboardLayout>  tags but keeps the content inside.
"""

import re
import os

PAGES_DIR = "/Users/deamon/Desktop/Hack/ReconX/frontend/src/pages"

pages = [
    "Activity.tsx", "Analytics.tsx", "CVEDetail.tsx", "CVEList.tsx",
    "CVEListGraphQL.tsx", "CreatePOC.tsx", "DashboardGraphQL.tsx", 
    "Help.tsx", "POCs.tsx", "Processes.tsx", "Projects.tsx",
    "QuickScan.tsx", "Reports.tsx", "Scans.tsx", "Settings.tsx", "Team.tsx"
]

def remove_dashboard_layout_wrapper(content):
    """Remove DashboardLayout JSX tags while preserving indentation and content."""
    
    # Remove opening tags like <DashboardLayout title="..." description="...">
    content = re.sub(
        r'<DashboardLayout[^>]*>\s*\n',
        '',
        content
    )
    
    # Remove closing tags </DashboardLayout>
    content = re.sub(
        r'\s*</DashboardLayout>\s*\n',
        '',
        content
    )
    
    return content

for page in pages:
    file_path = os.path.join(PAGES_DIR, page)
    
    if os.path.exists(file_path):
        print(f"Processing: {page}")
        
        with open(file_path, 'r') as f:
            content = f.read()
        
        original_content = content
        content = remove_dashboard_layout_wrapper(content)
        
        if content != original_content:
            with open(file_path, 'w') as f:
                f.write(content)
            print(f"  ✓ Removed DashboardLayout wrapper")
        else:
            print(f"  - No changes needed")
    else:
        print(f"  ✗ File not found: {page}")

print("\nDone! All DashboardLayout wrappers removed.")
