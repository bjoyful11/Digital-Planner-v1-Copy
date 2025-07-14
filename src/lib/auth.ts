import { supabase } from './supabase';
import { Task, Category } from '@/types';
import { v4 as uuidv4 } from 'uuid';

// Get current user
export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};

// Load user-specific tasks from Supabase
export const loadUserTasks = async (userId: string): Promise<Task[]> => {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error loading tasks:', error);
    return [];
  }

  // Convert the raw data to proper Task objects with Date objects
  return (data || []).map((task: { [key: string]: unknown }) => {
    const newTask = new Task(
      task.name as string,
      new Date(task.date as string),
      task.time as string,
      task.importance as number,
      task.category as string,
      (task.color as string) || '#6B7280',
      (task.description as string) || ''
    );
    newTask.id = task.id as string;
    newTask.completed = task.completed as boolean;
    newTask.createdAt = new Date(task.created_at as string);
    newTask.updatedAt = new Date(task.updated_at as string);
    return newTask;
  });
};

// Save task to Supabase
export const saveTask = async (task: Task, userId: string) => {
  const { error } = await supabase
    .from('tasks')
    .insert({
      user_id: userId,
      name: task.name,
      description: task.notes || '',
      date: task.date.toISOString().split('T')[0],
      time: task.time,
      category: task.category,
      importance: task.importance,
      completed: task.completed
    });

  if (error) {
    console.error('Error saving task:', error);
    throw error;
  }
};

// Update task in Supabase
export const updateTask = async (task: Task, userId: string) => {
  const { error } = await supabase
    .from('tasks')
    .update({
      name: task.name,
      description: task.notes || '',
      date: task.date.toISOString().split('T')[0],
      time: task.time,
      category: task.category,
      importance: task.importance,
      completed: task.completed,
      updated_at: new Date().toISOString()
    })
    .eq('id', task.id)
    .eq('user_id', userId);

  if (error) {
    console.error('Error updating task:', error);
    throw error;
  }
};

// Delete task from Supabase
export const deleteTask = async (taskId: string, userId: string) => {
  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', taskId)
    .eq('user_id', userId);

  if (error) {
    console.error('Error deleting task:', error);
    throw error;
  }
};

// Load user-specific categories from Supabase
export const loadUserCategories = async (userId: string): Promise<Category[]> => {
  const { data, error } = await supabase
    .from('categories')
    .select('id, name, color, icon, is_default, is_collaborative, shared_with, created_at, invite_token, invite_expiry')
    .eq('user_id', userId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error loading categories:', error);
    return [];
  }

  return (data || []).map((category: { [key: string]: unknown }) => ({
    id: category.id as string,
    name: category.name as string,
    color: category.color as string,
    icon: category.icon as string,
    isDefault: category.is_default as boolean,
    isCollaborative: category.is_collaborative as boolean,
    sharedWith: Array.isArray(category.shared_with) ? category.shared_with as string[] : [],
    createdAt: new Date(category.created_at as string),
    invite_token: category.invite_token as string,
    invite_expiry: category.invite_expiry as string,
  }));
};

// Helper: Get UUIDs for emails from profiles table
export const getUserIdsByEmails = async (emails: string[]): Promise<string[]> => {
  if (!emails.length) return [];
  const { data, error } = await supabase
    .from('profiles')
    .select('id, email')
    .in('email', emails);
  if (error) {
    console.error('Error fetching user IDs by emails:', error);
    return [];
  }
  return (data || []).map((user: { id: string; email: string }) => user.id);
};

// Save category to Supabase
export const saveCategory = async (category: Category, userId: string) => {
  // Convert emails in sharedWith to UUIDs if they look like emails
  let sharedWithUuids: string[] = [];
  if (category.sharedWith && category.sharedWith.length > 0) {
    // Split into emails and UUIDs (naive check: if contains '@', treat as email)
    const emails = category.sharedWith.filter(x => x.includes('@'));
    const uuids = category.sharedWith.filter(x => !x.includes('@'));
    const emailUuids = await getUserIdsByEmails(emails);
    sharedWithUuids = [...uuids, ...emailUuids];
  }

  // Generate invite_token and expiry if collaborative
  let invite_token = null;
  let invite_expiry = null;
  if (category.isCollaborative) {
    invite_token = uuidv4();
    // Set expiry to 7 days from now
    invite_expiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
  }

  const { data, error } = await supabase
    .from('categories')
    .insert({
      user_id: userId,
      name: category.name,
      icon: category.icon,
      color: category.color,
      is_default: false,
      is_collaborative: !!category.isCollaborative,
      shared_with: sharedWithUuids,
      invite_token,
      invite_expiry
    })
    .select()
    .single();

  if (error) {
    console.error('Error saving category:', JSON.stringify(error, null, 2));
    throw error;
  }
  return data;
};

// Update category in Supabase
export const updateCategory = async (category: Category, userId: string) => {
  const { error } = await supabase
    .from('categories')
    .update({
      name: category.name,
      icon: category.icon,
      color: category.color,
      is_collaborative: !!category.isCollaborative,
      shared_with: category.sharedWith || []
    })
    .eq('id', category.id)
    .eq('user_id', userId);

  if (error) {
    console.error('Error updating category:', error);
    throw error;
  }
};

// Delete category from Supabase
export const deleteCategory = async (categoryId: string, userId: string) => {
  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', categoryId)
    .eq('user_id', userId);

  if (error) {
    console.error('Error deleting category:', error);
    throw error;
  }
}; 