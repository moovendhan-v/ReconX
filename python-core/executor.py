#!/usr/bin/env python3
"""
POC Executor - Safely executes security POC scripts with real-time log streaming
"""

import os
import subprocess
import sys
import tempfile
from pathlib import Path
from typing import Dict, Any, Optional
import redis
import json


class POCExecutor:
    """Executes POC scripts in a controlled environment with real-time logging"""
    
    def __init__(self):
        self.timeout = 30  # seconds
        self.redis_client = None
        self._init_redis()
        
    def _init_redis(self):
        """Initialize Redis connection for log streaming"""
        try:
            redis_url = os.getenv('REDIS_URL', 'redis://localhost:6379')
            self.redis_client = redis.from_url(redis_url, decode_responses=True)
            self.redis_client.ping()
        except Exception as e:
            print(f"Warning: Redis connection failed: {e}", file=sys.stderr)
            self.redis_client = None
    
    def _publish_log(self, execution_id: str, log_type: str, message: str):
        """Publish log message to Redis channel"""
        if not self.redis_client:
            return
            
        try:
            channel = f"execution:logs:{execution_id}"
            log_data = {
                'type': log_type,
                'message': message,
                'timestamp': str(int(os.times()[4] * 1000))
            }
            self.redis_client.publish(channel, json.dumps(log_data))
        except Exception as e:
            print(f"Failed to publish log: {e}", file=sys.stderr)
    
    def execute_python_script(
        self, 
        script_path: str, 
        target_url: Optional[str] = None,
        command: Optional[str] = None,
        additional_params: Optional[Dict[str, Any]] = None,
        execution_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Execute a Python POC script with real-time log streaming
        
        Args:
            script_path: Path to the Python script
            target_url: Target URL for the exploit
            command: Command to execute
            additional_params: Additional parameters
            execution_id: Unique ID for this execution (for log streaming)
            
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
            
            # Publish START event
            if execution_id:
                self._publish_log(execution_id, 'START', f"Executing: {' '.join(cmd)}")
            
            # Execute with real-time output capture
            process = subprocess.Popen(
                cmd,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True,
                bufsize=1,
                cwd=os.path.dirname(script_path)
            )
            
            stdout_lines = []
            stderr_lines = []
            
            # Read output line by line in real-time
            import select
            while True:
                # Check if process is still running
                if process.poll() is not None:
                    break
                
                # Read available stdout
                line = process.stdout.readline()
                if line:
                    line = line.rstrip()
                    stdout_lines.append(line)
                    if execution_id:
                        self._publish_log(execution_id, 'STDOUT', line)
            
            # Get remaining output
            remaining_out, remaining_err = process.communicate(timeout=1)
            if remaining_out:
                for line in remaining_out.splitlines():
                    stdout_lines.append(line)
                    if execution_id:
                        self._publish_log(execution_id, 'STDOUT', line)
            
            if remaining_err:
                for line in remaining_err.splitlines():
                    stderr_lines.append(line)
                    if execution_id:
                        self._publish_log(execution_id, 'STDERR', line)
            
            stdout = '\n'.join(stdout_lines)
            stderr = '\n'.join(stderr_lines)
            
            # Publish COMPLETE event
            if execution_id:
                status = 'SUCCESS' if process.returncode == 0 else 'FAILED'
                self._publish_log(execution_id, 'COMPLETE', f"Execution finished with code {process.returncode}")
            
            return {
                'success': process.returncode == 0,
                'output': stdout,
                'error': stderr,
                'return_code': process.returncode
            }
            
        except subprocess.TimeoutExpired:
            if execution_id:
                self._publish_log(execution_id, 'ERROR', f'Execution timed out after {self.timeout} seconds')
            return {
                'success': False,
                'output': '',
                'error': f'Execution timed out after {self.timeout} seconds',
                'return_code': -1
            }
        except Exception as e:
            if execution_id:
                self._publish_log(execution_id, 'ERROR', str(e))
            return {
                'success': False,
                'output': '',
                'error': str(e),
                'return_code': -1
            }
    
    def execute_bash_script(
        self,
        script_path: str,
        args: Optional[list] = None,
        execution_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """Execute a bash script with real-time logging"""
        try:
            cmd = ['bash', script_path]
            if args:
                cmd.extend(args)
            
            if execution_id:
                self._publish_log(execution_id, 'START', f"Executing: {' '.join(cmd)}")
            
            result = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                timeout=self.timeout
            )
            
            if execution_id:
                if result.stdout:
                    for line in result.stdout.splitlines():
                        self._publish_log(execution_id, 'STDOUT', line)
                if result.stderr:
                    for line in result.stderr.splitlines():
                        self._publish_log(execution_id, 'STDERR', line)
                self._publish_log(execution_id, 'COMPLETE', f"Execution finished with code {result.returncode}")
            
            return {
                'success': result.returncode == 0,
                'output': result.stdout,
                'error': result.stderr,
                'return_code': result.returncode
            }
            
        except subprocess.TimeoutExpired:
            if execution_id:
                self._publish_log(execution_id, 'ERROR', f'Execution timed out after {self.timeout} seconds')
            return {
                'success': False,
                'output': '',
                'error': f'Execution timed out after {self.timeout} seconds',
                'return_code': -1
            }
        except Exception as e:
            if execution_id:
                self._publish_log(execution_id, 'ERROR', str(e))
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
        execution_id: Optional[str] = None,
        **kwargs
    ) -> Dict[str, Any]:
        """
        Main executor method that routes to appropriate handler
        
        Args:
            script_path: Path to the script
            language: Script language (python, bash, etc.)
            execution_id: Unique ID for log streaming
            **kwargs: Additional execution parameters
            
        Returns:
            Execution result dictionary
        """
        # Validate script exists
        if not os.path.exists(script_path):
            error_msg = f'Script not found: {script_path}'
            if execution_id:
                self._publish_log(execution_id, 'ERROR', error_msg)
            return {
                'success': False,
                'output': '',
                'error': error_msg,
                'return_code': -1
            }
        
        # Route to appropriate executor
        if language.lower() == 'python':
            return self.execute_python_script(
                script_path,
                kwargs.get('targetUrl'),
                kwargs.get('command'),
                kwargs.get('additionalParams'),
                execution_id
            )
        elif language.lower() in ['bash', 'sh']:
            return self.execute_bash_script(
                script_path,
                kwargs.get('args', []),
                execution_id
            )
        else:
            error_msg = f'Unsupported language: {language}'
            if execution_id:
                self._publish_log(execution_id, 'ERROR', error_msg)
            return {
                'success': False,
                'output': '',
                'error': error_msg,
                'return_code': -1
            }


# Singleton instance
executor = POCExecutor()
