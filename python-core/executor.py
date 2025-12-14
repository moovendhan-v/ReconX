#!/usr/bin/env python3
"""
POC Executor - Safely executes security POC scripts
"""

import os
import subprocess
import sys
import tempfile
from pathlib import Path
from typing import Dict, Any, Optional


class POCExecutor:
    """Executes POC scripts in a controlled environment"""
    
    def __init__(self):
        self.timeout = 30  # seconds
        
    def execute_python_script(
        self, 
        script_path: str, 
        target_url: Optional[str] = None,
        command: Optional[str] = None,
        additional_params: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Execute a Python POC script
        
        Args:
            script_path: Path to the Python script
            target_url: Target URL for the exploit
            command: Command to execute
            additional_params: Additional parameters
            
        Returns:
            Dict with success status, output, and error info
        """
        try:
            # Build command
            cmd = [sys.executable, script_path]
            
            if target_url:
                cmd.extend(['-t', target_url])
            
            if command:
                cmd.extend(['-c', command])
            
            # Execute with timeout
            result = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                timeout=self.timeout,
                cwd=os.path.dirname(script_path)
            )
            
            return {
                'success': result.returncode == 0,
                'output': result.stdout,
                'error': result.stderr,
                'return_code': result.returncode
            }
            
        except subprocess.TimeoutExpired:
            return {
                'success': False,
                'output': '',
                'error': f'Execution timed out after {self.timeout} seconds',
                'return_code': -1
            }
        except Exception as e:
            return {
                'success': False,
                'output': '',
                'error': str(e),
                'return_code': -1
            }
    
    def execute_bash_script(
        self,
        script_path: str,
        args: Optional[list] = None
    ) -> Dict[str, Any]:
        """Execute a bash script"""
        try:
            cmd = ['bash', script_path]
            if args:
                cmd.extend(args)
            
            result = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                timeout=self.timeout
            )
            
            return {
                'success': result.returncode == 0,
                'output': result.stdout,
                'error': result.stderr,
                'return_code': result.returncode
            }
            
        except subprocess.TimeoutExpired:
            return {
                'success': False,
                'output': '',
                'error': f'Execution timed out after {self.timeout} seconds',
                'return_code': -1
            }
        except Exception as e:
            return {
                'success': False,
                'output': '',
                'error': str(e),
                'return_code': -1
            }
    
    def execute(
        self,
        script_path: str,
        language: str,
        **kwargs
    ) -> Dict[str, Any]:
        """
        Main executor method that routes to appropriate handler
        
        Args:
            script_path: Path to the script
            language: Script language (python, bash, etc.)
            **kwargs: Additional execution parameters
            
        Returns:
            Execution result dictionary
        """
        # Validate script exists
        if not os.path.exists(script_path):
            return {
                'success': False,
                'output': '',
                'error': f'Script not found: {script_path}',
                'return_code': -1
            }
        
        # Route to appropriate executor
        if language.lower() == 'python':
            return self.execute_python_script(
                script_path,
                kwargs.get('targetUrl'),
                kwargs.get('command'),
                kwargs.get('additionalParams')
            )
        elif language.lower() in ['bash', 'sh']:
            return self.execute_bash_script(
                script_path,
                kwargs.get('args', [])
            )
        else:
            return {
                'success': False,
                'output': '',
                'error': f'Unsupported language: {language}',
                'return_code': -1
            }


# Singleton instance
executor = POCExecutor()
