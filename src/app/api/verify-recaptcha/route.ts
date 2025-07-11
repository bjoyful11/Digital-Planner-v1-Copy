import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { token } = await req.json();
  const secret = process.env.RECAPTCHA_SECRET_KEY;

  if (!token || !secret) {
    return NextResponse.json({ error: 'Missing token or secret key' }, { status: 400 });
  }

  const params = new URLSearchParams();
  params.append('secret', secret);
  params.append('response', token);

  const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
  });

  const data = await response.json();

  if (data.success) {
    return NextResponse.json({ success: true });
  } else {
    return NextResponse.json({ success: false, error: data['error-codes'] }, { status: 400 });
  }
} 