# Wallet System Documentation

## Overview
A secure wallet system with ZarinPal payment gateway integration for user wallet recharging.

## Features

### 🔐 Security Features
- Input validation and sanitization
- Payment amount limits (1,000 - 50,000,000 Toman)
- Secure order ID generation
- Request validation middleware
- User authentication required
- Duplicate payment prevention

### 💳 Payment Gateway
- ZarinPal integration
- Real-time payment verification
- Automatic callback handling
- Success/failure page redirects
- Transaction status tracking

### 💰 Wallet Management
- Real-time balance calculation
- Transaction history
- Income/outcome tracking
- Automatic balance updates
- Professional UI/UX

## API Endpoints

### Wallet APIs
- `GET /api/wallet` - Get wallet balance and recent transactions
- `GET /api/wallet/transactions` - Get paginated transaction history

### Payment APIs
- `POST /api/payment/request` - Create payment request
- `GET /api/payment/callback` - Handle ZarinPal callback
- `POST /api/payment/verify` - Verify payment manually

## Components

### Frontend Components
- `Wallet` - Main wallet component with recharge functionality
- `PaymentSuccess` - Success page with transaction details
- `PaymentFailed` - Failure page with error handling

### Backend Components
- Payment validation middleware
- Secure wallet transaction handling
- ZarinPal integration
- Database models for payments and wallet

## Database Models

### Payment Model
```typescript
{
  userId: ObjectId,
  amount: Number,
  description: String,
  status: 'pending' | 'paid' | 'failed' | 'cancelled' | 'verified' | 'refunded',
  authority: String,
  refId: Number,
  metadata: {
    type: 'wallet_recharge' | 'service_payment',
    timestamp: String,
    // ... other fields
  }
}
```

### Wallet Model
```typescript
{
  userId: ObjectId,
  inComes: [{
    amount: Number,
    tag: String,
    description: String,
    status: 'pending' | 'verified' | 'rejected',
    date: Date,
    verifiedAt: Date
  }],
  outComes: [/* similar structure */],
  balance: [{
    amount: Number,
    updatedAt: Date
  }]
}
```

## Usage

### Adding Wallet to Dashboard
The wallet is integrated into the dashboard with:
- Sidebar menu item
- Professional UI components
- Real-time data updates
- Secure payment processing

### Recharging Wallet
1. User clicks "شارژ کیف پول" button
2. Enters amount (min 1,000 Toman)
3. Redirected to ZarinPal gateway
4. Payment processed and verified
5. Wallet balance updated automatically

## Security Measures

### Input Validation
- Amount range validation
- Description length limits
- Currency validation
- Metadata sanitization

### Payment Security
- Duplicate payment prevention
- Secure callback validation
- Transaction status verification
- User authentication required

### Error Handling
- Comprehensive error messages
- Graceful failure handling
- Transaction rollback on errors
- Detailed logging

## Integration

### Dashboard Integration
```typescript
// Added to dashboard menu
{
  id: "wallet",
  title: "کیف پول",
  icon: <FaWallet />,
  color: "from-green-500 to-green-600",
  subMenuItems: [
    { title: "کیف پول من", value: "wallet", icon: <FaWallet /> },
  ],
}
```

### Component Usage
```typescript
import { Wallet } from "./components/wallet";

// In dashboard render function
wallet: <Wallet />,
```

## Configuration

### Environment Variables
- `NEXT_PUBLIC_APP_URL` - Application base URL for callbacks
- ZarinPal merchant ID configured in `lib/zarinpal.ts`

### Payment Limits
- Minimum: 1,000 Toman
- Maximum: 50,000,000 Toman
- Configurable in validation middleware

## Testing

### Test Scenarios
1. Successful wallet recharge
2. Payment cancellation
3. Duplicate payment handling
4. Invalid amount validation
5. Network error handling

### ZarinPal Sandbox
Switch to sandbox URLs in `lib/zarinpal.ts` for testing:
```typescript
const ZARINPAL_REQUEST_URL = 'https://sandbox.zarinpal.com/pg/v4/payment/request.json';
const ZARINPAL_VERIFY_URL = 'https://sandbox.zarinpal.com/pg/v4/payment/verify.json';
const ZARINPAL_GATEWAY_URL = 'https://sandbox.zarinpal.com/pg/StartPay/';
```

## Monitoring

### Logging
- Payment requests logged
- Callback events tracked
- Error conditions recorded
- Transaction status changes logged

### Error Tracking
- Validation errors
- Payment gateway errors
- Database operation errors
- Network connectivity issues

## Future Enhancements

### Potential Features
- Withdrawal functionality
- Transaction export
- Payment history filtering
- Recurring payments
- Multi-currency support
- Mobile app integration

### Performance Optimizations
- Transaction pagination
- Caching strategies
- Database indexing
- API rate limiting

## Support

### Common Issues
1. **Payment not reflecting**: Check callback logs and payment status
2. **Validation errors**: Verify amount limits and required fields
3. **Gateway timeouts**: Implement retry mechanisms
4. **Balance discrepancies**: Recalculate from transaction history

### Troubleshooting
- Check browser console for client errors
- Review server logs for API errors
- Verify ZarinPal merchant configuration
- Test with sandbox environment first