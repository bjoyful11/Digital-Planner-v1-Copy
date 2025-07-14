import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

async function isAdmin(userId: string, categoryId: string): Promise<boolean> {
  const { data } = await supabase
    .from('category_collaborators')
    .select('permission')
    .eq('categoryId', categoryId)
    .eq('userId', userId)
    .single();
  return data?.permission === 'admin';
}

export async function POST(req: NextRequest) {
  const { categoryId, fromUserId, toUserId } = await req.json();
  if (!categoryId || !fromUserId || !toUserId) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }
  if (!(await isAdmin(fromUserId, categoryId))) {
    return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
  }
  // Set toUserId as admin
  const { error: promoteError } = await supabase
    .from('category_collaborators')
    .update({ permission: 'admin' })
    .eq('categoryId', categoryId)
    .eq('userId', toUserId);
  // Optionally demote fromUserId
  const { error: demoteError } = await supabase
    .from('category_collaborators')
    .update({ permission: 'editor' })
    .eq('categoryId', categoryId)
    .eq('userId', fromUserId);
  if (promoteError || demoteError) {
    return NextResponse.json({ error: promoteError?.message || demoteError?.message }, { status: 500 });
  }
  return NextResponse.json({ success: true });
} 