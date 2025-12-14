#!/usr/bin/env python3
"""
FastAPI service for POC execution
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Dict, Any
import uvicorn
from executor import executor

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


class ExecuteResponse(BaseModel):
    success: bool
    output: str
    error: Optional[str] = None
    return_code: int


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "ok", "service": "python-core"}


@app.post("/execute", response_model=ExecuteResponse)
async def execute_poc(request: ExecuteRequest):
    """
    Execute a POC script
    
    Args:
        request: Execution request with script path and parameters
        
    Returns:
        Execution result
    """
    try:
        # Determine language from file extension
        if request.scriptPath.endswith('.py'):
            language = 'python'
        elif request.scriptPath.endswith('.sh'):
            language = 'bash'
        else:
            raise HTTPException(status_code=400, detail="Unsupported script type")
        
        # Execute
        result = executor.execute(
            script_path=request.scriptPath,
            language=language,
            targetUrl=request.targetUrl,
            command=request.command,
            additionalParams=request.additionalParams
        )
        
        return ExecuteResponse(**result)
        
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
