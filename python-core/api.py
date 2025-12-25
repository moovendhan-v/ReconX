#!/usr/bin/env python3
"""
ReconX Python Core API - Simple HTTP polling for browser extensions
"""

from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Dict, List
import uvicorn
import subprocess
import uuid
from datetime import datetime
import asyncio

app = FastAPI(title="ReconX Python Core", version="1.0.0")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory storage for execution logs
executions: Dict[str, Dict] = {}


class ExploitRequest(BaseModel):
    cveId: str
    targetUrl: str
    command: str


@app.get("/health")
async def health_check():
    return {"status": "ok", "service": "reconx-python-core"}


@app.post("/execute-react2shell")
async def execute_react2shell(request: ExploitRequest, background_tasks: BackgroundTasks):
    """Execute React2Shell exploit"""
    execution_id = str(uuid.uuid4())
    
    # Initialize execution tracking
    executions[execution_id] = {
        'status': 'running',
        'logs': [],
        'result': None,
        'started_at': datetime.now().isoformat()
    }
    
    # Run in background
    background_tasks.add_task(run_exploit, execution_id, request.targetUrl, request.command)
    
    return {
        'execution_id': execution_id,
        'status': 'started'
    }


async def run_exploit(execution_id: str, target_url: str, command: str):
    """Run the exploit and capture logs"""
    def add_log(message: str, level: str = 'info'):
        executions[execution_id]['logs'].append({
            'timestamp': datetime.now().isoformat(),
            'level': level,
            'message': message
        })
    
    try:
        add_log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'info')
        add_log('🚀 Starting React2Shell exploit execution', 'info')
        add_log(f'Target: {target_url}', 'info')
        add_log(f'Command: {command}', 'info')
        add_log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'info')
        
        add_log('[1/4] Validating parameters...', 'progress')
        await asyncio.sleep(0.5)
        
        add_log('[2/4] Building exploit command...', 'progress')
        cmd = ['react2shell', '-t', target_url, '-c', command]
        add_log(f"Command: {' '.join(cmd)}", 'info')
        
        add_log('[3/4] Executing exploit...', 'progress')
        
        # Execute
        result = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            timeout=30
        )
        
        add_log('[4/4] Processing results...', 'progress')
        add_log(f'Exit code: {result.returncode}', 'info')
        
        # Store result
        executions[execution_id]['status'] = 'completed'
        executions[execution_id]['result'] = {
            'success': result.returncode == 0,
            'output': result.stdout if result.stdout else result.stderr,
            'returnCode': result.returncode
        }
        
        if result.returncode == 0:
            add_log('✓ Exploit execution completed successfully', 'success')
        else:
            add_log(f'✗ Exploit failed: {result.stderr}', 'error')
            
    except subprocess.TimeoutExpired:
        add_log('✗ Exploit execution timed out (30s)', 'error')
        executions[execution_id]['status'] = 'timeout'
    except FileNotFoundError:
        add_log('✗ react2shell command not found. Install: pip install CYBERTECHMIND-CVE-2025-55182', 'error')
        executions[execution_id]['status'] = 'error'
    except Exception as e:
        add_log(f'✗ Error: {str(e)}', 'error')
        executions[execution_id]['status'] = 'error'


@app.get("/execution/{execution_id}/logs")
async def get_logs(execution_id: str):
    """Get logs for an execution"""
    if execution_id not in executions:
        raise HTTPException(status_code=404, detail="Execution not found")
    
    return {
        'execution_id': execution_id,
        'status': executions[execution_id]['status'],
        'logs': executions[execution_id]['logs'],
        'result': executions[execution_id].get('result')
    }


@app.get("/execution/{execution_id}/status")
async def get_status(execution_id: str):
    """Get status of an execution"""
    if execution_id not in executions:
        raise HTTPException(status_code=404, detail="Execution not found")
    
    return {
        'execution_id': execution_id,
        'status': executions[execution_id]['status'],
        'log_count': len(executions[execution_id]['logs'])
    }


if __name__ == "__main__":
    print("="*60)
    print("ReconX Python Core API (HTTP Polling)")
    print("="*60)
    print(" HTTP API:  http://localhost:3001")
    print(" /execute-react2shell   - Start exploit")
    print(" /execution/{id}/logs   - Get logs")
    print(" /execution/{id}/status - Get status")
    print("="*60)
    
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=3001,
        log_level="info"
    )
