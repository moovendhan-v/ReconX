"""
CVE Engine - Dynamic CVE Execution System
"""

from .loader import CVELoader
from .input_types import InputType, InputDefinition, CVEDefinition
from .executor import CVEExecutor
from .discovery import ParameterDiscovery

__version__ = "1.0.0"

__all__ = [
    'CVELoader',
    'InputType',
    'InputDefinition', 
    'CVEDefinition',
    'CVEExecutor',
    'ParameterDiscovery'
]
