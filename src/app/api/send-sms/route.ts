import { NextResponse } from 'next/server';
// import twilio from 'twilio';

// TODO: Uncomment when Twilio is approved
// const accountSid = process.env.TWILIO_ACCOUNT_SID;
// const authToken = process.env.TWILIO_AUTH_TOKEN;
// const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;
// const client = twilio(accountSid, authToken);

export async function POST(request: Request) {
  try {
    const { phoneNumber, message } = await request.json();

    console.log('Sending SMS to:', phoneNumber);
    console.log('Message:', message);

    // TODO: Uncomment this when Twilio approves
    // await client.messages.create({
    //   body: message,
    //   from: twilioPhoneNumber,
    //   to: phoneNumber
    // });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('SMS sending error:', error);
    return NextResponse.json(
      { error: 'Failed to send SMS' },
      { status: 500 }
    );
  }
} 