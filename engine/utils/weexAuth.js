import crypto from 'crypto';

/**
 * Generate WEEX API signature for authenticated requests
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

