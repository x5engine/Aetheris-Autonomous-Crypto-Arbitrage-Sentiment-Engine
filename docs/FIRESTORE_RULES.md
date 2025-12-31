# Firestore Security Rules Documentation

## Overview

This document explains the Firestore security rules implementation for the Aetheris trading system.

## Rule Files

- **`firestore.rules`** - Main rules file (balanced security)
- **`firestore.rules.dev`** - Development rules (permissive)
- **`firestore.rules.production`** - Production rules (strict)

## Collections

### 1. `market_ticks`

**Purpose**: Real-time market price data

**Access Control**:
- **Read**: Public (or authenticated in production)
- **Write**: Only Cloud Functions (using Admin SDK)

**Data Validation**:
- Required fields: `asset`, `exchange_a_price`, `exchange_b_price`, `timestamp`, `symbol`
- All fields must be correct types
- Prices must be positive numbers

**Rationale**: Market data should be publicly readable for real-time display, but only Cloud Functions should write to maintain data integrity.

### 2. `opportunities`

**Purpose**: Arbitrage opportunities detected by the system

**Access Control**:
- **Read**: Public (or authenticated in production)
- **Create**: Authenticated users (with validation)
- **Update**: Authenticated users (limited fields)
- **Delete**: Never allowed (audit trail)

**Data Validation**:
- Required fields: `status`, `symbol`, `spread_pct`, `projected_profit`, `risk_level`, `timestamp`
- Status must be one of: `DETECTED`, `ANALYZING`, `EXECUTED`, `REJECTED`, `BLOCKED`
- Risk level must be one of: `LOW`, `MEDIUM`, `HIGH`, `CRITICAL`
- Allowed update fields: `status`, `ai_validation`, `updated_at`, `executed_at`, `order_id`, `trade_size`, `trade_side`, `ai_log_uploaded`, `ai_log_uploaded_at`, `compliance_check`

**Rationale**: Frontend needs to update opportunities with sentiment analysis results. Status transitions are validated to prevent invalid state changes.

### 3. `audit_logs`

**Purpose**: Immutable audit trail of all system actions

**Access Control**:
- **Read**: Authenticated users only
- **Write**: Only Cloud Functions (immutable)

**Data Validation**:
- Required fields: `action`, `timestamp`
- All fields must be correct types

**Rationale**: Audit logs are immutable and should only be written by Cloud Functions. Authenticated users can read for transparency.

## Security Features

### 1. Data Validation

All write operations validate:
- Required fields are present
- Field types are correct
- Values are within valid ranges
- Status transitions are valid

### 2. Field-Level Updates

For `opportunities`, updates are restricted to specific fields:
- Prevents tampering with critical data
- Allows necessary updates (sentiment analysis, execution status)
- Maintains data integrity

### 3. Status Transition Validation

Opportunity status can only transition to valid states:
- `DETECTED` → `ANALYZING`, `REJECTED`, `BLOCKED`
- `ANALYZING` → `EXECUTED`, `REJECTED`, `BLOCKED`
- `EXECUTED`, `REJECTED`, `BLOCKED` → (final states)

### 4. Immutable Collections

- `market_ticks`: Frontend cannot write (data integrity)
- `audit_logs`: Frontend cannot write (immutable audit trail)

## Cloud Functions

Cloud Functions use the Firebase Admin SDK, which **bypasses all security rules**. This is intentional and necessary because:

1. Functions need to write to `market_ticks` and `audit_logs`
2. Functions need to create `opportunities`
3. Functions run with elevated privileges

**Security**: Cloud Functions are secured by:
- Firebase IAM roles
- Environment variables (secrets)
- Function-level authentication
- HTTPS-only endpoints

## Development vs Production

### Development Rules (`firestore.rules.dev`)
- **Purpose**: Local testing and development
- **Access**: Allow all reads and writes
- **Use**: Only with Firebase emulators
- **Warning**: Never deploy to production!

### Production Rules (`firestore.rules.production`)
- **Purpose**: Production deployment
- **Access**: Strict authentication required
- **Validation**: Enhanced data validation
- **Security**: Email verification, field restrictions

### Main Rules (`firestore.rules`)
- **Purpose**: Balanced security for most use cases
- **Access**: Public read, authenticated write
- **Validation**: Standard data validation
- **Use**: Default rules for deployment

## Deployment

### Deploy Rules

```bash
# Deploy main rules
firebase deploy --only firestore:rules

# Or use specific rules file
firebase deploy --only firestore:rules --config firebase.prod.json
```

### Test Rules

```bash
# Test rules locally with emulator
firebase emulators:start --only firestore

# Rules are automatically loaded from firestore.rules
```

## Testing Rules

### Test Script

```javascript
// Example: Test opportunity creation
const db = getFirestore();
const opportunityRef = db.collection('opportunities').doc();

await opportunityRef.set({
  status: 'DETECTED',
  symbol: 'cmt_btcusdt',
  spread_pct: 1.25,
  projected_profit: 45.00,
  risk_level: 'LOW',
  timestamp: new Date().toISOString()
});
```

### Common Issues

1. **"Missing or insufficient permissions"**
   - Check if user is authenticated
   - Verify required fields are present
   - Check field types match rules

2. **"Invalid status transition"**
   - Verify status is in allowed list
   - Check status transition is valid

3. **"Field validation failed"**
   - Verify all required fields are present
   - Check field types are correct
   - Ensure values are within valid ranges

## Best Practices

1. **Always validate data** before writing
2. **Use field-level updates** to prevent tampering
3. **Maintain audit trails** (never allow deletion)
4. **Test rules** with emulator before deployment
5. **Review rules** regularly for security updates
6. **Monitor** rule violations in Firebase Console

## Rule Maintenance

### Adding New Collections

1. Add match block in `firestore.rules`
2. Define access control (read/write)
3. Add data validation functions
4. Test with emulator
5. Deploy and monitor

### Updating Existing Rules

1. Test changes locally first
2. Use Firebase Console Rules Playground
3. Deploy to staging first
4. Monitor for errors
5. Deploy to production

## Security Considerations

1. **Authentication**: Require auth for sensitive operations
2. **Validation**: Always validate data structure
3. **Rate Limiting**: Consider adding rate limits
4. **Field Restrictions**: Limit which fields can be updated
5. **Immutable Data**: Never allow deletion of audit logs
6. **Status Validation**: Validate state transitions

## References

- [Firestore Security Rules Documentation](https://firebase.google.com/docs/firestore/security/get-started)
- [Firestore Rules Playground](https://console.firebase.google.com/project/_/firestore/rules)
- [Firebase Admin SDK](https://firebase.google.com/docs/admin/setup)

