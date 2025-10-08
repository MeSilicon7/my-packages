import { Hono } from "hono";
// import 'dotenv/config';
import { 
  createSSLCommerzUtil, 
  createSSLCommerzConfig,
  PaymentData,
  RefundData
} from '../../src/index';

const app = new Hono();
  
// Simple configuration - user provides all values
const sslConfig = createSSLCommerzConfig({
  store_id: "testbox",
  store_passwd: "qwerty", 
  store_name: 'testbox',
  is_live: false,
  // Important URLs - now we can use relative URLs
  success_url: `/payment-success`,
  fail_url: `/payment-fail`,
  cancel_url: `/payment-cancel`,
  ipn_url: `/payment-ipn`,
  // Add base_url for the relative URLs to work properly
  base_url: "http://localhost:8787", // Replace with your actual domain in production
  debug: true
});

const sslcommerz = createSSLCommerzUtil(sslConfig);

// Serve static frontend
app.get("/", (c) => {
  const envInfo = sslConfig.is_live ? 'LIVE (Production)' : 'SANDBOX (Test)';
  
  return c.html(`
    <!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>SSLCommerz + Hono Demo</title>
  <style>
    body { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; }
    .env-badge { 
      background: ${sslConfig.is_live ? '#dc3545' : '#28a745'}; 
      color: white; padding: 5px 10px; border-radius: 3px; font-size: 12px; 
    }
    input, button { padding: 10px; margin: 5px 0; width: 100%; }
    button { background: #007bff; color: white; border: none; cursor: pointer; }
    button:hover { background: #0056b3; }
    .nav-section {
      margin: 30px 0;
      padding: 20px;
      background: #f8f9fa;
      border-radius: 8px;
    }
    .nav-links {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
    }
    .nav-links a {
      display: inline-block;
      padding: 10px 15px;
      color: white;
      text-decoration: none;
      border-radius: 4px;
      font-size: 14px;
      text-align: center;
      flex: 1;
      min-width: 120px;
    }
    .verify-btn { background: #17a2b8; }
    .refund-btn { background: #dc3545; }
    .status-btn { background: #6c757d; }
    .nav-links a:hover { opacity: 0.9; }
  </style>
</head>
<body>
  <h1>💳 SSLCommerz Payment Demo</h1>
  <div>
    <span class="env-badge">Environment: ${envInfo}</span>
  </div>
  <br><br>
  
  <form id="payment-form">
    <label>Amount (BDT):</label>
    <input type="number" id="amount" value="1000" min="10" max="500000" required />

    <label>Name:</label>
    <input type="text" id="name" value="John Doe" required />

    <label>Email:</label>
    <input type="email" id="email" value="john@example.com" required />

    <label>Phone:</label>
    <input type="text" id="phone" value="01700000000" required />

    <button type="submit">Pay Now</button>
  </form>

  <div class="nav-section">
    <h3>Other Actions</h3>
    <div class="nav-links">
      <a href="/verify-payment" class="verify-btn">Verify Payment</a>
      <a href="/refund" class="refund-btn">Request Refund</a>
      <a href="/refund-status" class="status-btn">Check Refund Status</a>
    </div>
  </div>

  <script>
    const form = document.getElementById("payment-form");
    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const button = e.target.querySelector('button');
      const originalText = button.textContent;
      button.textContent = 'Processing...';
      button.disabled = true;

      try {
        const amount = document.getElementById("amount").value;
        const cus_name = document.getElementById("name").value;
        const cus_email = document.getElementById("email").value;
        const cus_phone = document.getElementById("phone").value;

        const res = await fetch("/init-payment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ amount, cus_name, cus_email, cus_phone }),
        });

        const data = await res.json();
        
        if (data.url) {
          window.location.href = data.url;
        } else {
          alert("Payment initiation failed: " + (data.message || 'Unknown error'));
          console.error('Payment Error:', data);
        }
      } catch (error) {
        alert("Network error occurred. Please try again.");
        console.error('Network Error:', error);
      } finally {
        button.textContent = originalText;
        button.disabled = false;
      }
    });
  </script>
</body>
</html>
`)
});

// Create Payment Session - Enhanced with better error handling
app.post("/init-payment", async (c) => {
  try {
    const { amount, cus_name, cus_email, cus_phone } = await c.req.json();

    const paymentData: PaymentData = {
      total_amount: parseFloat(amount),
      tran_id: sslcommerz.generateTransactionId("DEMO", new Date().getTime().toString().slice(-4)),
      cus_name: cus_name?.trim(),
      cus_email: cus_email?.trim(),
      cus_phone: cus_phone?.trim(),
      product_name: "Demo Product",
      product_category: "Demo",
      cus_add1: "Dhaka",
      cus_city: "Dhaka",
      cus_postcode: "1000",
      cus_country: "Bangladesh",
    };

    console.log("🚀 Initiating payment request...");

    const result = await sslcommerz.initPayment(paymentData);
    const gatewayUrl = sslcommerz.getGatewayUrl(result);

    if (gatewayUrl) {
      return c.json({ 
        success: true,
        url: gatewayUrl,
        sessionkey: result.sessionkey
      });
    } else {
      return c.json({ 
        success: false,
        message: result.failedreason || "Payment session creation failed",
        error: result 
      }, 400);
    }
  } catch (error: any) {
    console.error("💥 Init Payment Error:", error);
    
    return c.json({ 
      success: false,
      message: error.message || "Internal Server Error",
      code: error.code || 'UNKNOWN_ERROR'
    }, 500);
  }
});

// Success Callback - Enhanced validation
app.get("/payment-success", async (c) => {
  const query = c.req.query();
  console.log("✅ Payment Success (GET):", query);
  
  const val_id = sslcommerz.extractValidationId(query);
  if (val_id) {
    return await validateAndShowResult(c, val_id);
  }
  
  return c.html(`<h1>✅ Payment Completed</h1><p>⚠️ Validation ID not found in response.</p>`);
});

app.post("/payment-success", async (c) => {
  const body = await c.req.parseBody();
  console.log("✅ Payment Success (POST):", body);

  const val_id = sslcommerz.extractValidationId(body);
  if (val_id) {
    return await validateAndShowResult(c, val_id);
  }
  
  return c.html(`<h1>✅ Payment Completed</h1><p>⚠️ Validation ID not found in response.</p>`);
});

// Enhanced validation helper
async function validateAndShowResult(c: any, val_id: string) {
  try {
    console.log("🔍 Validating payment with val_id:", val_id);
    const validation = await sslcommerz.validatePayment(val_id);

    if (sslcommerz.isPaymentValid(validation)) {
      return c.html(`
        <div style="font-family: Arial; max-width: 600px; margin: 50px auto; text-align: center;">
          <h1 style="color: #28a745;">✅ Payment Successful & Validated!</h1>
          <div style="background: #d4edda; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <p><strong>Transaction ID:</strong> ${validation.tran_id}</p>
            <p><strong>Amount:</strong> ${sslcommerz.formatAmount(validation.amount, validation.currency)}</p>
            <p><strong>Payment Method:</strong> ${validation.card_type || 'N/A'}</p>
            <p><strong>Risk Level:</strong> ${validation.risk_title || 'Unknown'}</p>
            <p><strong>Date:</strong> ${validation.tran_date || 'N/A'}</p>
          </div>
          <small>Validation ID: ${validation.val_id}</small>
        </div>
      `);
    } else {
      return c.html(`
        <div style="font-family: Arial; max-width: 600px; margin: 50px auto; text-align: center;">
          <h1 style="color: #dc3545;">⚠️ Payment Validation Failed!</h1>
          <div style="background: #f8d7da; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <p><strong>Status:</strong> ${validation.status}</p>
            <p><strong>Transaction ID:</strong> ${validation.tran_id}</p>
          </div>
        </div>
      `);
    }
  } catch (error: any) {
    console.error("💥 Validation Error:", error);
    return c.html(`
      <div style="font-family: Arial; max-width: 600px; margin: 50px auto; text-align: center;">
        <h1 style="color: #dc3545;">⚠️ Payment Validation Error!</h1>
        <p>Please contact support with reference: ${val_id}</p>
        <small>Error: ${error.message}</small>
      </div>
    `);
  }
}

// Fail Callback - Handle both GET and POST
app.get("/payment-fail", async (c) => {
  const query = c.req.query();
  console.log("Payment Failed (GET):", query);
  return c.html(`<h1>❌ Payment Failed</h1><p>Reason: ${query.error || 'Unknown error'}</p>`);
});

app.post("/payment-fail", async (c) => {
  console.log("Payment Failed:", await c.req.parseBody());
  return c.html(`<h1>❌ Payment Failed</h1>`);
});

// Cancel Callback - Handle both GET and POST
app.get("/payment-cancel", async (c) => {
  const query = c.req.query();
  console.log("Payment Cancelled (GET):", query);
  return c.html(`<h1>⚠️ Payment Cancelled</h1>`);
});

app.post("/payment-cancel", async (c) => {
  console.log("Payment Cancelled:", await c.req.parseBody());
  return c.html(`<h1>⚠️ Payment Cancelled</h1>`);
});

// IPN Listener
app.post("/payment-ipn", async (c) => {
  console.log("IPN Data:", await c.req.parseBody());
  return c.text("IPN received");
});

// Payment Status Verification - GET route for form
app.get("/verify-payment", async (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Payment Verification</title>
      <style>
        body { font-family: Arial, sans-serif; max-width: 500px; margin: 50px auto; padding: 20px; }
        .form-container { 
          background: #f5f5f5; 
          padding: 30px; 
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        h1 { color: #333; text-align: center; }
        input { 
          width: 100%; 
          padding: 10px; 
          margin: 10px 0 20px 0; 
          border: 1px solid #ddd; 
          border-radius: 4px;
          box-sizing: border-box;
        }
        button { 
          width: 100%; 
          padding: 12px; 
          background: #007bff; 
          color: white; 
          border: none; 
          border-radius: 4px; 
          cursor: pointer;
          font-size: 16px;
        }
        button:hover { background: #0056b3; }
      </style>
    </head>
    <body>
      <div class="form-container">
        <h1>Payment Verification</h1>
        <form action="/verify-payment" method="POST">
          <label for="tran_id">Transaction ID:</label>
          <input type="text" id="tran_id" name="tran_id" placeholder="Enter transaction ID" required>
          <button type="submit">Verify Payment</button>
        </form>
      </div>
    </body>
    </html>
  `);
});

// Payment Status Verification - POST route for checking status
app.post("/verify-payment", async (c) => {
  try {
    const body = await c.req.parseBody();
    const tran_id = body.tran_id as string;
    
    if (!tran_id) {
      return c.html(`
        <div style="font-family: Arial; max-width: 500px; margin: 50px auto; text-align: center;">
          <h1 style="color: #dc3545;">Error</h1>
          <p>Transaction ID is required</p>
          <a href="/verify-payment">Go back</a>
        </div>
      `);
    }

    console.log("🔍 Verifying payment with transaction ID:", tran_id);
    
    try {
      // Query for validation status - this is a simplified example
      // In a real application, you would typically:
      // 1. Look up the transaction ID in your database to get the val_id
      // 2. Or implement a custom API call to SSLCommerz to check transaction status
      
      // For this demo, we'll query SSLCommerz API directly
      const validateUrl = new URL('/validator/api/merchantTransIDvalidationAPI.php', 
        sslcommerz["baseUrl"]); // Accessing baseUrl property
        
      validateUrl.searchParams.append('tran_id', tran_id);
      validateUrl.searchParams.append('store_id', sslConfig.store_id);
      validateUrl.searchParams.append('store_passwd', sslConfig.store_passwd);
      validateUrl.searchParams.append('format', 'json');
      
      const response = await fetch(validateUrl.toString());
      
      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      console.log("Transaction verification result:", result);
      
      // Check if the API returned a valid result
      if (result && result.element) {
        // Extract the first transaction element
        const transaction = Array.isArray(result.element) ? result.element[0] : result.element;
        
        // Determine status
        const isSuccess = transaction && 
          (transaction.status === 'VALID' || 
           transaction.status === 'VALIDATED');
        
        // Show appropriate result
        if (isSuccess) {
          return c.html(`
            <div style="font-family: Arial; max-width: 600px; margin: 50px auto; text-align: center;">
              <h1 style="color: #28a745;">✅ Payment Successful!</h1>
              <div style="background: #d4edda; padding: 20px; border-radius: 5px; margin: 20px 0;">
                <p><strong>Transaction ID:</strong> ${transaction.tran_id}</p>
                <p><strong>Amount:</strong> ${transaction.amount} ${transaction.currency}</p>
                <p><strong>Status:</strong> ${transaction.status}</p>
                <p><strong>Payment Method:</strong> ${transaction.card_type || 'N/A'}</p>
                <p><strong>Date:</strong> ${transaction.tran_date || 'N/A'}</p>
              </div>
              <a href="/verify-payment" style="display: inline-block; padding: 10px 20px; background: #007bff; color: white; text-decoration: none; border-radius: 4px;">Check Another</a>
            </div>
          `);
        } else {
          return c.html(`
            <div style="font-family: Arial; max-width: 600px; margin: 50px auto; text-align: center;">
              <h1 style="color: #dc3545;">❌ Payment Not Successful</h1>
              <div style="background: #f8d7da; padding: 20px; border-radius: 5px; margin: 20px 0;">
                <p><strong>Transaction ID:</strong> ${transaction.tran_id || tran_id}</p>
                <p><strong>Status:</strong> ${transaction.status || 'Unknown'}</p>
                <p><strong>Message:</strong> ${transaction.error || 'Payment could not be verified'}</p>
              </div>
              <a href="/verify-payment" style="display: inline-block; padding: 10px 20px; background: #007bff; color: white; text-decoration: none; border-radius: 4px;">Try Again</a>
            </div>
          `);
        }
      } else {
        // No transaction found or invalid response
        return c.html(`
          <div style="font-family: Arial; max-width: 600px; margin: 50px auto; text-align: center;">
            <h1 style="color: #dc3545;">❓ Transaction Not Found</h1>
            <p>No payment record found with the provided transaction ID.</p>
            <p><strong>Transaction ID:</strong> ${tran_id}</p>
            <a href="/verify-payment" style="display: inline-block; padding: 10px 20px; background: #007bff; color: white; text-decoration: none; border-radius: 4px;">Try Again</a>
          </div>
        `);
      }
    } catch (error: any) {
      console.error("💥 Payment Verification Error:", error);
      
      return c.html(`
        <div style="font-family: Arial; max-width: 600px; margin: 50px auto; text-align: center;">
          <h1 style="color: #dc3545;">⚠️ Verification Error</h1>
          <p>Could not verify the payment status.</p>
          <p><small>Error: ${error.message}</small></p>
          <a href="/verify-payment" style="display: inline-block; padding: 10px 20px; background: #007bff; color: white; text-decoration: none; border-radius: 4px;">Try Again</a>
        </div>
      `);
    }
  } catch (error: any) {
    console.error("💥 Form Processing Error:", error);
    
    return c.html(`
      <div style="font-family: Arial; max-width: 500px; margin: 50px auto; text-align: center;">
        <h1 style="color: #dc3545;">Error</h1>
        <p>An error occurred while processing your request.</p>
        <p><small>${error.message}</small></p>
        <a href="/verify-payment">Go back</a>
      </div>
    `);
  }
});

// Refund Form - GET route
app.get("/refund", async (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Refund Request</title>
      <style>
        body { font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; }
        .form-container { 
          background: #f8f9fa; 
          padding: 30px; 
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        h1 { color: #333; text-align: center; margin-bottom: 30px; }
        .form-group { margin-bottom: 20px; }
        label { 
          display: block; 
          margin-bottom: 5px; 
          font-weight: bold; 
          color: #555;
        }
        input, textarea { 
          width: 100%; 
          padding: 12px; 
          border: 1px solid #ddd; 
          border-radius: 4px;
          box-sizing: border-box;
          font-size: 14px;
        }
        textarea { 
          height: 80px; 
          resize: vertical; 
        }
        button { 
          width: 100%; 
          padding: 15px; 
          background: #dc3545; 
          color: white; 
          border: none; 
          border-radius: 4px; 
          cursor: pointer;
          font-size: 16px;
          font-weight: bold;
        }
        button:hover { background: #c82333; }
        button:disabled { background: #6c757d; cursor: not-allowed; }
        .info-box {
          background: #e7f3ff;
          border: 1px solid #b3d9ff;
          padding: 15px;
          border-radius: 4px;
          margin-bottom: 20px;
          font-size: 14px;
        }
        .nav-links {
          text-align: center;
          margin-top: 20px;
        }
        .nav-links a {
          display: inline-block;
          margin: 0 10px;
          padding: 8px 16px;
          background: #007bff;
          color: white;
          text-decoration: none;
          border-radius: 4px;
          font-size: 14px;
        }
        .nav-links a:hover { background: #0056b3; }
      </style>
    </head>
    <body>
      <div class="form-container">
        <h1>💸 Request Refund</h1>
        
        <div class="info-box">
          <strong>Note:</strong> You need the bank transaction ID from a successful payment to process a refund. 
          This can be found in the payment validation response or transaction history.
        </div>

        <form id="refund-form">
          <div class="form-group">
            <label for="bank_tran_id">Bank Transaction ID:</label>
            <input type="text" id="bank_tran_id" name="bank_tran_id" 
                   placeholder="e.g., 191210151005956" required>
          </div>

          <div class="form-group">
            <label for="refund_amount">Refund Amount (BDT):</label>
            <input type="number" id="refund_amount" name="refund_amount" 
                   value="100" min="1" max="500000" step="0.01" required>
          </div>

          <div class="form-group">
            <label for="refund_remarks">Refund Reason (Optional):</label>
            <textarea id="refund_remarks" name="refund_remarks" 
                      placeholder="e.g., Customer requested refund due to order cancellation"></textarea>
          </div>

          <div class="form-group">
            <label for="refe_id">Reference ID (Optional):</label>
            <input type="text" id="refe_id" name="refe_id" 
                   placeholder="Optional reference for your records">
          </div>

          <button type="submit">Process Refund</button>
        </form>

        <div class="nav-links">
          <a href="/">← Back to Payment</a>
          <a href="/verify-payment">Verify Payment</a>
          <a href="/refund-status">Check Refund Status</a>
        </div>
      </div>

      <script>
        const form = document.getElementById("refund-form");
        form.addEventListener("submit", async (e) => {
          e.preventDefault();

          const button = e.target.querySelector('button');
          const originalText = button.textContent;
          button.textContent = 'Processing Refund...';
          button.disabled = true;

          try {
            const formData = new FormData(e.target);
            const data = Object.fromEntries(formData);

            const res = await fetch("/process-refund", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(data),
            });

            const result = await res.json();
            
            if (result.success) {
              alert("Refund request submitted successfully!");
              // Redirect to refund status page or show success message
              window.location.href = \`/refund-result?success=true&ref_id=\${result.refund_ref_id || ''}\`;
            } else {
              alert("Refund failed: " + (result.message || 'Unknown error'));
              console.error('Refund Error:', result);
            }
          } catch (error) {
            alert("Network error occurred. Please try again.");
            console.error('Network Error:', error);
          } finally {
            button.textContent = originalText;
            button.disabled = false;
          }
        });
      </script>
    </body>
    </html>
  `);
});

// Process Refund - POST route
app.post("/process-refund", async (c) => {
  try {
    const { bank_tran_id, refund_amount, refund_remarks, refe_id } = await c.req.json();

    const refundData: RefundData = {
      bank_tran_id: bank_tran_id?.trim(),
      refund_amount: parseFloat(refund_amount),
      refund_remarks: refund_remarks?.trim() || "Customer requested refund",
      refe_id: refe_id?.trim() || undefined,
    };

    console.log("🔄 Processing refund request...", refundData);

    const result = await sslcommerz.initiateRefund(refundData);

    console.log("🔄 Refund API Response:", result);

    // Check for successful API connection first
    if (result.APIConnect === "DONE") {
      if (result.status === "success") {
        return c.json({ 
          success: true,
          message: "Refund processed successfully",
          refund_ref_id: result.refund_ref_id,
          bank_tran_id: result.bank_tran_id,
          trans_id: result.trans_id,
          status: result.status,
          APIConnect: result.APIConnect
        });
      } else if (result.status === "processing") {
        return c.json({ 
          success: true,
          message: "Refund is already being processed",
          refund_ref_id: result.refund_ref_id,
          bank_tran_id: result.bank_tran_id,
          trans_id: result.trans_id,
          status: result.status,
          APIConnect: result.APIConnect
        });
      } else {
        return c.json({ 
          success: false,
          message: result.errorReason || `Refund failed with status: ${result.status}`,
          details: result 
        }, 400);
      }
    } else {
      // Handle API connection issues
      let errorMessage = "API connection failed";
      switch (result.APIConnect) {
        case "INVALID_REQUEST":
          errorMessage = "Invalid request data provided";
          break;
        case "FAILED":
          errorMessage = "API authentication failed";
          break;
        case "INACTIVE":
          errorMessage = "Store ID is inactive";
          break;
        default:
          errorMessage = `API connection error: ${result.APIConnect}`;
      }
      
      return c.json({ 
        success: false,
        message: errorMessage,
        details: result 
      }, 400);
    }
  } catch (error: any) {
    console.error("💥 Refund Processing Error:", error);
    
    return c.json({ 
      success: false,
      message: error.message || "Internal Server Error",
      code: error.code || 'UNKNOWN_ERROR'
    }, 500);
  }
});

// Refund Status Check - GET route for form
app.get("/refund-status", async (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Refund Status Check</title>
      <style>
        body { font-family: Arial, sans-serif; max-width: 500px; margin: 50px auto; padding: 20px; }
        .form-container { 
          background: #f5f5f5; 
          padding: 30px; 
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        h1 { color: #333; text-align: center; }
        input { 
          width: 100%; 
          padding: 10px; 
          margin: 10px 0 20px 0; 
          border: 1px solid #ddd; 
          border-radius: 4px;
          box-sizing: border-box;
        }
        button { 
          width: 100%; 
          padding: 12px; 
          background: #17a2b8; 
          color: white; 
          border: none; 
          border-radius: 4px; 
          cursor: pointer;
          font-size: 16px;
        }
        button:hover { background: #138496; }
        .nav-links {
          text-align: center;
          margin-top: 20px;
        }
        .nav-links a {
          display: inline-block;
          margin: 0 10px;
          padding: 8px 16px;
          background: #007bff;
          color: white;
          text-decoration: none;
          border-radius: 4px;
          font-size: 14px;
        }
      </style>
    </head>
    <body>
      <div class="form-container">
        <h1>🔍 Check Refund Status</h1>
        <form action="/refund-status" method="POST">
          <label for="refund_ref_id">Refund Reference ID:</label>
          <input type="text" id="refund_ref_id" name="refund_ref_id" 
                 placeholder="Enter refund reference ID" required>
          <button type="submit">Check Status</button>
        </form>
        
        <div class="nav-links">
          <a href="/">← Home</a>
          <a href="/refund">Request Refund</a>
        </div>
      </div>
    </body>
    </html>
  `);
});

// Refund Status Check - POST route
app.post("/refund-status", async (c) => {
  try {
    const body = await c.req.parseBody();
    const refund_ref_id = body.refund_ref_id as string;
    
    if (!refund_ref_id) {
      return c.html(`
        <div style="font-family: Arial; max-width: 500px; margin: 50px auto; text-align: center;">
          <h1 style="color: #dc3545;">Error</h1>
          <p>Refund reference ID is required</p>
          <a href="/refund-status">Go back</a>
        </div>
      `);
    }

    console.log("🔍 Checking refund status for:", refund_ref_id);
    
    const result = await sslcommerz.checkRefundStatus(refund_ref_id);
    
    console.log("🔍 Refund Status API Response:", result);
    
    if (result.APIConnect === "DONE") {
      return c.html(`
        <div style="font-family: Arial; max-width: 600px; margin: 50px auto; text-align: center;">
          <h1 style="color: #28a745;">✅ Refund Status Found</h1>
          <div style="background: #d4edda; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <p><strong>Refund Reference ID:</strong> ${result.refund_ref_id || refund_ref_id}</p>
            <p><strong>Bank Transaction ID:</strong> ${result.bank_tran_id || 'N/A'}</p>
            <p><strong>Transaction ID:</strong> ${result.trans_id || result.tran_id || 'N/A'}</p>
            <p><strong>Status:</strong> ${result.status || 'Processing'}</p>
            <p><strong>API Connect:</strong> ${result.APIConnect}</p>
            ${result.initiated_on ? `<p><strong>Initiated On:</strong> ${result.initiated_on}</p>` : ''}
            ${result.refunded_on ? `<p><strong>Refunded On:</strong> ${result.refunded_on}</p>` : ''}
          </div>
          <a href="/refund-status" style="display: inline-block; padding: 10px 20px; background: #007bff; color: white; text-decoration: none; border-radius: 4px;">Check Another</a>
        </div>
      `);
    } else {
      return c.html(`
        <div style="font-family: Arial; max-width: 600px; margin: 50px auto; text-align: center;">
          <h1 style="color: #dc3545;">❌ Refund Status Check Failed</h1>
          <div style="background: #f8d7da; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <p><strong>Reference ID:</strong> ${refund_ref_id}</p>
            <p><strong>API Connect:</strong> ${result.APIConnect}</p>
            <p><strong>Error:</strong> ${result.errorReason || 'Could not retrieve refund status'}</p>
          </div>
          <a href="/refund-status" style="display: inline-block; padding: 10px 20px; background: #007bff; color: white; text-decoration: none; border-radius: 4px;">Try Again</a>
        </div>
      `);
    }
  } catch (error: any) {
    console.error("💥 Refund Status Check Error:", error);
    
    return c.html(`
      <div style="font-family: Arial; max-width: 600px; margin: 50px auto; text-align: center;">
        <h1 style="color: #dc3545;">⚠️ Status Check Error</h1>
        <p>Could not check the refund status.</p>
        <p><small>Error: ${error.message}</small></p>
        <a href="/refund-status" style="display: inline-block; padding: 10px 20px; background: #007bff; color: white; text-decoration: none; border-radius: 4px;">Try Again</a>
      </div>
    `);
  }
});

// Refund Result Page
app.get("/refund-result", async (c) => {
  const query = c.req.query();
  const success = query.success === 'true';
  const ref_id = query.ref_id;
  
  if (success) {
    return c.html(`
      <div style="font-family: Arial; max-width: 600px; margin: 50px auto; text-align: center;">
        <h1 style="color: #28a745;">✅ Refund Request Submitted</h1>
        <div style="background: #d4edda; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <p>Your refund request has been submitted successfully!</p>
          ${ref_id ? `<p><strong>Refund Reference ID:</strong> ${ref_id}</p>` : ''}
          <p><small>Please allow 5-7 business days for the refund to process.</small></p>
        </div>
        <div style="margin-top: 30px;">
          <a href="/" style="display: inline-block; margin: 0 10px; padding: 10px 20px; background: #007bff; color: white; text-decoration: none; border-radius: 4px;">Home</a>
          <a href="/refund-status" style="display: inline-block; margin: 0 10px; padding: 10px 20px; background: #17a2b8; color: white; text-decoration: none; border-radius: 4px;">Check Status</a>
        </div>
      </div>
    `);
  } else {
    return c.html(`
      <div style="font-family: Arial; max-width: 600px; margin: 50px auto; text-align: center;">
        <h1 style="color: #dc3545;">❌ Refund Request Failed</h1>
        <p>There was an issue processing your refund request.</p>
        <a href="/refund" style="display: inline-block; padding: 10px 20px; background: #dc3545; color: white; text-decoration: none; border-radius: 4px;">Try Again</a>
      </div>
    `);
  }
});

export default app;
