import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  const { invite_token, userId } = await req.json();
  if (!invite_token || !userId) {
    return NextResponse.json({ error: 'Missing invite_token or userId' }, { status: 400 });
  }
  // Find category with valid invite_token and expiry
  const { data: category, error } = await supabase
    .from('categories')
    .select('id, invite_expiry')
    .eq('invite_token', invite_token)
    .single();

  if (error || !category) {
    return NextResponse.json({ error: 'Invalid invite link' }, { status: 400 });
  }
  if (new Date(category.invite_expiry) < new Date()) {
    return NextResponse.json({ error: 'Invite link expired' }, { status: 400 });
  }
  // Add user as viewer if not already a collaborator
  const { data: existing } = await supabase
    .from('category_collaborators')
    .select('id')
    .eq('categoryId', category.id)
    .eq('userId', userId)
    .single();

  if (!existing) {
    await supabase.from('category_collaborators').insert({
      categoryId: category.id,
      userId,
      permission: 'viewer',
    });
  }
  return NextResponse.json({ success: true, categoryId: category.id });
} 