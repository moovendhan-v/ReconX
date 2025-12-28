#!/usr/bin/env python3
"""
ReconX Python Core API - Dynamic CVE Execution Platform
"""

from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Dict, List, Any
import uvicorn
import uuid
from datetime import datetime
import asyncio

# Import CVE Engine
from cve_engine import CVELoader, CVEExecutor

app = FastAPI(title="ReconX Dynamic CVE Platform", version="3.0.0")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load CVE definitions
print("\n" + "=" * 70)
print("ReconX Dynamic CVE Execution Platform")
print("=" * 70)
cve_loader = CVELoader(cves_dir="./cves")
available_cves = cve_loader.load_all()
print(f" Total CVEs: {len(available_cves)}")
print(f" HTTP API:   http://localhost:3001")
print(" Endpoints:")
print("   GET  /cves/list              - List all CVEs")
print("   POST /cves/{cve_id}/execute  - Execute single CVE")
print("   POST /cves/{cve_id}/discover - Auto-discover parameters")
print("=" * 70)

# Execution tracking
executions: Dict[str, Dict] = {}


class CVEExecutionRequest(BaseModel):
    target: str
    inputs: Dict[str, Any] = {}


@app.get("/health")
async def health_check():
    return {
        "status": "ok",
        "service": "reconx-dynamic-cve",
        "version": "3.0.0",
        "total_cves": len(available_cves),
        "engine": "YAML-driven"
    }


@app.get("/cves/list")
async def list_cves():
    """List all CVEs with input requirements"""
    cves_list = []
    
    for cve_id, cve_def in available_cves.items():
        cves_list.append({
            "cve_id": cve_def.cve_id,
            "name": cve_def.name,
            "category": cve_def.category,
            "severity": cve_def.severity,
            "cvss": cve_def.cvss,
            "description": cve_def.description,
            "inputs": [
                {
                    "name": inp.name,
                    "type": inp.type.value,
                    "required": inp.required,
                    "default": inp.default,
                    "description": inp.description,
                    "options": inp.options,
                    "auto_detect": inp.auto_detect
                }
                for inp in cve_def.inputs
            ]
        })
    
    return {
        "total": len(cves_list),
        "cves": cves_list
    }


@app.get("/cves/{cve_id}")
async def get_cve_details(cve_id: str):
    """Get detailed CVE information"""
    cve_def = available_cves.get(cve_id)
    if not cve_def:
        raise HTTPException(status_code=404, detail=f"CVE {cve_id} not found")
    
    return {
        "cve_id": cve_def.cve_id,
        "name": cve_def.name,
        "category": cve_def.category,
        "severity": cve_def.severity,
        "cvss": cve_def.cvss,
        "description": cve_def.description,
        "injection_method": cve_def.injection.method,
        "injection_locations": cve_def.injection.locations,
        "detection_type": cve_def.detection.type,
        "inputs": [
            {
                "name": inp.name,
                "type": inp.type.value,
                "required": inp.required,
                "default": inp.default,
                "description": inp.description
            }
            for inp in cve_def.inputs
        ]
    }


@app.post("/cves/{cve_id}/execute")
async def execute_cve(cve_id: str, request: CVEExecutionRequest):
    """Execute single CVE dynamically"""
    
    cve_def = available_cves.get(cve_id)
    if not cve_def:
        raise HTTPException(status_code=404, detail=f"CVE {cve_id} not found")
    
    execution_id = str(uuid.uuid4())
    
    # Create executor
    executor = CVEExecutor(cve_def)
    
    # Execute
    try:
        result = executor.execute(
            target=request.target,
            user_inputs=request.inputs
        )
        
        # Store execution
        executions[execution_id] = {
            "id": execution_id,
            "cve_id": cve_id,
            "target": request.target,
            "started_at": datetime.now().isoformat(),
            "result": result
        }
        
        return {
            "execution_id": execution_id,
            **result
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/cves/{cve_id}/discover")
async def discover_parameters(cve_id: str, target: str):
    """Auto-discover parameters for CVE"""
    
    cve_def = available_cves.get(cve_id)
    if not cve_def:
        raise HTTPException(status_code=404, detail=f"CVE {cve_id} not found")
    
    # Use parameter discovery
    from cve_engine.discovery import ParameterDiscovery
    discovery = ParameterDiscovery()
    
    try:
        params = discovery.discover_parameters(target)
        return {
            "cve_id": cve_id,
            "target": target,
            "discovered": params
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/executions/{execution_id}")
async def get_execution_status(execution_id: str):
    """Get execution status and results"""
    
    execution = executions.get(execution_id)
    if not execution:
        raise HTTPException(status_code=404, detail="Execution not found")
    
    return execution


if __name__ == "__main__":
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=3001,
        log_level="info"
    )
