# CardNest KYC API Requirements

This document outlines the API endpoints needed for the KYC features implementation.

---

## 1. KYC Dashboard APIs

### 1.1 Get KYC Statistics
**Method:** `GET`  
**Endpoint:** `/api/kyc/dashboard/stats`

**Request:**
```json
{
  "business_id": "string"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "used": 750,
    "total": 1000,
    "remaining": 250,
    "usage_percentage": 75.0
  }
}
```

### 1.2 Get Monthly Verification Trends
**Method:** `GET`  
**Endpoint:** `/api/kyc/dashboard/trends`

**Request:**
```json
{
  "business_id": "string",
  "months": 6
}
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "month": "Jan",
      "verifications": 120
    },
    {
      "month": "Feb",
      "verifications": 180
    }
  ]
}
```

### 1.3 Get Recent KYC Transactions
**Method:** `GET`  
**Endpoint:** `/api/kyc/dashboard/transactions`

**Request:**
```json
{
  "business_id": "string",
  "limit": 10
}
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "customer_name": "John Smith",
      "type": "Individual KYC",
      "status": "Verified",
      "date": "2026-02-09",
      "amount": "$250"
    }
  ]
}
```

---

## 2. Face Verification APIs

### 2.1 Get All Face Verification Records
**Method:** `GET`  
**Endpoint:** `/api/kyc/face-verification`

**Request:**
```json
{
  "business_id": "string",
  "page": 1,
  "limit": 50
}
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "type": "Facial Recognition",
      "name": "John Smith",
      "decision": "Approved",
      "date": "2026-02-09",
      "expiry": "2027-02-09",
      "added": "2026-02-01",
      "verification_score": "98.5%",
      "match_confidence": "High",
      "image_quality": "Excellent",
      "liveness_check": "Passed"
    }
  ],
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 50,
    "total_pages": 2
  }
}
```

### 2.2 Get Single Face Verification Record
**Method:** `GET`  
**Endpoint:** `/api/kyc/face-verification/:id`

**Request:**
```json
{
  "business_id": "string",
  "id": 1
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "type": "Facial Recognition",
    "name": "John Smith",
    "decision": "Approved",
    "date": "2026-02-09",
    "expiry": "2027-02-09",
    "added": "2026-02-01",
    "verification_score": "98.5%",
    "match_confidence": "High",
    "image_quality": "Excellent",
    "liveness_check": "Passed"
  }
}
```

### 2.3 Delete Face Verification Record
**Method:** `DELETE`  
**Endpoint:** `/api/kyc/face-verification/:id`

**Request:**
```json
{
  "business_id": "string",
  "id": 1
}
```

**Response:**
```json
{
  "success": true,
  "message": "Face verification record deleted successfully"
}
```

### 2.4 Get Face Verification Stats
**Method:** `GET`  
**Endpoint:** `/api/kyc/face-verification/stats`

**Request:**
```json
{
  "business_id": "string"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "total": 5,
    "approved": 2,
    "pending": 2,
    "rejected": 1
  }
}
```

---

## 3. Documents Verifications APIs

### 3.1 Get All Document Verification Records
**Method:** `GET`  
**Endpoint:** `/api/kyc/documents-verification`

**Request:**
```json
{
  "business_id": "string",
  "page": 1,
  "limit": 50
}
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "issuer": "US Passport Office",
      "type": "Passport",
      "name": "John Smith",
      "decision": "Approved",
      "date": "2026-02-09",
      "expiry": "2030-06-15",
      "added": "2026-02-01",
      "document_number": "P123456789",
      "country_of_issue": "United States",
      "verification_method": "Automated OCR",
      "security_features": "Verified"
    }
  ],
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 50,
    "total_pages": 2
  }
}
```

### 3.2 Get Single Document Verification Record
**Method:** `GET`  
**Endpoint:** `/api/kyc/documents-verification/:id`

**Request:**
```json
{
  "business_id": "string",
  "id": 1
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "issuer": "US Passport Office",
    "type": "Passport",
    "name": "John Smith",
    "decision": "Approved",
    "date": "2026-02-09",
    "expiry": "2030-06-15",
    "added": "2026-02-01",
    "document_number": "P123456789",
    "country_of_issue": "United States",
    "verification_method": "Automated OCR",
    "security_features": "Verified"
  }
}
```

### 3.3 Delete Document Verification Record
**Method:** `DELETE`  
**Endpoint:** `/api/kyc/documents-verification/:id`

**Request:**
```json
{
  "business_id": "string",
  "id": 1
}
```

**Response:**
```json
{
  "success": true,
  "message": "Document verification record deleted successfully"
}
```

### 3.4 Get Documents Verification Stats
**Method:** `GET`  
**Endpoint:** `/api/kyc/documents-verification/stats`

**Request:**
```json
{
  "business_id": "string"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "total": 6,
    "approved": 3,
    "pending": 2,
    "rejected": 1
  }
}
```

---

## Common Response Structures

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Error message description"
  }
}
```

---

## Notes for Backend Developer

1. **Authentication:** All endpoints require business authentication. Include business_id in requests or use JWT token.

2. **Pagination:** List endpoints should support pagination with `page` and `limit` parameters.

3. **Status Values:** 
   - Decision statuses: `Approved`, `Pending`, `Rejected`
   - Face verification liveness: `Passed`, `Failed`, `Pending`
   - Document security: `Verified`, `Failed`, `Pending`

4. **Date Format:** Use ISO 8601 format (YYYY-MM-DD) for all dates.

5. **Soft Delete:** Consider implementing soft delete for records instead of permanent deletion.

6. **Authorization:** Ensure users can only access their own business KYC data.

7. **Rate Limiting:** Implement rate limiting on all endpoints.

8. **Logging:** Log all KYC operations for audit trail.
