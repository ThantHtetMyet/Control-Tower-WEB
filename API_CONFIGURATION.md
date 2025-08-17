# API Configuration Guide

## How to Change the API URL

To change the API server URL for the entire application, you only need to modify **one file**:

### File Location
```
src/config/apiConfig.js
```

### Current Configuration
```javascript
export const API_BASE_URL = 'https://localhost:7145';
export const API_URL = `${API_BASE_URL}/api`;
```

### To Change the API URL
1. Open `src/config/apiConfig.js`
2. Change the `API_BASE_URL` value to your desired API server URL
3. Save the file

### Example
To change from `https://localhost:7145` to `https://api.mycompany.com`:

```javascript
export const API_BASE_URL = 'https://api.mycompany.com';
export const API_URL = `${API_BASE_URL}/api`;
```

### Files Updated
The following files have been updated to use the centralized configuration:

**API Services:**
- `src/components/api-services/api.js`
- `src/components/api-services/authService.js`
- `src/components/api-services/accessLevelService.js`

**EMS Components:**
- `src/components/ems/EmployeeForm.js`
- `src/components/ems/EmployeeEdit.js`
- `src/components/ems/EmployeeList.js`
- `src/components/ems/EmployeeDetails.js`
- `src/components/ems/DepartmentForm.js`
- `src/components/ems/DepartmentEdit.js`
- `src/components/ems/DepartmentList.js`
- `src/components/ems/OccupationForm.js`
- `src/components/ems/OccupationEdit.js`
- `src/components/ems/OccupationList.js`

**Service Report Components:**
- `src/components/service-report/ServiceReportForm.js`
- `src/components/service-report/ServiceReportEdit.js`

**Note:** Components that use the `api` instance from `api-services/api.js` (like `employeeService.js`, `applicationService.js`, and `employeeApplicationAccessService.js`) automatically inherit the centralized configuration.