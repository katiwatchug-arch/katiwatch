import { NextRequest, NextResponse } from 'next/server';
import { OneSignalService, PushNotificationData } from '@/lib/onesignal';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      title, 
      message, 
      imageUrl, 
      url,
      data, 
      targetType = 'all', 
      targetUserIds, 
      targetSegments 
    } = body;

    // Validate required fields
    if (!title || !message) {
      return NextResponse.json(
        { error: 'Title and message are required' },
        { status: 400 }
      );
    }

    const origin = request.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL || 'https://www.katiwatch.com';
    const isLocal = origin.includes('localhost') || origin.includes('127.0.0.1');
    const defaultIconUrl = isLocal ? 'https://www.katiwatch.com/logo.png' : `${origin.replace(/\/$/, '')}/logo.png`;


    let finalImageUrl = imageUrl;
    if (finalImageUrl && finalImageUrl.startsWith('/')) {
      finalImageUrl = isLocal ? `https://www.katiwatch.com${finalImageUrl}` : `${origin.replace(/\/$/, '')}${finalImageUrl}`;
    }


    const notificationData: PushNotificationData = {
      title,
      message,
      imageUrl: finalImageUrl,
      iconUrl: defaultIconUrl,
      url,
      data,
    };

    let response;

    switch (targetType) {
      case 'users':
        if (!targetUserIds || !Array.isArray(targetUserIds)) {
          return NextResponse.json(
            { error: 'targetUserIds array is required for user targeting' },
            { status: 400 }
          );
        }
        response = await OneSignalService.sendToUsers(targetUserIds, notificationData);
        break;

      case 'segments':
        if (!targetSegments || !Array.isArray(targetSegments)) {
          return NextResponse.json(
            { error: 'targetSegments array is required for segment targeting' },
            { status: 400 }
          );
        }
        response = await OneSignalService.sendToSegments(targetSegments, notificationData);
        break;

      case 'all':
      default:
        response = await OneSignalService.sendToAll(notificationData);
        break;
    }

    return NextResponse.json({
      success: true,
      message: 'Push notification sent successfully',
      data: response
    });

  } catch (error) {
    console.error('Error in push notification API:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { 
        error: errorMessage,
        details: errorMessage
      },
      { status: 500 }
    );
  }
}

