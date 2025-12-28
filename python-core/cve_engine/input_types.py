"""
Input Type Definitions for Dynamic CVE Execution
"""

from enum import Enum
from typing import List, Optional, Any, Dict
from pydantic import BaseModel, Field


class InputType(str, Enum):
    """Types of inputs a CVE can require"""
    TEXT = "TEXT"
    LIST = "LIST"
    BOOLEAN = "BOOLEAN"
    AUTO_DISCOVER = "AUTO_DISCOVER"
    FILE = "FILE"


class InputDefinition(BaseModel):
    """Definition of a single input requirement"""
    name: str
    type: InputType
    required: bool = False
    default: Optional[Any] = None
    description: Optional[str] = None
    
    # For LIST type
    options: Optional[List[str]] = None
    multi_select: bool = False
    
    # For AUTO_DISCOVER
    locations: Optional[List[str]] = None
    auto_detect: bool = False
    auto_generate: Optional[str] = None
    
    # Validation
    pattern: Optional[str] = None
    min_length: Optional[int] = None
    max_length: Optional[int] = None


class InjectionConfig(BaseModel):
    """How to inject payloads"""
    locations: List[str]
    method: str = "combinatorial"  # combinatorial, sequential, direct
    encoding: Optional[List[str]] = None
    parameters: Optional[Dict[str, Any]] = None


class DetectionConfig(BaseModel):
    """How to detect vulnerabilities"""
    type: str  # response_diff, error_pattern, time_based, callback, etc.
    methods: Optional[List[str]] = None
    patterns: Optional[Dict[str, List[str]]] = None
    success_indicators: Optional[List[str]] = None
    wait_time: Optional[int] = None


class ExecutionConfig(BaseModel):
    """Execution settings"""
    timeout: int = 30
    max_requests: int = 100
    rate_limit: int = 10  # requests per second
    retries: int = 0


class CVEDefinition(BaseModel):
    """Complete CVE definition from YAML"""
    cve_id: str
    name: str
    category: str
    severity: str
    cvss: float
    description: Optional[str] = None
    
    inputs: List[InputDefinition]
    payloads: Dict[str, Any]
    injection: InjectionConfig
    detection: DetectionConfig
    execution: ExecutionConfig = Field(default_factory=ExecutionConfig)
    
    # Metadata
    references: Optional[List[str]] = None
    author: Optional[str] = None
    date_added: Optional[str] = None
