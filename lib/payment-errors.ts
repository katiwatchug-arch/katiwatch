/**
 * Standard User-Friendly Payment Error Messages
 * 
 * Provides clear, actionable, customer-facing error messages for
 * mobile money and card payment failures, avoiding opaque technical jargon.
 */

export const PaymentErrorMessages = {
  NETWORK_ERROR: 'Payment failed. Please check your internet connection and try again.',
  TOO_MANY_ATTEMPTS: 'Payment failed. You have made too many incomplete attempts in quick succession. Please wait a while and try again.',
  INSUFFICIENT_FUNDS: 'Payment failed. Your account does not have any funds to complete the payment. Please top up and try again.',
  PROMPT_CANCELLED_OR_TIMEOUT: 'Payment failed. The transaction timed out or was cancelled on your phone. Please approve the prompt and try again.',
  GENERIC_DECLINED: 'Payment failed. The transaction was declined by your mobile network. Please verify your phone number and try again.',
} as const;

/**
 * Resolves an upstream error message, provider code, or HTTP status into
 * a clear, customer-friendly message.
 */
export function resolveFriendlyPaymentError(
  rawError?: string | null,
  httpStatus?: number
): string {
  if (!rawError) {
    if (httpStatus === 429) {
      return PaymentErrorMessages.TOO_MANY_ATTEMPTS;
    }
    return PaymentErrorMessages.GENERIC_DECLINED;
  }

  const normalized = rawError.toLowerCase().trim();

  // 1. Poor internet connection / Client or network fetch failures
  if (
    normalized.includes('network') ||
    normalized.includes('failed to fetch') ||
    normalized.includes('fetch failed') ||
    normalized.includes('offline') ||
    normalized.includes('internet') ||
    normalized.includes('econnrefused') ||
    normalized.includes('etimedout') ||
    normalized.includes('load failed') ||
    normalized.includes('networkerror') ||
    normalized.includes('connection refused') ||
    normalized.includes('connection reset')
  ) {
    return PaymentErrorMessages.NETWORK_ERROR;
  }

  // 2. Too many attempts / duplicate requests / rapid retries
  if (
    httpStatus === 429 ||
    normalized.includes('too many') ||
    normalized.includes('rate limit') ||
    normalized.includes('duplicate') ||
    normalized.includes('pending transaction') ||
    normalized.includes('active transaction') ||
    normalized.includes('in quick succession') ||
    normalized.includes('too frequent') ||
    normalized.includes('already in progress') ||
    normalized.includes('system busy') ||
    normalized.includes('retry later')
  ) {
    return PaymentErrorMessages.TOO_MANY_ATTEMPTS;
  }

  // 3. Insufficient balance / funds
  if (
    normalized.includes('balance') ||
    normalized.includes('funds') ||
    normalized.includes('insufficient') ||
    normalized.includes('not enough') ||
    normalized.includes('low account') ||
    normalized.includes('topup') ||
    normalized.includes('top up')
  ) {
    return PaymentErrorMessages.INSUFFICIENT_FUNDS;
  }

  // 4. Cancelled or timed out on user phone (USSD session closed/expired)
  if (
    normalized.includes('cancel') ||
    normalized.includes('rejected') ||
    normalized.includes('expired') ||
    normalized.includes('user cancelled') ||
    normalized.includes('timeout') ||
    normalized.includes('timed out') ||
    normalized.includes('prompt expired') ||
    normalized.includes('no response')
  ) {
    return PaymentErrorMessages.PROMPT_CANCELLED_OR_TIMEOUT;
  }

  // 5. If the raw string is just the status word "Failed" or "Processing" or generic
  if (
    normalized === 'failed' ||
    normalized === 'declined' ||
    normalized === 'payment failed' ||
    normalized === 'transaction failed'
  ) {
    return PaymentErrorMessages.GENERIC_DECLINED;
  }

  // Return specific descriptive message if already readable
  return rawError;
}
