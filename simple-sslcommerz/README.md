# simple-sslcommerz

🚀 **Professional TypeScript library for SSLCommerz payment gateway integration**

A comprehensive, type-safe, and runtime-agnostic utility for integrating SSLCommerz payment gateway in your applications. Works seamlessly with Node.js, Bun, Deno, and Edge Workers.

[![npm version](https://badge.fury.io/js/@mesilicon7%2Fsimple-sslcommerz.svg)](https://badge.fury.io/js/@mesilicon7%2Fsimple-sslcommerz)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-green.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)

## ✨ Features

- 🔒 **Type-Safe**: Full TypeScript support with comprehensive type definitions
- 🌐 **Runtime Agnostic**: Works with Node.js, Bun, Deno, and Edge Workers
- ⚡ **Modern**: Built with modern JavaScript APIs (fetch, URL, URLSearchParams)
- 🛡️ **Secure**: Input validation and sanitization built-in
- 📝 **Well Documented**: Comprehensive JSDoc comments and examples
- 🔍 **Debugging**: Built-in logging system for development and troubleshooting
- 🔄 **Complete**: Payment initiation, validation, and refund support
- 🎯 **Zero Dependencies**: No external dependencies, lightweight and fast

## 📦 Installation

```bash
# npm
npm install @mesilicon7/simple-sslcommerz

# yarn
yarn add @mesilicon7/simple-sslcommerz

# pnpm
pnpm add @mesilicon7/simple-sslcommerz

# bun
bun add @mesilicon7/simple-sslcommerz
```

## 🚀 Quick Start

### Basic Setup

```typescript
import { createSSLCommerzUtil, createSSLCommerzConfig } from '@mesilicon7/simple-sslcommerz';

// Create configuration
const config = createSSLCommerzConfig({
  store_id: "your_store_id",
  store_passwd: "your_store_password",
  is_live: false, // true for production
  success_url: "https://yourdomain.com/payment-success",
  fail_url: "https://yourdomain.com/payment-fail",
  cancel_url: "https://yourdomain.com/payment-cancel",
  ipn_url: "https://yourdomain.com/payment-ipn",
  debug: true // Enable logging during development
});

// Initialize SSLCommerz utility
const sslcommerz = createSSLCommerzUtil(config);
```

### Initiate Payment

```typescript
// Prepare payment data
const paymentData = {
  total_amount: 1000.50,
  tran_id: sslcommerz.generateTransactionId("ORDER"),
  cus_name: "John Doe",
  cus_email: "john@example.com",
  cus_phone: "01700000000",
  product_name: "Premium Package",
  product_category: "Software"
};

// Initiate payment
try {
  const result = await sslcommerz.initPayment(paymentData);
  
  if (result.status === "SUCCESS") {
    // Redirect user to payment gateway
    const gatewayUrl = sslcommerz.getGatewayUrl(result);
    console.log("Redirect to:", gatewayUrl);
  } else {
    console.error("Payment initiation failed:", result.failedreason);
  }
} catch (error) {
  console.error("Error:", error.message);
}
```

### Validate Payment

```typescript
// In your success callback handler
app.post('/payment-success', async (req, res) => {
  try {
    const val_id = req.body.val_id || req.query.val_id;
    
    // Validate payment with SSLCommerz
    const validation = await sslcommerz.validatePayment(val_id);
    
    if (sslcommerz.isPaymentValid(validation)) {
      // Payment is verified and successful
      console.log(`Payment verified for transaction: ${validation.tran_id}`);
      console.log(`Amount: ${sslcommerz.formatAmount(validation.amount)}`);
      
      // Update your database, fulfill order, etc.
      await updateOrderStatus(validation.tran_id, 'paid');
      
      res.json({ success: true, message: 'Payment successful' });
    } else {
      res.status(400).json({ success: false, message: 'Payment validation failed' });
    }
  } catch (error) {
    console.error('Validation error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});
```

### Process Refund

```typescript
// Initiate refund
const refundData = {
  bank_tran_id: "1709162345070ANJdZV8LyI4cMw", // From original payment
  refund_amount: 500.00,
  refund_remarks: "Customer requested refund"
};

try {
  const refundResult = await sslcommerz.initiateRefund(refundData);
  
  if (sslcommerz.isRefundSuccessful(refundResult)) {
    console.log(`Refund initiated: ${refundResult.refund_ref_id}`);
    
    // Check refund status later
    const status = await sslcommerz.checkRefundStatus(refundResult.refund_ref_id);
    console.log(`Refund status: ${status.status}`);
  }
} catch (error) {
  console.error("Refund failed:", error.message);
}
```

## 🔧 Configuration Options

### Complete Configuration Example

```typescript
const config = createSSLCommerzConfig({
  // Required fields
  store_id: "your_store_id",           // Your SSLCommerz store ID
  store_passwd: "your_store_password", // Your SSLCommerz store password
  is_live: false,                      // true for production, false for sandbox
  success_url: "/payment-success",     // Success callback URL
  fail_url: "/payment-fail",           // Failure callback URL
  cancel_url: "/payment-cancel",       // Cancel callback URL
  ipn_url: "/payment-ipn",             // IPN notification URL
  
  // Optional fields
  store_name: "My Awesome Store",      // Store name for branding
  base_url: "https://yourdomain.com",  // Base URL for relative URLs
  debug: true,                         // Enable debug logging
  skip_url_validation: false           // Skip URL validation (not recommended)
});
```

### Environment Variables Setup

```typescript
// .env file
SSLCOMMERZ_STORE_ID=your_store_id
SSLCOMMERZ_STORE_PASSWORD=your_store_password
SSLCOMMERZ_IS_LIVE=false
BASE_URL=https://yourdomain.com

// Usage in code
const config = createSSLCommerzConfig({
  store_id: process.env.SSLCOMMERZ_STORE_ID!,
  store_passwd: process.env.SSLCOMMERZ_STORE_PASSWORD!,
  is_live: process.env.SSLCOMMERZ_IS_LIVE === 'true',
  base_url: process.env.BASE_URL,
  success_url: "/api/payment/success",
  fail_url: "/api/payment/fail",
  cancel_url: "/api/payment/cancel",
  ipn_url: "/api/payment/ipn"
});
```

## 📚 Advanced Usage

### Custom Transaction ID Generation

```typescript
// Generate transaction ID with custom prefix and suffix
const tran_id = sslcommerz.generateTransactionId("ORDER", "001");
// Result: "ORDER1634567890123456001"

// Or use your own format
const customTranId = `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
```

### Complete Payment Flow Example

```typescript
class PaymentService {
  private sslcommerz: SSLCommerzUtil;
  
  constructor() {
    const config = createSSLCommerzConfig({
      store_id: process.env.SSLCOMMERZ_STORE_ID!,
      store_passwd: process.env.SSLCOMMERZ_STORE_PASSWORD!,
      is_live: process.env.NODE_ENV === 'production',
      success_url: "/api/payment/success",
      fail_url: "/api/payment/fail",
      cancel_url: "/api/payment/cancel",
      ipn_url: "/api/payment/ipn",
      base_url: process.env.BASE_URL
    });
    
    this.sslcommerz = createSSLCommerzUtil(config);
  }
  
  async createPayment(orderData: any) {
    const paymentData = {
      total_amount: orderData.amount,
      tran_id: this.sslcommerz.generateTransactionId("ORDER"),
      cus_name: orderData.customer.name,
      cus_email: orderData.customer.email,
      cus_phone: orderData.customer.phone,
      product_name: orderData.product.name,
      product_category: orderData.product.category,
      cus_add1: orderData.customer.address,
      cus_city: orderData.customer.city,
      cus_postcode: orderData.customer.postcode
    };
    
    // Validate payment data
    const errors = this.sslcommerz.validatePaymentData(paymentData);
    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(', ')}`);
    }
    
    // Save pending payment to database
    await this.savePendingPayment(paymentData);
    
    // Initiate payment with SSLCommerz
    const result = await this.sslcommerz.initPayment(paymentData);
    
    if (result.status === "SUCCESS") {
      return {
        success: true,
        gateway_url: this.sslcommerz.getGatewayUrl(result),
        session_key: result.sessionkey
      };
    } else {
      throw new Error(`Payment initiation failed: ${result.failedreason}`);
    }
  }
  
  async verifyPayment(val_id: string) {
    const validation = await this.sslcommerz.validatePayment(val_id);
    
    if (this.sslcommerz.isPaymentValid(validation)) {
      // Update payment status in database
      await this.updatePaymentStatus(validation.tran_id, 'completed', validation);
      return { success: true, validation };
    } else {
      await this.updatePaymentStatus(validation.tran_id, 'failed', validation);
      return { success: false, validation };
    }
  }
  
  async processRefund(bank_tran_id: string, amount: number, reason: string) {
    const refundData = {
      bank_tran_id,
      refund_amount: amount,
      refund_remarks: reason
    };
    
    const result = await this.sslcommerz.initiateRefund(refundData);
    
    if (this.sslcommerz.isRefundSuccessful(result)) {
      await this.saveRefundRecord(result);
      return { success: true, refund_ref_id: result.refund_ref_id };
    } else {
      throw new Error(`Refund failed: ${result.errorReason}`);
    }
  }
}
```

## 🌐 Runtime Compatibility

### Node.js

```typescript
// Works out of the box with Node.js 18+
import { createSSLCommerzUtil } from '@mesilicon7/simple-sslcommerz';
```

### Bun

```typescript
// Full compatibility with Bun runtime
import { createSSLCommerzUtil } from '@mesilicon7/simple-sslcommerz';
```

### Deno

```typescript
// Import from npm: or jsr: registry
import { createSSLCommerzUtil } from "npm:@mesilicon7/simple-sslcommerz";
```

### Edge Workers (Cloudflare, Vercel)

```typescript
// Works in edge environments with fetch API
import { createSSLCommerzUtil } from '@mesilicon7/simple-sslcommerz';

export default async function handler(request: Request) {
  const sslcommerz = createSSLCommerzUtil(config);
  // ... your payment logic
}
```

## 🔍 Debugging and Troubleshooting

### Enable Debug Logging

```typescript
const config = createSSLCommerzConfig({
  // ... other config
  debug: true  // This will log all API calls and responses
});
```

### Common Issues and Solutions

1. **Invalid URL errors**: Ensure your URLs are absolute or provide a `base_url`
2. **Validation failures**: Check that all required fields are provided
3. **Network errors**: Verify your credentials and network connectivity
4. **Amount validation**: Ensure amounts are between 10 and 500,000 BDT

### Error Handling

```typescript
try {
  const result = await sslcommerz.initPayment(paymentData);
} catch (error) {
  console.error('Error code:', error.code);
  console.error('Error message:', error.message);
  console.error('Error details:', error.details);
  
  // Handle specific error types
  switch (error.code) {
    case 'VALIDATION_ERROR':
      // Handle validation errors
      break;
    case 'NETWORK_ERROR':
      // Handle network issues
      break;
    case 'HTTP_ERROR':
      // Handle HTTP errors
      break;
  }
}
```

## 📖 API Reference

### Main Classes and Functions

#### `createSSLCommerzConfig(params)`
Creates and validates SSLCommerz configuration.

#### `createSSLCommerzUtil(config)`
Creates SSLCommerzUtil instance with the provided configuration.

#### `SSLCommerzUtil`
Main utility class for payment operations.

**Methods:**
- `initPayment(paymentData)` - Initiate a payment session
- `validatePayment(val_id)` - Validate a completed payment
- `initiateRefund(refundData)` - Process a refund request
- `checkRefundStatus(refund_ref_id)` - Check refund status
- `generateTransactionId(prefix?, suffix?)` - Generate unique transaction ID
- `isPaymentValid(validation)` - Check if payment is valid
- `isRefundSuccessful(refundResponse)` - Check if refund was successful
- `validatePaymentData(data)` - Validate payment data
- `formatAmount(amount, currency?)` - Format amount for display

### TypeScript Interfaces

- `SSLCommerzConfig` - Configuration interface
- `PaymentData` - Payment initiation data
- `SSLCommerzResponse` - Payment initiation response
- `ValidationResponse` - Payment validation response
- `RefundData` - Refund request data
- `RefundResponse` - Refund response
- `SSLCommerzError` - Extended error interface

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](./LICENSE) file for details.

## 🔗 Links

TODO: Add relevant links here.

## 🙏 Acknowledgments

- SSLCommerz for providing the payment gateway service
- The TypeScript community for excellent tooling

---

Made with ❤️ by [Mesilicon7](https://github.com/mesilicon7)
