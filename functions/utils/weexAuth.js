import crypto from 'crypto';

/**
 * Generate WEEX API signature for authenticated requests
 * @param {string} timestamp - Unix timestamp in milliseconds
 * @param {string} method - HTTP method (GET, POST, etc.)
 * @param {string} requestPath - API endpoint path
 * @param {string} body - Request body (empty string for GET requests)
 * @param {string} secretKey - WEEX Secret Key
 * @returns {string} Base64 encoded HMAC-SHA256 signature
 */
export function generateWeeXSignature(timestamp, method, requestPath, body, secretKey) {
  const message = timestamp + method + requestPath + (body || '');
  const signature = crypto
    .createHmac('sha256', secretKey)
    .update(message)
    .digest('base64');
  return signature;
}

/**
 * Get WEEX API authentication headers
 * @param {string} apiKey - WEEX API Key
 * @param {string} secretKey - WEEX Secret Key
 * @param {string} passphrase - WEEX Passphrase
 * @param {string} method - HTTP method
 * @param {string} requestPath - API endpoint path
 * @param {object} body - Request body (optional)
 * @returns {object} Headers object for WEEX API requests
 */
export function getWeeXHeaders(apiKey, secretKey, passphrase, method, requestPath, body = null) {
  const timestamp = Date.now().toString();
  const bodyString = body ? JSON.stringify(body) : '';
  const signature = generateWeeXSignature(timestamp, method, requestPath, bodyString, secretKey);

  return {
    'ACCESS-KEY': apiKey,
    'ACCESS-PASSPHRASE': passphrase,
    'ACCESS-TIMESTAMP': timestamp,
    'ACCESS-SIGN': signature,
    'Content-Type': 'application/json',
    'locale': 'en-US'
  };
}

