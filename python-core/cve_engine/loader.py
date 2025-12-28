"""
YAML CVE Loader - Load and parse CVE definitions
"""

import yaml
from pathlib import Path
from typing import Dict, List
from .input_types import CVEDefinition, InputDefinition, InjectionConfig, DetectionConfig, ExecutionConfig


class CVELoader:
    """Load CVE definitions from YAML files"""
    
    def __init__(self, cves_dir: str = "./cves"):
        self.cves_dir = Path(cves_dir)
        self.loaded_cves: Dict[str, CVEDefinition] = {}
    
    def load_all(self) -> Dict[str, CVEDefinition]:
        """Load all YAML files from cves directory"""
        if not self.cves_dir.exists():
            raise FileNotFoundError(f"CVEs directory not found: {self.cves_dir}")
        
        yaml_files = list(self.cves_dir.glob("*.yaml")) + list(self.cves_dir.glob("*.yml"))
        
        for yaml_file in yaml_files:
            try:
                cve_def = self.load_single(yaml_file)
                self.loaded_cves[cve_def.cve_id] = cve_def
                print(f"✓ Loaded: {cve_def.cve_id} - {cve_def.name}")
            except Exception as e:
                print(f"✗ Failed to load {yaml_file.name}: {e}")
        
        return self.loaded_cves
    
    def load_single(self, yaml_file: Path) -> CVEDefinition:
        """Load single YAML file"""
        with open(yaml_file, 'r') as f:
            data = yaml.safe_load(f)
        
        # Parse with Pydantic
        cve_def = CVEDefinition(**data)
        return cve_def
    
    def get_cve(self, cve_id: str) -> CVEDefinition:
        """Get specific CVE by ID"""
        return self.loaded_cves.get(cve_id)
    
    def list_cves(self) -> List[Dict]:
        """List all CVEs with metadata"""
        return [
            {
                'cve_id': cve.cve_id,
                'name': cve.name,
                'category': cve.category,
                'severity': cve.severity,
                'cvss': cve.cvss,
                'inputs_count': len(cve.inputs),
                'has_auto_discover': any(
                    inp.type == 'AUTO_DISCOVER' for inp in cve.inputs
                )
            }
            for cve in self.loaded_cves.values()
        ]
