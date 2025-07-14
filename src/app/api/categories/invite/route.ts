import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { randomUUID } from 'crypto';
import nodemailer from 'nodemailer';
import { cookies } from 'next/headers';

async function isAdmin(userId: string, categoryId: string): Promise<boolean> {
  const { data } = await supabase
    .from('category_collaborators')
    .select('permission')
    .eq('categoryId', categoryId)
    .eq('userId', userId)
    .single();
  return data?.permission === 'admin';
}

// Helper to send email (configure SMTP as needed)
async function sendInviteEmail(to: string, inviteLink: string) {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.example.com',
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER || 'user@example.com',
      pass: process.env.SMTP_PASS || 'password',
    },
  });

  await transporter.sendMail({
    from: process.env.SMTP_FROM || 'noreply@example.com',
    to,
    subject: 'You have been invited to join a category',
    text: `You have been invited! Click here to join: ${inviteLink}`,
    html: `<p>You have been invited! Click <a href="${inviteLink}">here</a> to join.</p>`,
  });
}

export async function POST(req: NextRequest) {
  const { categoryId, email, expiryDays = 7 } = await req.json();
  if (!categoryId || !email) {
    return NextResponse.json({ error: 'Missing categoryId or email' }, { status: 400 });
  }

  // Get user from Supabase session using access token from cookies
  const cookieStore = await cookies();
  const access_token = cookieStore.get('sb-access-token')?.value;
  if (!access_token) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }
  const { data: { user }, error: userError } = await supabase.auth.getUser(access_token);
  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  if (!(await isAdmin(user.id, categoryId))) {
    return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
  }
  const invite_token = randomUUID();
  const invite_expiry = new Date(Date.now() + expiryDays * 24 * 60 * 60 * 1000).toISOString();

  const { error } = await supabase
    .from('categories')
    .update({ invite_token, invite_expiry })
    .eq('id', categoryId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Send invite email
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const inviteLink = `${appUrl}/join/${invite_token}`;
  try {
    await sendInviteEmail(email, inviteLink);
  } catch (e) {
    return NextResponse.json({ error: 'Failed to send invite email' }, { status: 500 });
  }

  return NextResponse.json({ invite_link: inviteLink, invite_expiry });
}

export async function DELETE(req: NextRequest) {
  const { categoryId, userId } = await req.json();
  if (!categoryId || !userId) {
    return NextResponse.json({ error: 'Missing categoryId or userId' }, { status: 400 });
  }
  if (!(await isAdmin(userId, categoryId))) {
    return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
  }
  const { error } = await supabase
    .from('categories')
    .update({ invite_token: null, invite_expiry: null })
    .eq('id', categoryId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ success: true });
} 