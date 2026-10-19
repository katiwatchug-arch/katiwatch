import { describe, it, expect } from 'vitest';
import { resolveFriendlyPaymentError, PaymentErrorMessages } from '@/lib/payment-errors';

describe('resolveFriendlyPaymentError — 429 and Rate Limiting Protection', () => {
  it('maps HTTP 429 status directly to TOO_MANY_ATTEMPTS', () => {
    expect(resolveFriendlyPaymentError(null, 429)).toBe(
      PaymentErrorMessages.TOO_MANY_ATTEMPTS
    );
    expect(resolveFriendlyPaymentError('', 429)).toBe(
      PaymentErrorMessages.TOO_MANY_ATTEMPTS
    );
  });

  it('maps raw error strings containing "429" to TOO_MANY_ATTEMPTS', () => {
    const raw429Variations = [
      '429',
      'HTTP 429',
      'HTTP 429: Too Many Requests',
      'MakyPay returned invalid response (HTTP 429)',
      'Request failed with status code 429',
      'Failed to check status: 429',
      'error code 429',
      'API request failed with status 429',
      'upstream 429',
      'status: 429',
    ];

    for (const errorStr of raw429Variations) {
      expect(resolveFriendlyPaymentError(errorStr)).toBe(
        PaymentErrorMessages.TOO_MANY_ATTEMPTS
      );
    }
  });

  it('maps rate limit and throttling keywords to TOO_MANY_ATTEMPTS', () => {
    const rateLimitKeywords = [
      'too many requests',
      'too many attempts',
      'rate limit exceeded',
      'rate limited by provider',
      'ratelimit',
      'request throttled',
      'throttle',
      'please slow down',
      'maximum attempts reached',
      'duplicate transaction',
      'pending transaction exists',
      'active transaction in progress',
      'in quick succession',
      'too frequent requests',
      'already in progress',
      'system busy, retry later',
    ];

    for (const phrase of rateLimitKeywords) {
      expect(resolveFriendlyPaymentError(phrase)).toBe(
        PaymentErrorMessages.TOO_MANY_ATTEMPTS
      );
    }
  });

  it('maps network and connectivity errors to NETWORK_ERROR', () => {
    const networkErrors = [
      'Failed to fetch',
      'fetch failed',
      'NetworkError when attempting to fetch resource.',
      'offline',
      'check your internet connection',
      'ECONNREFUSED',
      'ETIMEDOUT',
      'load failed',
    ];

    for (const err of networkErrors) {
      expect(resolveFriendlyPaymentError(err)).toBe(
        PaymentErrorMessages.NETWORK_ERROR
      );
    }
  });

  it('maps insufficient funds errors to INSUFFICIENT_FUNDS', () => {
    const balanceErrors = [
      'Insufficient balance',
      'Subscriber has insufficient funds',
      'Not enough money in wallet',
      'Low account balance',
      'Please top up',
      'topup required',
    ];

    for (const err of balanceErrors) {
      expect(resolveFriendlyPaymentError(err)).toBe(
        PaymentErrorMessages.INSUFFICIENT_FUNDS
      );
    }
  });

  it('maps user cancellations and timeouts to PROMPT_CANCELLED_OR_TIMEOUT', () => {
    const cancelErrors = [
      'User cancelled transaction',
      'Transaction rejected by user',
      'USSD prompt timed out',
      'Session expired',
      'No response received from phone',
    ];

    for (const err of cancelErrors) {
      expect(resolveFriendlyPaymentError(err)).toBe(
        PaymentErrorMessages.PROMPT_CANCELLED_OR_TIMEOUT
      );
    }
  });

  it('never leaks raw HTML/JSON syntax errors or 500 codes to the user', () => {
    const techErrors = [
      'Unexpected token < in JSON at position 0',
      'SyntaxError: Failed to parse JSON',
      'HTTP 500 Internal Server Error',
      '502 Bad Gateway',
      '503 Service Unavailable',
      '504 Gateway Timeout',
    ];

    for (const err of techErrors) {
      const resolved = resolveFriendlyPaymentError(err);
      expect(resolved).not.toContain('500');
      expect(resolved).not.toContain('502');
      expect(resolved).not.toContain('SyntaxError');
      expect(resolved).not.toContain('Unexpected token');
      expect(resolved).toBe(PaymentErrorMessages.GENERIC_DECLINED);
    }
  });
});
