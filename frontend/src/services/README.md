# API Integration Layer

This directory contains the enhanced API integration layer for the ReconX frontend application. The API layer provides type-safe, robust communication with the backend services including automatic retry logic, comprehensive error handling, and extensive validation.

## Architecture

The API integration layer is built with the following components:

### Core Components

- **BaseAPIService**: Foundation service class with retry logic, error handling, and HTTP methods
- **CVEService**: Specialized service for CVE operations with validation and filtering
- **POCService**: Specialized service for POC operations including file uploads and execution
- **API Configuration**: Environment-based configuration with validation
- **Type Definitions**: Comprehensive TypeScript interfaces for type safety

### Key Features

- ✅ **Automatic Retry Logic**: Configurable retry attempts with exponential backoff
- ✅ **Comprehensive Error Handling**: Structured error types with detailed information
- ✅ **Type Safety**: Full TypeScript support with strict type checking
- ✅ **Input Validation**: Client-side validation before API calls
- ✅ **Environment Configuration**: Flexible configuration via environment variables
- ✅ **Request/Response Interceptors**: Automatic logging and monitoring
- ✅ **Timeout Management**: Configurable timeouts for different operations
- ✅ **Form Data Helpers**: Utilities for file uploads and multipart data

## Usage

### Basic Usage

```typescript
import { cveService, pocService } from '@/services';

// Fetch CVEs with filtering
const cves = await cveService.getAll({
  search: 'SQL injection',
  severity: 'HIGH',
  page: 1,
  limit: 20
});

// Get CVE details with POCs
const cveDetails = await cveService.getById('cve-id');

// Execute a POC
const result = await pocService.execute('poc-id', {
  targetUrl: 'https://example.com',
  command: 'python script.py --target https://example.com'
});
```

### Advanced Usage

```typescript
import { CVEServiceImpl, POCServiceImpl } from '@/services';

// Create custom service instances with different configurations
const customCVEService = new CVEServiceImpl({
  baseURL: 'https://api.example.com',
  timeout: 60000,
  retryAttempts: 5,
  retryDelay: 2000
});
```

### Error Handling

```typescript
import { APIException } from '@/types';

try {
  const cves = await cveService.getAll();
} catch (error) {
  if (error instanceof APIException) {
    console.error(`API Error ${error.status}: ${error.message}`);
    console.error('Error code:', error.code);
    console.error('Details:', error.details);
  }
}
```

## Configuration

### Environment Variables

Configure the API layer using environment variables in your `.env` file:

```env
VITE_API_URL=http://localhost:3000
VITE_API_TIMEOUT=30000
VITE_API_RETRY_ATTEMPTS=3
VITE_API_RETRY_DELAY=1000
```

### Configuration Options

- **VITE_API_URL**: Base URL for the API server (default: http://localhost:3000)
- **VITE_API_TIMEOUT**: Request timeout in milliseconds (default: 30000)
- **VITE_API_RETRY_ATTEMPTS**: Number of retry attempts for failed requests (default: 3)
- **VITE_API_RETRY_DELAY**: Base delay between retries in milliseconds (default: 1000)

## Services

### CVE Service

The CVE service provides comprehensive operations for managing CVE data:

#### Methods

- `getAll(filters?)`: Get paginated list of CVEs with optional filtering
- `getById(id)`: Get detailed CVE information with associated POCs
- `create(data)`: Create a new CVE entry
- `update(id, data)`: Update existing CVE
- `delete(id)`: Delete CVE
- `search(query)`: Search CVEs by text query
- `getBySeverity(severity)`: Get CVEs filtered by severity level
- `getRecent(days?)`: Get CVEs published in the last N days
- `getStatistics()`: Get CVE statistics and metrics

#### Filtering Options

```typescript
interface CVEFilters {
  search?: string;           // Text search across CVE fields
  page?: number;            // Page number for pagination
  limit?: number;           // Items per page
  severity?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  dateFrom?: string;        // Filter by publish date (ISO string)
  dateTo?: string;          // Filter by publish date (ISO string)
}
```

### POC Service

The POC service handles POC script management and execution:

#### Methods

- `getAll(filters?)`: Get list of POCs with optional filtering
- `getById(id)`: Get detailed POC information with execution logs
- `upload(formData)`: Upload new POC script file
- `execute(id, request)`: Execute POC script with parameters
- `getLogs(id, limit?)`: Get execution logs for a POC
- `delete(id)`: Delete POC and associated files
- `getByCVE(cveId)`: Get POCs associated with specific CVE
- `getByLanguage(language)`: Get POCs filtered by programming language
- `getByAuthor(author)`: Get POCs filtered by author
- `getRecentExecutions(limit?)`: Get recent execution logs across all POCs
- `getExecutionStatistics(pocId?)`: Get execution statistics
- `createUploadFormData(data)`: Helper to create FormData for uploads

#### Upload Helper

```typescript
const formData = pocService.createUploadFormData({
  script: fileObject,
  cveId: 'CVE-2024-1234',
  name: 'Example POC',
  description: 'POC description',
  language: 'python',
  author: 'Security Researcher',
  usageExamples: 'python script.py --target http://example.com'
});

const uploadedPOC = await pocService.upload(formData);
```

## Error Handling

### Error Types

The API layer provides structured error handling with the `APIException` class:

```typescript
class APIException extends Error {
  status?: number;    // HTTP status code
  code?: string;      // Error code (NETWORK_ERROR, HTTP_ERROR, etc.)
  details?: any;      // Additional error details
}
```

### Common Error Codes

- **NETWORK_ERROR**: Network connectivity issues
- **HTTP_ERROR**: Server returned error status
- **REQUEST_ERROR**: Request configuration or validation error

### Retry Logic

The API layer automatically retries failed requests with the following behavior:

- **Retryable Errors**: Network errors, timeouts, 5xx server errors, 408/429 status codes
- **Non-Retryable Errors**: 4xx client errors (except 408/429)
- **Exponential Backoff**: Delay increases exponentially with each retry attempt
- **Configurable**: Retry attempts and delays can be configured per request or globally

## Testing

The API integration layer includes comprehensive tests:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with UI
npm run test:ui
```

### Test Coverage

- ✅ Service method signatures and availability
- ✅ Input validation and error handling
- ✅ Configuration validation
- ✅ Type safety and interface compliance
- ✅ Error exception creation and properties
- ✅ Form data helper functionality

## Examples

See `examples/api-usage.example.ts` for comprehensive usage examples including:

- Basic CRUD operations
- Advanced filtering and search
- File uploads and POC execution
- Error handling patterns
- React hook integration patterns

## Migration from Legacy API

If migrating from the previous API implementation:

1. **Import Changes**: Update imports to use the new service exports
2. **Method Signatures**: Some method signatures have been enhanced with additional options
3. **Error Handling**: Update error handling to use the new `APIException` class
4. **Configuration**: Add new environment variables for enhanced configuration

### Before

```typescript
import api, { cveService } from './api.service';

const cves = await cveService.getAll({ search: 'test' });
```

### After

```typescript
import { cveService } from './api.service';

const cves = await cveService.getAll({ 
  search: 'test',
  page: 1,
  limit: 20 
});
```

## Performance Considerations

- **Request Batching**: Consider batching multiple requests when possible
- **Caching**: Implement client-side caching for frequently accessed data
- **Pagination**: Use pagination for large datasets to improve performance
- **Timeouts**: Configure appropriate timeouts based on operation complexity
- **Retry Strategy**: Balance retry attempts with user experience

## Security Considerations

- **Input Validation**: All inputs are validated before sending to the API
- **URL Encoding**: All URL parameters are properly encoded
- **Command Validation**: POC execution commands are validated for dangerous patterns
- **File Upload Validation**: File types and sizes are validated during upload
- **Error Information**: Error messages don't expose sensitive system information