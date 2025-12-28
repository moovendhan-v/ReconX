"""
Generic CVE Executor - Dynamic execution engine
"""

import requests
import time
import re
from typing import Dict, List, Any, Optional
from urllib.parse import urljoin, urlparse
from .input_types import CVEDefinition, InputType
from .discovery import ParameterDiscovery


class CVEExecutor:
    """Generic CVE execution engine"""
    
    def __init__(self, cve_def: CVEDefinition):
        self.cve = cve_def
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (compatible; ReconX/2.0)'
        })
        self.results = []
        self.discovery = ParameterDiscovery(timeout=cve_def.execution.timeout)
    
    def execute(self, target: str, user_inputs: Dict[str, Any]) -> Dict:
        """Execute CVE with dynamic inputs"""
        
        print(f"\n🎯 Executing: {self.cve.cve_id} - {self.cve.name}")
        print(f"   Target: {target}")
        print(f"   Category: {self.cve.category}")
        
        # 1. Handle auto-discovery if needed
        discovered_params = {}
        if self._needs_discovery():
            print("   🔍 Auto-discovering parameters...")
            discovered_params = self.discovery.discover_parameters(target)
            user_inputs['discovered'] = discovered_params
            print(f"   Found: {sum(len(v) for v in discovered_params.values())} parameters")
        
        # 2. Generate injection vectors
        vectors = self._generate_vectors(target, user_inputs)
        print(f"   📦 Generated {len(vectors)} attack vectors")
        
        # 3. Execute vectors
        vulnerabilities = []
        for i, vector in enumerate(vectors, 1):
            if i % 10 == 0:
                print(f"   Progress: {i}/{len(vectors)}")
            
            result = self._execute_vector(vector)
            self.results.append(result)
            
            # Check if vulnerable
            if self._is_vulnerable(result):
                vulnerabilities.append(result)
            
            # Rate limiting
            time.sleep(1 / self.cve.execution.rate_limit)
        
        # 4. Summary
        print(f"   ✅ Complete: {len(vulnerabilities)} vulnerabilities found")
        
        return {
            'cve_id': self.cve.cve_id,
            'target': target,
            'total_vectors': len(vectors),
            'vulnerabilities_found': len(vulnerabilities),
            'vulnerable': len(vulnerabilities) > 0,
            'results': vulnerabilities
        }
    
    def _needs_discovery(self) -> bool:
        """Check if CVE needs parameter discovery"""
        return any(
            inp.type == InputType.AUTO_DISCOVER
            for inp in self.cve.inputs
        )
    
    def _generate_vectors(self, target: str, inputs: Dict) -> List[Dict]:
        """Generate all attack vectors"""
        vectors = []
        
        # Get payloads
        payloads = self._get_payloads(inputs)
        
        # Get injection locations
        locations = self.cve.injection.locations
        
        # Get parameters
        discovered = inputs.get('discovered', {})
        
        # Generate based on injection method
        if self.cve.injection.method == "direct":
            # Direct injection (e.g., React2Shell)
            for payload in payloads:
                vectors.append({
                    'target': target,
                    'location': locations[0] if locations else 'direct',
                    'payload': payload,
                    'method': 'POST',
                    'inputs': inputs
                })
        
        elif self.cve.injection.method == "combinatorial":
            # Combinatorial (e.g., SQL injection in all params)
            for location in locations:
                params = discovered.get(location, [])
                for param in params:
                    for payload in payloads:
                        vectors.append({
                            'target': target,
                            'location': location,
                            'parameter': param,
                            'payload': payload,
                            'method': 'GET' if location == 'query' else 'POST'
                        })
        
        elif self.cve.injection.method == "sequential":
            # Sequential (test in order)
            for i, payload in enumerate(payloads):
                vectors.append({
                    'target': target,
                    'location': locations[0] if locations else 'url_path',
                    'payload': payload,
                    'sequence': i,
                    'method': 'GET'
                })
        
        return vectors[:self.cve.execution.max_requests]
    
    def _get_payloads(self, inputs: Dict) -> List[str]:
        """Get payloads based on context"""
        payloads = []
        payload_dict = self.cve.payloads
        
        # Simple payload list
        if isinstance(payload_dict, list):
            return payload_dict
        
        # Categorized payloads
        for category, payload_list in payload_dict.items():
            if isinstance(payload_list, list):
                payloads.extend(payload_list)
            elif isinstance(payload_list, str):
                payloads.append(payload_list)
        
        # Replace placeholders
        cmd = inputs.get('command', 'whoami')
        payloads = [p.replace('{cmd}', cmd) for p in payloads]
        
        return payloads
    
    def _execute_vector(self, vector: Dict) -> Dict:
        """Execute single attack vector"""
        try:
            target = vector['target']
            location = vector.get('location')
            payload = vector['payload']
            
            start_time = time.time()
            
            # Build request based on location
            if location == 'query_params' or location == 'query':
                param = vector.get('parameter', 'id')
                url = f"{target}?{param}={payload}"
                response = self.session.get(
                    url,
                    timeout=self.cve.execution.timeout
                )
            
            elif location == 'url_path':
                url = urljoin(target, payload)
                response = self.session.get(
                    url,
                    timeout=self.cve.execution.timeout
                )
            
            elif location == 'rsc_action':
                # React Server Component exploit
                response = self._execute_rsc(target, payload, vector.get('inputs', {}))
            
            else:
                # Default GET
                response = self.session.get(
                    target,
                    timeout=self.cve.execution.timeout
                )
            
            elapsed = time.time() - start_time
            
            return {
                'vector': vector,
                'status_code': response.status_code,
                'response_time': elapsed,
                'content': response.text[:1000],  # First 1000 chars
                'headers': dict(response.headers),
                'vulnerable': False  # Will be set by validation
            }
        
        except requests.RequestException as e:
            return {
                'vector': vector,
                'error': str(e),
                'vulnerable': False
            }
    
    def _execute_rsc(self, target: str, command: str, inputs: Dict) -> requests.Response:
        """Execute React Server Component exploit"""
        # Simplified React2Shell execution
        # In reality, this would construct the RSC payload properly
        headers = {
            'Next-Action': 'action-id',
            'Content-Type': 'multipart/form-data; boundary=----WebKitFormBoundary'
        }
        
        # Construct RSC action payload
        body = f'------WebKitFormBoundary\r\nContent-Disposition: form-data; name="0"\r\n\r\n{command}\r\n------WebKitFormBoundary--\r\n'
        
        return self.session.post(
            target,
            data=body,
            headers=headers,
            timeout=self.cve.execution.timeout
        )
    
    def _is_vulnerable(self, result: Dict) -> bool:
        """Check if result indicates vulnerability"""
        if 'error' in result:
            return False
        
        detection = self.cve.detection
        
        if detection.type == "content_validation":
            return self._validate_content(result)
        
        elif detection.type == "response_diff":
            return self._check_response_diff(result)
        
        elif detection.type == "error_pattern":
            return self._check_error_patterns(result)
        
        elif detection.type == "time_based":
            return self._check_time_based(result)
        
        elif detection.type == "response_content":
            return self._check_response_content(result)
        
        elif detection.type == "multi":
            # Multiple detection methods
            return any([
                self._validate_content(result),
                self._check_error_patterns(result),
                self._check_time_based(result)
            ])
        
        return False
    
    def _validate_content(self, result: Dict) -> bool:
        """Validate git file content"""
        content = result.get('content', '')
        patterns = self.cve.detection.patterns or {}
        
        # Check for valid git file patterns
        for file_type, pattern_list in patterns.items():
            for pattern in pattern_list:
                if re.search(pattern, content):
                    result['vulnerable'] = True
                    result['matched_pattern'] = pattern
                    return True
        
        return False
    
    def _check_response_diff(self, result: Dict) -> bool:
        """Check for response differences"""
        # Compare with baseline (simple version)
        return result.get('status_code') == 200
    
    def _check_error_patterns(self, result: Dict) -> bool:
        """Check for SQL/error patterns"""
        content = result.get('content', '').lower()
        patterns = self.cve.detection.patterns or {}
        
        for db_type, error_list in patterns.items():
            for error in error_list:
                if error.lower() in content:
                    result['vulnerable'] = True
                    result['detected_error'] = error
                    return True
        
        return False
    
    def _check_time_based(self, result: Dict) -> bool:
        """Check for time-based injection"""
        response_time = result.get('response_time', 0)
        # If response takes > 5 seconds, likely time-based injection worked
        return response_time > 5.0
    
    def _check_response_content(self, result: Dict) -> bool:
        """Check response content for indicators"""
        content = result.get('content', '')
        indicators = self.cve.detection.success_indicators or []
        
        # Simple heuristic checks
        if 'command_output_in_response' in indicators:
            # Check if common command outputs appear
            common_outputs = ['root', 'admin', 'user', 'uid=', 'gid=']
            return any(out in content.lower() for out in common_outputs)
        
        return result.get('status_code') == 200 and len(content) > 0
