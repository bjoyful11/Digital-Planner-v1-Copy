import { supabase } from './supabase';
import { Task, Category } from '@/types';

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
  return (data || []).map((task: any) => ({
    ...task,
    date: new Date(task.date),
    createdAt: new Date(task.created_at),
    updatedAt: new Date(task.updated_at),
    notes: task.description || ''
  }));
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
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error loading categories:', error);
    return [];
  }

  // Convert the raw data to proper Category objects
  return (data || []).map((category: any) => ({
    ...category,
    createdAt: new Date(category.created_at)
  }));
};

// Save category to Supabase
export const saveCategory = async (category: Category, userId: string) => {
  const { error } = await supabase
    .from('categories')
    .insert({
      user_id: userId,
      name: category.name,
      icon: category.icon,
      color: category.color,
      is_default: false
    });

  if (error) {
    console.error('Error saving category:', error);
    throw error;
  }
};

// Update category in Supabase
export const updateCategory = async (category: Category, userId: string) => {
  const { error } = await supabase
    .from('categories')
    .update({
      name: category.name,
      icon: category.icon,
      color: category.color
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