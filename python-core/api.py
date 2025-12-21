#!/usr/bin/env python3
"""
FastAPI service for POC execution with real-time log streaming
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Dict, Any
import uvicorn
from executor import executor
import uuid

app = FastAPI(title="Bug Hunting - Python Core", version="1.0.0")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ExecuteRequest(BaseModel):
    scriptPath: str
    targetUrl: Optional[str] = None
    command: Optional[str] = None
    additionalParams: Optional[Dict[str, Any]] = None
    executionId: Optional[str] = None  # For log streaming


class ExecuteResponse(BaseModel):
    success: bool
    output: str
    error: Optional[str] = None
    return_code: int
    execution_id: str


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "ok", "service": "python-core"}


@app.post("/execute", response_model=ExecuteResponse)
async def execute_poc(request: ExecuteRequest):
    """
    Execute a POC script with real-time log streaming
    
    Args:
        request: Execution request with script path and parameters
        
    Returns:
        Execution result
    """
    try:
        # Generate execution ID if not provided
        execution_id = request.executionId or str(uuid.uuid4())
        
        # Determine language from file extension
        if request.scriptPath.endswith('.py'):
            language = 'python'
        elif request.scriptPath.endswith('.sh'):
            language = 'bash'
        else:
            raise HTTPException(status_code=400, detail="Unsupported script type")
        
        # Execute with log streaming
        result = executor.execute(
            script_path=request.scriptPath,
            language=language,
            execution_id=execution_id,
            targetUrl=request.targetUrl,
            command=request.command,
            additionalParams=request.additionalParams
        )
        
        return ExecuteResponse(
            execution_id=execution_id,
            **result
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    uvicorn.run(
        "api:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
