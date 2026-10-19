import { NextRequest, NextResponse } from 'next/server';
import { MakyPayService } from '@/lib/makypay';
import { resolveFriendlyPaymentError, PaymentErrorMessages } from '@/lib/payment-errors';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { transactionId } = body;

    if (!transactionId) {
      return NextResponse.json(
        { error: 'Missing transactionId' },
        { status: 400 }
      );
    }

    // Single status check — frontend drives the polling loop
    const result = await MakyPayService.checkTransactionStatus(transactionId);

    return NextResponse.json({
      success: true,
      transaction: result,
    });

  } catch (error) {
    console.error('MakyPay status check error:', error);

    const rawError = error instanceof Error ? error.message : 'Status check failed';
    const isTooMany = rawError.includes('429') ||
      rawError.toLowerCase().includes('too many') ||
      rawError.toLowerCase().includes('rate limit');

    return NextResponse.json(
      {
        error: isTooMany ? PaymentErrorMessages.TOO_MANY_ATTEMPTS : resolveFriendlyPaymentError(rawError),
        success: false
      },
      { status: isTooMany ? 429 : 500 }
    );
  }
}
