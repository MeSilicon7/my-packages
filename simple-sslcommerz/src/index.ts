/**
 * SSLCommerz Payment Gateway Integration Utility
 * Professional TypeScript library for SSLCommerz payment processing
 * Runtime-agnostic: Compatible with Node.js, Bun, Deno, Edge Workers
 *
 * @version 1.0.0
 * @author Mesilicon7
 * @license UNLICENSED
 * 
 * @example
 * ```typescript
 * import { createSSLCommerzUtil, createSSLCommerzConfig } from '@mesilicon7/simple-sslcommerz';
 * 
 * const config = createSSLCommerzConfig({
 *   store_id: "your_store_id",
 *   store_passwd: "your_store_password",
 *   is_live: false, // true for production
 *   success_url: "/payment-success",
 *   fail_url: "/payment-fail",
 *   cancel_url: "/payment-cancel",
 *   ipn_url: "/payment-ipn",
 *   base_url: "https://yourdomain.com"
 * });
 * 
 * const sslcommerz = createSSLCommerzUtil(config);
 * ```
 */

/**
 * Configuration interface for SSLCommerz payment gateway
 * 
 * @interface SSLCommerzConfig
 * @example
 * ```typescript
 * const config: SSLCommerzConfig = {
 *   store_id: "testbox",
 *   store_passwd: "qwerty",
 *   is_live: false,
 *   success_url: "/payment-success",
 *   fail_url: "/payment-fail",
 *   cancel_url: "/payment-cancel",
 *   ipn_url: "/payment-ipn"
 * };
 * ```
 */
export interface SSLCommerzConfig {
  /** Store ID provided by SSLCommerz (required) */
  store_id: string;
  /** Store password provided by SSLCommerz (required) */
  store_passwd: string;
  /** Optional store name for branding purposes */
  store_name?: string;
  /** Environment mode - true for live/production, false for sandbox/testing */
  is_live: boolean;
  /** Success callback URL - can be absolute or relative path (required) */
  success_url: string;
  /** Failure callback URL - can be absolute or relative path (required) */
  fail_url: string;
  /** Cancel callback URL - can be absolute or relative path (required) */
  cancel_url: string;
  /** IPN (Instant Payment Notification) URL - can be absolute or relative path (required) */
  ipn_url: string;
  /** Base URL for resolving relative URLs (recommended for relative URLs) */
  base_url?: string;
  /** Enable debug logging for development and troubleshooting */
  debug?: boolean;
  /** Skip URL validation - use only if you handle URL validation externally */
  skip_url_validation?: boolean;
}

/**
 * Payment data interface for initiating transactions
 * 
 * @interface PaymentData
 * @example
 * ```typescript
 * const paymentData: PaymentData = {
 *   total_amount: 1000.50,
 *   tran_id: "TXN123456789",
 *   cus_name: "John Doe",
 *   cus_email: "john@example.com",
 *   cus_phone: "01700000000",
 *   product_name: "Demo Product",
 *   product_category: "Electronics"
 * };
 * ```
 */
export interface PaymentData {
  /** Transaction amount (minimum 10 BDT, maximum 500,000 BDT) */
  total_amount: number;
  /** Currency code - defaults to "BDT", also supports "USD" */
  currency?: string;
  /** Unique transaction ID - must be unique for each transaction */
  tran_id: string;
  /** Product or service name */
  product_name?: string;
  /** Product category for classification */
  product_category?: string;
  /** Product profile type for SSLCommerz categorization */
  product_profile?:
    | "general"
    | "physical-goods"
    | "non-physical-goods"
    | "airline-tickets"
    | "travel-vertical"
    | "telecom-vertical";
  /** Shipping method - defaults to "NO" */
  shipping_method?: string;
  /** Customer full name (required) */
  cus_name: string;
  /** Customer email address (required, must be valid email format) */
  cus_email: string;
  /** Customer phone number (required, Bangladesh format: 01XXXXXXXXX) */
  cus_phone: string;
  /** Customer address line 1 */
  cus_add1?: string;
  /** Customer city */
  cus_city?: string;
  /** Customer postal code */
  cus_postcode?: string;
  /** Customer country - defaults to "Bangladesh" */
  cus_country?: string;
  /** Optional metadata field A for custom data */
  value_a?: string;
  /** Optional metadata field B for custom data */
  value_b?: string;
  /** Optional metadata field C for custom data */
  value_c?: string;
  /** Optional metadata field D for custom data */
  value_d?: string;
}

/**
 * Response interface from SSLCommerz payment initiation API
 * 
 * @interface SSLCommerzResponse
 */
export interface SSLCommerzResponse {
  /** API response status - "SUCCESS" for successful initiation, "FAILED" for errors */
  status: "SUCCESS" | "FAILED";
  /** Payment gateway URL to redirect customer for payment (available on SUCCESS) */
  GatewayPageURL?: string;
  /** Reason for failure (available on FAILED status) */
  failedreason?: string;
  /** Session key for the payment session */
  sessionkey?: string;
  /** Store banner URL for customization */
  storeBanner?: string;
  /** Store logo URL for customization */
  storeLogo?: string;
}

/**
 * Response interface from SSLCommerz payment validation API
 * 
 * @interface ValidationResponse
 */
export interface ValidationResponse {
  /** Validation status - "VALID"/"VALIDATED" for successful payments */
  status: "VALID" | "VALIDATED" | "INVALID_TRANSACTION" | "FAILED";
  /** Transaction ID from your system */
  tran_id: string;
  /** Transaction amount as string */
  amount: string;
  /** Currency code */
  currency: string;
  /** Payment card type (e.g., "VISA", "MASTERCARD") */
  card_type?: string;
  /** Card brand information */
  card_brand?: string;
  /** Masked card number */
  card_no?: string;
  /** Bank transaction ID - unique identifier from bank */
  bank_tran_id?: string;
  /** Risk assessment level - "0" for low risk, "1" for high risk */
  risk_level?: "0" | "1";
  /** Risk assessment description */
  risk_title?: string;
  /** Validation ID for verification */
  val_id: string;
  /** Transaction date and time */
  tran_date?: string;
  /** Amount received by store (after fees) */
  store_amount?: string;
}

/**
 * Extended Error interface for SSLCommerz specific errors
 * 
 * @interface SSLCommerzError
 */
export interface SSLCommerzError extends Error {
  /** Error code for programmatic handling */
  code?: string;
  /** Additional error details for debugging */
  details?: any;
}

/**
 * Refund request data interface
 * 
 * @interface RefundData
 * @example
 * ```typescript
 * const refundData: RefundData = {
 *   bank_tran_id: "1709162345070ANJdZV8LyI4cMw",
 *   refund_amount: 500.00,
 *   refund_remarks: "Customer requested refund"
 * };
 * ```
 */
export interface RefundData {
  /** Amount to refund (must be positive, max 500,000 BDT) */
  refund_amount: number;
  /** Reason for refund - optional but recommended for record keeping */
  refund_remarks?: string;
  /** Bank transaction ID from original payment (required) */
  bank_tran_id: string;
  /** Your internal reference ID for reconciliation */
  refe_id?: string;
}

/**
 * Response interface from SSLCommerz refund API
 * 
 * @interface RefundResponse
 */
export interface RefundResponse {
  /** API connection status - "DONE" for successful API call, "FAILED" for connection issues */
  APIConnect: "DONE" | "FAILED" | "INVALID_REQUEST" | "INACTIVE";
  /** Original bank transaction ID */
  bank_tran_id?: string;
  /** Original transaction ID */
  trans_id?: string;
  /** Refund reference ID for tracking */
  refund_ref_id?: string;
  /** Refund status - "success", "failed", or "processing" */
  status?: string;
  /** Error reason if refund fails */
  errorReason?: string;
  /** Refund initiation timestamp */
  initiated_on?: string;
  /** Refund completion timestamp */
  refunded_on?: string;
  /** Alternative transaction ID field */
  tran_id?: string;
}

/**
 * Professional SSLCommerz Payment Gateway Utility Class
 * 
 * This class provides a comprehensive interface for integrating with SSLCommerz
 * payment gateway, including payment initiation, validation, and refund operations.
 * 
 * @class SSLCommerzUtil
 * @example
 * ```typescript
 * const sslcommerz = new SSLCommerzUtil(config);
 * 
 * // Initiate a payment
 * const paymentResult = await sslcommerz.initPayment(paymentData);
 * 
 * // Validate a payment
 * const validation = await sslcommerz.validatePayment(val_id);
 * 
 * // Process a refund
 * const refundResult = await sslcommerz.initiateRefund(refundData);
 * ```
 */
export class SSLCommerzUtil {
  private readonly config: SSLCommerzConfig;
  private readonly baseUrl: string;
  private readonly logger: Logger;

  /**
   * Creates an instance of SSLCommerzUtil
   * 
   * @param {SSLCommerzConfig} config - Configuration object for SSLCommerz
   * @throws {SSLCommerzError} Throws error if configuration is invalid
   */
  constructor(config: SSLCommerzConfig) {
    this.validateConfig(config);
    this.config = { ...config };
    this.baseUrl = config.is_live
      ? "https://securepay.sslcommerz.com"
      : "https://sandbox.sslcommerz.com";
    this.logger = new Logger(config.debug || false);

    this.logger.info("SSLCommerzUtil initialized", {
      environment: config.is_live ? "LIVE" : "SANDBOX",
      store_id: config.store_id,
      baseUrl: this.baseUrl,
    });
  }

  /**
   * Validates the configuration object for required fields and URL formats
   * 
   * @private
   * @param {SSLCommerzConfig} config - Configuration to validate
   * @throws {SSLCommerzError} Throws CONFIG_ERROR or INVALID_URL errors
   */
  private validateConfig(config: SSLCommerzConfig): void {
    const required = [
      "store_id",
      "store_passwd",
      "success_url",
      "fail_url",
      "cancel_url",
      "ipn_url",
    ];
    const missing = required.filter(
      (field) => !config[field as keyof SSLCommerzConfig],
    );

    if (missing.length > 0) {
      throw this.createError(
        `Missing required configuration: ${missing.join(", ")}`,
        "CONFIG_ERROR",
      );
    }

    // Validate URLs if not explicitly skipped
    if (!config.skip_url_validation) {
      const urls = ["success_url", "fail_url", "cancel_url", "ipn_url"];
      for (const urlField of urls) {
        const urlValue = config[urlField as keyof SSLCommerzConfig] as string;

        // Check if URL is absolute or if we can make it absolute with base_url
        if (!this.isValidUrl(urlValue, config.base_url)) {
          if (!config.base_url) {
            this.logger.warn(
              `URL validation skipped for ${urlField}, please provide base_url for relative URLs`,
              { url: urlValue },
            );
          } else {
            throw this.createError(
              `Invalid URL format for ${urlField}`,
              "INVALID_URL",
            );
          }
        }
      }
    }
  }

  /**
   * Validates if a URL is properly formatted (absolute or relative with base_url)
   * 
   * @private
   * @param {string} url - URL to validate
   * @param {string} [baseUrl] - Base URL for resolving relative URLs
   * @returns {boolean} True if URL is valid
   */
  private isValidUrl(url: string, baseUrl?: string): boolean {
    // If it's an absolute URL, validate directly
    try {
      new URL(url);
      return true;
    } catch {
      // If we have a base URL and this is a relative URL, try to resolve
      if (baseUrl && (url.startsWith("/") || url.startsWith("./"))) {
        try {
          new URL(url, baseUrl);
          return true;
        } catch {
          return false;
        }
      }
      return false;
    }
  }

  /**
   * Resolves relative URLs to absolute URLs using the configured base_url
   * 
   * @param {string} url - URL to resolve (can be relative or absolute)
   * @returns {string} Resolved absolute URL or original URL if resolution fails
   */
  resolveUrl(url: string): string {
    // If already absolute, return as is
    try {
      new URL(url);
      return url;
    } catch {
      // If relative and we have base_url, resolve it
      if (this.config.base_url) {
        try {
          return new URL(url, this.config.base_url).toString();
        } catch {
          this.logger.warn("Failed to resolve relative URL", { url });
          return url;
        }
      }
      // Return as is if we can't resolve
      return url;
    }
  }

  /**
   * Creates a standardized SSLCommerzError object with consistent structure
   * 
   * @private
   * @param {string} message - Error message
   * @param {string} [code] - Error code for programmatic handling
   * @param {any} [details] - Additional error details
   * @returns {SSLCommerzError} Structured error object
   */
  private createError(
    message: string,
    code?: string,
    details?: any,
  ): SSLCommerzError {
    const error = new Error(message) as SSLCommerzError;
    error.code = code;
    error.details = details;
    return error;
  }

  /**
   * Initiates a payment session with SSLCommerz gateway
   * 
   * This method validates payment data, sends the request to SSLCommerz,
   * and returns the payment session details including the gateway URL.
   * 
   * @param {PaymentData} paymentData - Payment information and customer details
   * @returns {Promise<SSLCommerzResponse>} Payment session response
   * @throws {SSLCommerzError} Throws VALIDATION_ERROR, HTTP_ERROR, PARSE_ERROR, or NETWORK_ERROR
   * 
   * @example
   * ```typescript
   * const paymentData = {
   *   total_amount: 1000,
   *   tran_id: "TXN123456",
   *   cus_name: "John Doe",
   *   cus_email: "john@example.com",
   *   cus_phone: "01700000000"
   * };
   * 
   * const result = await sslcommerz.initPayment(paymentData);
   * if (result.status === "SUCCESS") {
   *   // Redirect to result.GatewayPageURL
   * }
   * ```
   */
  async initPayment(paymentData: PaymentData): Promise<SSLCommerzResponse> {
    const startTime = Date.now();
    this.logger.info("Initiating payment", { tran_id: paymentData.tran_id });

    // Validate payment data
    const validationErrors = this.validatePaymentData(paymentData);
    if (validationErrors.length > 0) {
      throw this.createError(
        "Payment data validation failed",
        "VALIDATION_ERROR",
        validationErrors,
      );
    }

    const requestData = this.buildPaymentRequest(paymentData);

    try {
      const response = await fetch(`${this.baseUrl}/gwprocess/v4/api.php`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Accept: "application/json",
          "User-Agent": "SSLCommerzUtil/1.0.0",
        },
        body: new URLSearchParams(requestData).toString(),
      });

      const responseText = await response.text();
      this.logger.debug("SSLCommerz API Response", {
        status: response.status,
        responseText,
      });

      if (!response.ok) {
        throw this.createError(
          `HTTP ${response.status}: ${response.statusText}`,
          "HTTP_ERROR",
        );
      }

      let result: SSLCommerzResponse;
      try {
        result = JSON.parse(responseText);
      } catch (parseError) {
        throw this.createError(
          `Invalid JSON response: ${responseText}`,
          "PARSE_ERROR",
        );
      }

      const duration = Date.now() - startTime;
      this.logger.info("Payment initiated", {
        tran_id: paymentData.tran_id,
        status: result.status,
        duration: `${duration}ms`,
        sessionkey: result.sessionkey,
      });

      return result;
    } catch (error) {
      this.logger.error("Payment initiation failed", {
        tran_id: paymentData.tran_id,
        error: error instanceof Error ? error.message : "Unknown error",
      });

      if (error instanceof Error && "code" in error) {
        throw error;
      }

      throw this.createError(
        `Payment initialization failed: ${error instanceof Error ? error.message : "Network error"}`,
        "NETWORK_ERROR",
        error,
      );
    }
  }

  /**
   * Build payment request data
   */
  private buildPaymentRequest(
    paymentData: PaymentData,
  ): Record<string, string> {
    const requestData: Record<string, string> = {
      store_id: this.config.store_id,
      store_passwd: this.config.store_passwd,
      total_amount: paymentData.total_amount.toFixed(2),
      currency: paymentData.currency || "BDT",
      tran_id: paymentData.tran_id,
      success_url: this.resolveUrl(this.config.success_url),
      fail_url: this.resolveUrl(this.config.fail_url),
      cancel_url: this.resolveUrl(this.config.cancel_url),
      ipn_url: this.resolveUrl(this.config.ipn_url),
      shipping_method: paymentData.shipping_method || "NO",
      product_name: paymentData.product_name || "Product",
      product_category: paymentData.product_category || "General",
      product_profile: paymentData.product_profile || "general",
      cus_name: paymentData.cus_name,
      cus_email: paymentData.cus_email,
      cus_add1: paymentData.cus_add1 || "N/A",
      cus_city: paymentData.cus_city || "N/A",
      cus_postcode: paymentData.cus_postcode || "0000",
      cus_country: paymentData.cus_country || "Bangladesh",
      cus_phone: paymentData.cus_phone,
    };

    // Add optional store name if provided
    if (this.config.store_name) {
      requestData.store_name = this.config.store_name;
    }

    // Add optional metadata
    ["value_a", "value_b", "value_c", "value_d"].forEach((field) => {
      const value = paymentData[field as keyof PaymentData];
      if (value) {
        requestData[field] = value as string;
      }
    });

    return requestData;
  }

  /**
   * Validates a completed payment using SSLCommerz validation API
   * 
   * This method should be called after receiving payment completion notification
   * to verify the payment's authenticity and status.
   * 
   * @param {string} val_id - Validation ID received from SSLCommerz
   * @returns {Promise<ValidationResponse>} Payment validation details
   * @throws {SSLCommerzError} Throws MISSING_VAL_ID, HTTP_ERROR, INVALID_RESPONSE, or VALIDATION_FAILED
   * 
   * @example
   * ```typescript
   * // In your success callback
   * const val_id = request.query.val_id;
   * const validation = await sslcommerz.validatePayment(val_id);
   * 
   * if (sslcommerz.isPaymentValid(validation)) {
   *   // Payment is verified and successful
   *   console.log(`Payment verified: ${validation.tran_id}`);
   * }
   * ```
   */
  async validatePayment(val_id: string): Promise<ValidationResponse> {
    const startTime = Date.now();
    this.logger.info("Validating payment", { val_id });

    if (!val_id?.trim()) {
      throw this.createError("Validation ID is required", "MISSING_VAL_ID");
    }

    try {
      const validateUrl = new URL(
        "/validator/api/validationserverAPI.php",
        this.baseUrl,
      );
      validateUrl.searchParams.append("val_id", val_id);
      validateUrl.searchParams.append("store_id", this.config.store_id);
      validateUrl.searchParams.append("store_passwd", this.config.store_passwd);
      validateUrl.searchParams.append("format", "json");

      const response = await fetch(validateUrl.toString());

      if (!response.ok) {
        throw this.createError(
          `HTTP ${response.status}: ${response.statusText}`,
          "HTTP_ERROR",
        );
      }

      const validation = await response.json();

      if (!validation.val_id) {
        throw this.createError(
          "Invalid validation response - missing val_id",
          "INVALID_RESPONSE",
        );
      }

      const duration = Date.now() - startTime;
      this.logger.info("Payment validated", {
        val_id,
        status: validation.status,
        tran_id: validation.tran_id,
        amount: validation.amount,
        duration: `${duration}ms`,
      });

      return validation;
    } catch (error) {
      this.logger.error("Payment validation failed", {
        val_id,
        error: error instanceof Error ? error.message : "Unknown error",
      });

      if (error instanceof Error && "code" in error) {
        throw error;
      }

      throw this.createError(
        `Payment validation failed: ${error instanceof Error ? error.message : "Network error"}`,
        "VALIDATION_FAILED",
        error,
      );
    }
  }

  /**
   * Checks if a payment validation indicates a successful payment
   * 
   * @param {ValidationResponse} validation - Validation response from validatePayment
   * @returns {boolean} True if payment is valid and successful
   * 
   * @example
   * ```typescript
   * const validation = await sslcommerz.validatePayment(val_id);
   * if (sslcommerz.isPaymentValid(validation)) {
   *   // Process successful payment
   *   updateOrderStatus(validation.tran_id, 'paid');
   * }
   * ```
   */
  isPaymentValid(validation: ValidationResponse): boolean {
    const validStatuses = ["VALID", "VALIDATED"];
    const isValid = validStatuses.includes(validation.status);

    this.logger.debug("Payment validity check", {
      val_id: validation.val_id,
      status: validation.status,
      isValid,
    });

    return isValid;
  }

  /**
   * Generates a unique transaction ID with customizable prefix and suffix
   * 
   * @param {string} [prefix="TXN"] - Prefix for the transaction ID
   * @param {string} [suffix] - Optional suffix for the transaction ID
   * @returns {string} Unique transaction ID
   * 
   * @example
   * ```typescript
   * const tran_id = sslcommerz.generateTransactionId("ORDER", "001");
   * // Result: "ORDER1634567890123456001"
   * ```
   */
  generateTransactionId(prefix: string = "TXN", suffix?: string): string {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, "0");
    const tran_id = `${prefix}${timestamp}${random}${suffix || ""}`;

    this.logger.debug("Generated transaction ID", { tran_id });
    return tran_id;
  }

  /**
   * Validates payment data for completeness and business rules
   * 
   * @param {Partial<PaymentData>} data - Payment data to validate
   * @returns {string[]} Array of validation error messages (empty if valid)
   */
  validatePaymentData(data: Partial<PaymentData>): string[] {
    const errors: string[] = [];
    const required = [
      "total_amount",
      "tran_id",
      "cus_name",
      "cus_email",
      "cus_phone",
    ];

    // Check required fields
    for (const field of required) {
      const value = data[field as keyof PaymentData];
      if (!value || (typeof value === "string" && !value.trim())) {
        errors.push(`Missing required field: ${field}`);
      }
    }

    // Validate amount
    if (data.total_amount !== undefined) {
      if (typeof data.total_amount !== "number" || data.total_amount <= 0) {
        errors.push("Amount must be a positive number");
      }
      if (data.total_amount < 10) {
        errors.push("Minimum amount is 10 BDT");
      }
      if (data.total_amount > 500000) {
        errors.push("Maximum amount is 500,000 BDT");
      }
    }

    // Validate email
    if (data.cus_email && !this.isValidEmail(data.cus_email)) {
      errors.push("Invalid email format");
    }

    // Validate phone
    if (data.cus_phone && !this.isValidPhone(data.cus_phone)) {
      errors.push("Invalid phone number format");
    } 

    // Validate currency
    const validCurrencies = ["BDT", "USD"];
    if (data.currency && !validCurrencies.includes(data.currency)) {
      errors.push(`Invalid currency. Supported: ${validCurrencies.join(", ")}`);
    }

    return errors;
  }

  /**
   * Validate email format
   */
  private isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  }

  /**
   * Validate phone number format (Bangladesh mobile numbers)
   */
  private isValidPhone(phone: string): boolean {
    const cleaned = phone.replace(/[\s\-\(\)]/g, "");
    return /^(\+880|880|0)?1[3-9]\d{8}$/.test(cleaned);
  }

  /**
   * Initiates a refund request for a previously successful payment
   * 
   * This method processes refund requests using the SSLCommerz refund API.
   * The bank_tran_id from the original payment is required.
   * 
   * @param {RefundData} refundData - Refund details including amount and bank transaction ID
   * @returns {Promise<RefundResponse>} Refund initiation response
   * @throws {SSLCommerzError} Throws VALIDATION_ERROR, HTTP_ERROR, PARSE_ERROR, or NETWORK_ERROR
   * 
   * @example
   * ```typescript
   * const refundData = {
   *   bank_tran_id: "1709162345070ANJdZV8LyI4cMw",
   *   refund_amount: 500.00,
   *   refund_remarks: "Customer requested refund"
   * };
   * 
   * const result = await sslcommerz.initiateRefund(refundData);
   * if (result.APIConnect === "DONE" && result.status === "success") {
   *   console.log(`Refund initiated: ${result.refund_ref_id}`);
   * }
   * ```
   */
  async initiateRefund(refundData: RefundData): Promise<RefundResponse> {
    const startTime = Date.now();
    this.logger.info("Initiating refund", { 
      bank_tran_id: refundData.bank_tran_id,
      amount: refundData.refund_amount 
    });

    // Validate refund data
    const validationErrors = this.validateRefundData(refundData);
    if (validationErrors.length > 0) {
      throw this.createError(
        "Refund data validation failed",
        "VALIDATION_ERROR",
        validationErrors,
      );
    }

    try {
      // Build refund URL with GET parameters according to SSLCommerz documentation
      const refundUrl = new URL("/validator/api/merchantTransIDvalidationAPI.php", this.baseUrl);
      refundUrl.searchParams.append("bank_tran_id", refundData.bank_tran_id);
      refundUrl.searchParams.append("refund_amount", refundData.refund_amount.toFixed(2));
      refundUrl.searchParams.append("refund_remarks", refundData.refund_remarks || "Customer requested refund");
      refundUrl.searchParams.append("store_id", this.config.store_id);
      refundUrl.searchParams.append("store_passwd", this.config.store_passwd);
      refundUrl.searchParams.append("format", "json");
      refundUrl.searchParams.append("v", "1"); // Version parameter as shown in docs
      
      // Add optional reference ID if provided
      if (refundData.refe_id) {
        refundUrl.searchParams.append("refe_id", refundData.refe_id);
      }

      this.logger.debug("Refund API URL", { url: refundUrl.toString() });

      const response = await fetch(refundUrl.toString(), {
        method: "GET", // Changed to GET as per documentation
        headers: {
          Accept: "application/json",
          "User-Agent": "SSLCommerzUtil/1.0.0",
        },
      });

      const responseText = await response.text();
      this.logger.debug("SSLCommerz Refund API Response", {
        status: response.status,
        responseText,
      });

      if (!response.ok) {
        throw this.createError(
          `HTTP ${response.status}: ${response.statusText}`,
          "HTTP_ERROR",
        );
      }

      let result: RefundResponse;
      try {
        result = JSON.parse(responseText);
      } catch (parseError) {
        throw this.createError(
          `Invalid JSON response: ${responseText}`,
          "PARSE_ERROR",
        );
      }

      const duration = Date.now() - startTime;
      this.logger.info("Refund processed", {
        bank_tran_id: refundData.bank_tran_id,
        APIConnect: result.APIConnect,
        status: result.status,
        duration: `${duration}ms`,
        refund_ref_id: result.refund_ref_id,
      });

      return result;
    } catch (error) {
      this.logger.error("Refund initiation failed", {
        bank_tran_id: refundData.bank_tran_id,
        error: error instanceof Error ? error.message : "Unknown error",
      });

      if (error instanceof Error && "code" in error) {
        throw error;
      }

      throw this.createError(
        `Refund initialization failed: ${error instanceof Error ? error.message : "Network error"}`,
        "NETWORK_ERROR",
        error,
      );
    }
  }

  /**
   * Checks the status of a previously initiated refund
   * 
   * @param {string} refund_ref_id - Refund reference ID from initiateRefund response
   * @returns {Promise<RefundResponse>} Current refund status
   * @throws {SSLCommerzError} Throws MISSING_REFUND_REF_ID, HTTP_ERROR, PARSE_ERROR, or REFUND_STATUS_FAILED
   * 
   * @example
   * ```typescript
   * const status = await sslcommerz.checkRefundStatus("59bd63fea5455");
   * console.log(`Refund status: ${status.status}`);
   * ```
   */
  async checkRefundStatus(refund_ref_id: string): Promise<RefundResponse> {
    const startTime = Date.now();
    this.logger.info("Checking refund status", { refund_ref_id });

    if (!refund_ref_id?.trim()) {
      throw this.createError("Refund reference ID is required", "MISSING_REFUND_REF_ID");
    }

    try {
      // Build status check URL with GET parameters according to SSLCommerz documentation
      const statusUrl = new URL("/validator/api/merchantTransIDvalidationAPI.php", this.baseUrl);
      statusUrl.searchParams.append("refund_ref_id", refund_ref_id);
      statusUrl.searchParams.append("store_id", this.config.store_id);
      statusUrl.searchParams.append("store_passwd", this.config.store_passwd);
      statusUrl.searchParams.append("format", "json");

      this.logger.debug("Refund status check URL", { url: statusUrl.toString() });

      const response = await fetch(statusUrl.toString(), {
        method: "GET", // GET method as per documentation
        headers: {
          Accept: "application/json",
          "User-Agent": "SSLCommerzUtil/1.0.0",
        },
      });

      if (!response.ok) {
        throw this.createError(
          `HTTP ${response.status}: ${response.statusText}`,
          "HTTP_ERROR",
        );
      }

      const responseText = await response.text();
      this.logger.debug("SSLCommerz Refund Status API Response", {
        status: response.status,
        responseText,
      });

      let result: RefundResponse;
      try {
        result = JSON.parse(responseText);
      } catch (parseError) {
        throw this.createError(
          `Invalid JSON response: ${responseText}`,
          "PARSE_ERROR",
        );
      }

      const duration = Date.now() - startTime;
      this.logger.info("Refund status checked", {
        refund_ref_id,
        APIConnect: result.APIConnect,
        status: result.status,
        duration: `${duration}ms`,
      });

      return result;
    } catch (error) {
      this.logger.error("Refund status check failed", {
        refund_ref_id,
        error: error instanceof Error ? error.message : "Unknown error",
      });

      if (error instanceof Error && "code" in error) {
        throw error;
      }

      throw this.createError(
        `Refund status check failed: ${error instanceof Error ? error.message : "Network error"}`,
        "REFUND_STATUS_FAILED",
        error,
      );
    }
  }

  /**
   * Validates refund data for completeness and business rules
   * 
   * @param {Partial<RefundData>} data - Refund data to validate
   * @returns {string[]} Array of validation error messages (empty if valid)
   */
  validateRefundData(data: Partial<RefundData>): string[] {
    const errors: string[] = [];

    // Check required fields
    if (!data.refund_amount || data.refund_amount <= 0) {
      errors.push("Refund amount must be a positive number");
    }

    if (!data.bank_tran_id?.trim()) {
      errors.push("Bank transaction ID is required");
    }

    // Validate amount limits
    if (data.refund_amount !== undefined) {
      if (data.refund_amount < 1) {
        errors.push("Minimum refund amount is 1 BDT");
      }
      if (data.refund_amount > 500000) {
        errors.push("Maximum refund amount is 500,000 BDT");
      }
    }

    return errors;
  }

  /**
   * Checks if a refund response indicates a successful refund initiation
   * 
   * @param {RefundResponse} refundResponse - Response from initiateRefund
   * @returns {boolean} True if refund was successfully initiated
   * 
   * @example
   * ```typescript
   * const result = await sslcommerz.initiateRefund(refundData);
   * if (sslcommerz.isRefundSuccessful(result)) {
   *   console.log("Refund initiated successfully");
   * }
   * ```
   */
  isRefundSuccessful(refundResponse: RefundResponse): boolean {
    const isSuccess = refundResponse.APIConnect === "DONE" && 
                     refundResponse.status === "success";

    this.logger.debug("Refund success check", {
      refund_ref_id: refundResponse.refund_ref_id,
      APIConnect: refundResponse.APIConnect,
      status: refundResponse.status,
      isSuccess,
    });

    return isSuccess;
  }

  /**
   * Extracts gateway URL from payment initiation response
   * 
   * @param {SSLCommerzResponse} response - Response from initPayment
   * @returns {string | null} Gateway URL for payment or null if not available
   */
  getGatewayUrl(response: SSLCommerzResponse): string | null {
    if (response.status === "SUCCESS" && response.GatewayPageURL) {
      try {
        const url = new URL(response.GatewayPageURL);
        this.logger.debug("Gateway URL extracted", {
          url: response.GatewayPageURL,
        });
        return response.GatewayPageURL;
      } catch {
        this.logger.warn("Invalid gateway URL format", {
          url: response.GatewayPageURL,
        });
        return null;
      }
    }
    return null;
  }

  /**
   * Extracts validation ID from callback request data (GET or POST)
   * 
   * @param {Record<string, any>} data - Request data from success callback
   * @returns {string | null} Validation ID or null if not found
   */
  extractValidationId(data: Record<string, any>): string | null {
    const val_id = data.val_id || data["val_id"] || null;
    this.logger.debug("Extracted validation ID", { val_id });
    return val_id;
  }

  /**
   * Formats monetary amount for display with currency
   * 
   * @param {string | number} amount - Amount to format
   * @param {string} [currency="BDT"] - Currency code
   * @returns {string} Formatted amount string
   */
  formatAmount(amount: string | number, currency: string = "BDT"): string {
    const numAmount = parseFloat(amount.toString());
    const formatted = `${numAmount.toFixed(2)} ${currency}`;
    return formatted;
  }

  /**
   * Returns configuration summary without sensitive information
   * 
   * @returns {Partial<SSLCommerzConfig>} Safe configuration summary
   */
  getConfigSummary(): Partial<SSLCommerzConfig> {
    return {
      store_id: this.config.store_id,
      store_name: this.config.store_name,
      is_live: this.config.is_live,
      debug: this.config.debug,
    };
  }
}

/**
 * Internal logging utility class for consistent log formatting
 * 
 * @private
 * @class Logger
 */
class Logger {
  /**
   * Creates a logger instance
   * 
   * @param {boolean} debugMode - Enable debug logging
   */
  constructor(private debugMode: boolean = false) {}

  /**
   * Logs informational messages
   * 
   * @param {string} message - Log message
   * @param {any} [data] - Optional data to log
   */
  info(message: string, data?: any): void {
    console.log(
      `[SSLCommerz] ${message}`,
      data ? JSON.stringify(data, null, 2) : "",
    );
  }

  /**
   * Logs debug messages (only when debug mode is enabled)
   * 
   * @param {string} message - Debug message
   * @param {any} [data] - Optional data to log
   */
  debug(message: string, data?: any): void {
    if (this.debugMode) {
      console.debug(
        `[SSLCommerz DEBUG] ${message}`,
        data ? JSON.stringify(data, null, 2) : "",
      );
    }
  }

  /**
   * Logs warning messages
   * 
   * @param {string} message - Warning message
   * @param {any} [data] - Optional data to log
   */
  warn(message: string, data?: any): void {
    console.warn(
      `[SSLCommerz WARN] ${message}`,
      data ? JSON.stringify(data, null, 2) : "",
    );
  }

  /**
   * Logs error messages
   * 
   * @param {string} message - Error message
   * @param {any} [data] - Optional data to log
   */
  error(message: string, data?: any): void {
    console.error(
      `[SSLCommerz ERROR] ${message}`,
      data ? JSON.stringify(data, null, 2) : "",
    );
  }
}

/**
 * Factory function for creating SSLCommerzUtil instances
 * 
 * @param {SSLCommerzConfig} config - SSLCommerz configuration
 * @returns {SSLCommerzUtil} Configured SSLCommerzUtil instance
 * 
 * @example
 * ```typescript
 * const sslcommerz = createSSLCommerzUtil(config);
 * ```
 */
export function createSSLCommerzUtil(config: SSLCommerzConfig): SSLCommerzUtil {
  return new SSLCommerzUtil(config);
}

/**
 * Factory function for creating and validating SSLCommerz configuration
 * 
 * All parameters must be provided by the consumer for security and clarity.
 * 
 * @param {Object} params - Configuration parameters
 * @param {string} params.store_id - Your SSLCommerz store ID
 * @param {string} params.store_passwd - Your SSLCommerz store password
 * @param {string} [params.store_name] - Optional store name for branding
 * @param {boolean} params.is_live - Environment mode (true for production)
 * @param {string} params.success_url - Success callback URL
 * @param {string} params.fail_url - Failure callback URL
 * @param {string} params.cancel_url - Cancellation callback URL
 * @param {string} params.ipn_url - IPN notification URL
 * @param {string} [params.base_url] - Base URL for resolving relative URLs
 * @param {boolean} [params.debug] - Enable debug logging
 * @param {boolean} [params.skip_url_validation] - Skip URL validation
 * @returns {SSLCommerzConfig} Validated configuration object
 * @throws {Error} Throws error if required parameters are missing
 * 
 * @example
 * ```typescript
 * const config = createSSLCommerzConfig({
 *   store_id: "your_store_id",
 *   store_passwd: "your_store_password",
 *   is_live: false,
 *   success_url: "/payment-success",
 *   fail_url: "/payment-fail",
 *   cancel_url: "/payment-cancel",
 *   ipn_url: "/payment-ipn",
 *   base_url: "https://yourdomain.com",
 *   debug: true
 * });
 * ```
 */
export function createSSLCommerzConfig(params: {
  store_id: string;
  store_passwd: string;
  store_name?: string;
  is_live: boolean;
  success_url: string;
  fail_url: string;
  cancel_url: string;
  ipn_url: string;
  base_url?: string;
  debug?: boolean;
  skip_url_validation?: boolean;
}): SSLCommerzConfig {
  // Validate required parameters
  const required = [
    "store_id",
    "store_passwd",
    "success_url",
    "fail_url",
    "cancel_url",
    "ipn_url",
  ];
  const missing = required.filter(
    (field) => !params[field as keyof typeof params],
  );

  if (missing.length > 0) {
    throw new Error(
      `Missing required configuration parameters: ${missing.join(", ")}`,
    );
  }

  return {
    store_id: params.store_id,
    store_passwd: params.store_passwd,
    store_name: params.store_name,
    is_live: params.is_live,
    success_url: params.success_url,
    fail_url: params.fail_url,
    cancel_url: params.cancel_url,
    ipn_url: params.ipn_url,
    base_url: params.base_url,
    debug: params.debug || false,
    skip_url_validation: params.skip_url_validation || !params.base_url,
  };
}
