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
  const { categoryId, userId, permission, adminId } = await req.json();
  if (!categoryId || !userId || !permission || !adminId) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }
  if (!(await isAdmin(adminId, categoryId))) {
    return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
  }
  const { error } = await supabase.from('category_collaborators').insert({
    categoryId,
    userId,
    permission,
    added_by: adminId,
  });
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ success: true });
}

export async function PATCH(req: NextRequest) {
  const { categoryId, userId, permission, adminId } = await req.json();
  if (!categoryId || !userId || !permission || !adminId) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }
  if (!(await isAdmin(adminId, categoryId))) {
    return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
  }
  const { error } = await supabase
    .from('category_collaborators')
    .update({ permission })
    .eq('categoryId', categoryId)
    .eq('userId', userId);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest) {
  const { categoryId, userId, adminId } = await req.json();
  if (!categoryId || !userId || !adminId) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }
  if (!(await isAdmin(adminId, categoryId))) {
    return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
  }
  const { error } = await supabase
    .from('category_collaborators')
    .delete()
    .eq('categoryId', categoryId)
    .eq('userId', userId);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ success: true });
} 