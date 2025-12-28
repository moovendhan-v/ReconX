"""
Parameter Discovery - Auto-discover injection points
"""

import requests
from urllib.parse import urlparse, parse_qs, urljoin
from typing import List, Dict, Optional
from bs4 import BeautifulSoup


class ParameterDiscovery:
    """Auto-discover injectable parameters and endpoints"""
    
    def __init__(self, timeout: int = 10):
        self.timeout = timeout
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (compatible; ReconX/2.0)'
        })
    
    def discover_parameters(self, url: str) -> Dict[str, List[str]]:
        """Find all injectable parameters across locations"""
        discovered = {
            'query': [],
            'body': [],
            'headers': [],
            'cookies': [],
            'paths': []
        }
        
        try:
            # Extract query parameters from URL
            discovered['query'] = self._get_query_params(url)
            
            # Discover POST parameters from forms
            discovered['body'] = self._discover_form_params(url)
            
            # Common injectable headers
            discovered['headers'] = self._get_common_headers()
            
            # Discover cookies
            discovered['cookies'] = self._get_cookies(url)
            
            # Discover path parameters
            discovered['paths'] = self._discover_path_params(url)
            
        except Exception as e:
            print(f"Discovery error: {e}")
        
        return discovered
    
    def _get_query_params(self, url: str) -> List[str]:
        """Extract query parameters from URL"""
        parsed = urlparse(url)
        query_params = parse_qs(parsed.query)
        return list(query_params.keys())
    
    def _discover_form_params(self, url: str) -> List[str]:
        """Discover POST parameters by analyzing forms"""
        params = []
        
        try:
            response = self.session.get(url, timeout=self.timeout)
            soup = BeautifulSoup(response.text, 'html.parser')
            
            # Find all form inputs
            forms = soup.find_all('form')
            for form in forms:
                inputs = form.find_all(['input', 'textarea', 'select'])
                for inp in inputs:
                    name = inp.get('name')
                    if name and name not in params:
                        params.append(name)
        
        except Exception as e:
            print(f"Form discovery error: {e}")
        
        return params
    
    def _get_common_headers(self) -> List[str]:
        """Return common injectable headers"""
        return [
            'User-Agent',
            'Referer',
            'X-Forwarded-For',
            'X-Real-IP',
            'X-Originating-IP',
            'Host',
            'Cookie',
            'Origin',
            'Accept',
            'Accept-Language',
            'Content-Type'
        ]
    
    def _get_cookies(self, url: str) -> List[str]:
        """Get cookie names from response"""
        try:
            response = self.session.get(url, timeout=self.timeout)
            return list(response.cookies.keys())
        except:
            return []
    
    def _discover_path_params(self, url: str) -> List[str]:
        """Discover potential path parameters"""
        parsed = urlparse(url)
        path_segments = [p for p in parsed.path.split('/') if p]
        
        # Return segments that look like IDs or parameters
        potential_params = []
        for segment in path_segments:
            # Check if segment looks like an ID (numeric or alphanumeric)
            if segment.isdigit() or len(segment) == 36:  # UUID length
                potential_params.append(segment)
        
        return potential_params
    
    def discover_endpoints(self, url: str) -> List[str]:
        """Discover additional endpoints from the page"""
        endpoints = []
        
        try:
            response = self.session.get(url, timeout=self.timeout)
            soup = BeautifulSoup(response.text, 'html.parser')
            
            # Find all links
            for link in soup.find_all('a', href=True):
                href = link['href']
                full_url = urljoin(url, href)
                if full_url not in endpoints:
                    endpoints.append(full_url)
        
        except Exception as e:
            print(f"Endpoint discovery error: {e}")
        
        return endpoints[:50]  # Limit to 50 endpoints
