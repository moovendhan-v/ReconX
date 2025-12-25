#!/bin/bash

# Script to remove DashboardLayout import and wrapper from all page files

PAGES=(
  "Activity.tsx"
  "Analytics.tsx"
  "CVEDetail.tsx"
  "CVEList.tsx"
  "CVEListGraphQL.tsx"
  "CreatePOC.tsx"
  "DashboardGraphQL.tsx"
  "Help.tsx"
  "POCs.tsx"
  "Processes.tsx"
  "Projects.tsx"
  "QuickScan.tsx"
  "Reports.tsx"
  "Scans.tsx"
  "Settings.tsx"
  "Team.tsx"
)

PAGES_DIR="/Users/deamon/Desktop/Hack/ReconX/frontend/src/pages"

for page in "${PAGES[@]}"; do
  file="$PAGES_DIR/$page"
  
  if [ -f "$file" ]; then
    echo "Processing: $page"
    
    # Remove the DashboardLayout import line
    sed -i '' "/import.*DashboardLayout.*from.*dashboard-layout/d" "$file"
    
    echo "  - Removed DashboardLayout import"
  fi
done

echo "Done! All pages updated."
