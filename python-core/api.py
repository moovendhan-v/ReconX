#!/usr/bin/env python3
"""
ReconX Python Core API - Generic Exploit Orchestration Platform
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
import os
import sys

# Add exploits directory to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'exploits'))
from registry import EXPLOIT_REGISTRY, get_all_exploits, get_exploit

app = FastAPI(title="ReconX Orchestration Platform", version="2.0.0")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory storage for execution logs and batches
executions: Dict[str, Dict] = {}
batches: Dict[str, Dict] = {}


class ExploitParam(BaseModel):
    id: str
    params: Dict[str, str]


class BatchExecuteRequest(BaseModel):
    target: str
    exploits: List[ExploitParam]
    mode: str = "parallel"  # "parallel" or "sequential"
    max_workers: int = 5


@app.get("/health")
async def health_check():
    return {
        "status": "ok",
        "service": "reconx-orchestration",
        "version": "2.0.0",
        "total_exploits": len(EXPLOIT_REGISTRY)
    }


@app.get("/exploits/list")
async def list_exploits():
    """Get all available exploits with metadata"""
    exploits = get_all_exploits()
    return {
        "total": len(exploits),
        "exploits": exploits
    }


@app.post("/exploits/execute-batch")
async def execute_batch(request: BatchExecuteRequest, background_tasks: BackgroundTasks):
    """Execute multiple exploits in parallel or sequential mode"""
    batch_id = str(uuid.uuid4())
    
    # Initialize batch tracking
    batches[batch_id] = {
        'batch_id': batch_id,
        'target': request.target,
        'mode': request.mode,
        'status': 'running',
        'total': len(request.exploits),
        'completed': 0,
        'running': 0,
        'failed': 0,
        'started_at': datetime.now().isoformat(),
        'results': []
    }
    
    # Run in background
    if request.mode == 'parallel':
        background_tasks.add_task(
            execute_parallel,
            batch_id,
            request.exploits,
            request.max_workers
        )
    else:
        background_tasks.add_task(
            execute_sequential,
            batch_id,
            request.exploits
        )
    
    return {
        'batch_id': batch_id,
        'status': 'started',
        'total_exploits': len(request.exploits)
    }


@app.get("/exploits/batch/{batch_id}/status")
async def get_batch_status(batch_id: str):
    """Get status of all exploits in a batch"""
    if batch_id not in batches:
        raise HTTPException(status_code=404, detail="Batch not found")
    
    return batches[batch_id]


async def execute_parallel(batch_id: str, exploits: List[ExploitParam], max_workers: int):
    """Execute exploits in parallel using asyncio"""
    semaphore = asyncio.Semaphore(max_workers)
    
    async def run_with_semaphore(exploit_param):
        async with semaphore:
            return await execute_single_exploit(batch_id, exploit_param)
    
    tasks = [run_with_semaphore(exp) for exp in exploits]
    await asyncio.gather(*tasks)
    
    batches[batch_id]['status'] = 'completed'
    batches[batch_id]['completed_at'] = datetime.now().isoformat()


async def execute_sequential(batch_id: str, exploits: List[ExploitParam]):
    """Execute exploits one by one sequentially"""
    for exploit_param in exploits:
        await execute_single_exploit(batch_id, exploit_param)
    
    batches[batch_id]['status'] = 'completed'
    batches[batch_id]['completed_at'] = datetime.now().isoformat()


async def execute_single_exploit(batch_id: str, exploit_param: ExploitParam):
    """Execute a single exploit and store results"""
    exploit_meta = get_exploit(exploit_param.id)
    
    if not exploit_meta:
        return
    
    execution_id = str(uuid.uuid4())
    start_time = datetime.now()
    
    # Update batch status
    batches[batch_id]['running'] += 1
    
    try:
        # Build command
        cmd = [
            arg.format(**exploit_param.params) if '{' in arg else arg
            for arg in exploit_meta['command']
        ]
        
        # Execute
        result = await asyncio.to_thread(
            subprocess.run,
            cmd,
            capture_output=True,
            text=True,
            timeout=exploit_meta['timeout'],
            cwd=os.path.dirname(__file__)
        )
        
        # Calculate duration
        duration = (datetime.now() - start_time).total_seconds()
        
        # Store result
        exploit_result = {
            'execution_id': execution_id,
            'exploit_id': exploit_param.id,
            'cve': exploit_meta['cve'],
            'name': exploit_meta['name'],
            'status': 'completed',
            'success': result.returncode == 0,
            'output': result.stdout if result.stdout else result.stderr,
            'error': result.stderr if result.returncode != 0 else None,
            'returnCode': result.returncode,
            'duration': round(duration, 2),
            'timestamp': start_time.isoformat(),
            'target': exploit_param.params.get('target', ''),
            'metadata': {
                'severity': exploit_meta['severity'],
                'cvss': exploit_meta['cvss'],
                'category': exploit_meta['category']
            }
        }
        
        batches[batch_id]['results'].append(exploit_result)
        batches[batch_id]['running'] -= 1
        batches[batch_id]['completed'] += 1
        
    except subprocess.TimeoutExpired:
        batches[batch_id]['results'].append({
            'execution_id': execution_id,
            'exploit_id': exploit_param.id,
            'cve': exploit_meta['cve'],
            'name': exploit_meta['name'],
            'status': 'timeout',
            'success': False,
            'error': f"Timeout after {exploit_meta['timeout']}s",
            'timestamp': start_time.isoformat()
        })
        batches[batch_id]['running'] -= 1
        batches[batch_id]['failed'] += 1
        
    except Exception as e:
        batches[batch_id]['results'].append({
            'execution_id': execution_id,
            'exploit_id': exploit_param.id,
            'cve': exploit_meta['cve'],
            'name': exploit_meta['name'],
            'status': 'error',
            'success': False,
            'error': str(e),
            'timestamp': start_time.isoformat()
        })
        batches[batch_id]['running'] -= 1
        batches[batch_id]['failed'] += 1


if __name__ == "__main__":
    print("="*70)
    print("ReconX Generic Exploit Orchestration Platform")
    print("="*70)
    print(f" Total Exploits: {len(EXPLOIT_REGISTRY)}")
    print(" HTTP API:       http://localhost:3001")
    print(" Endpoints:")
    print("   GET  /exploits/list           - List all exploits")
    print("   POST /exploits/execute-batch  - Execute multiple exploits")
    print("   GET  /exploits/batch/{id}/status - Get batch status")
    print("="*70)
    
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=3001,
        log_level="info"
    )
