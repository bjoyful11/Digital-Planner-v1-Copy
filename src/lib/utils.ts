import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { Category } from "@/types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Date utilities
export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

export function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });
}

export function isToday(date: Date): boolean {
  const today = new Date();
  return date.getDate() === today.getDate() &&
         date.getMonth() === today.getMonth() &&
         date.getFullYear() === today.getFullYear();
}

export function isSameDay(date1: Date, date2: Date): boolean {
  return date1.getDate() === date2.getDate() &&
         date1.getMonth() === date2.getMonth() &&
         date1.getFullYear() === date2.getFullYear();
}

// Create a date from a date string without timezone issues
export function createDateFromString(dateString: string): Date {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day); // month is 0-indexed in Date constructor
}

// Convert date to YYYY-MM-DD format for input fields
export function dateToInputString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Default categories
export const DEFAULT_CATEGORIES: Category[] = [
  {
    id: 'school',
    name: 'School',
    color: '#3B82F6',
    icon: '📚'
  },
  {
    id: 'work',
    name: 'Work',
    color: '#10B981',
    icon: '💼'
  },
  {
    id: 'personal',
    name: 'Personal',
    color: '#F59E0B',
    icon: '👤'
  }
];

// Category utilities
export function getCategoryColor(categoryId: string, categories: Category[]): string {
  const category = categories.find(c => c.id === categoryId);
  return category?.color || '#6B7280';
}

export function getCategoryIcon(categoryId: string, categories: Category[]): string {
  const category = categories.find(c => c.id === categoryId);
  return category?.icon || '📝';
}

export function getCategoryName(categoryId: string, categories: Category[]): string {
  const category = categories.find(c => c.id === categoryId);
  return category?.name || 'Unknown';
}

// Local storage utilities
export function saveToLocalStorage<T>(key: string, data: T): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(key, JSON.stringify(data));
  }
}

export function loadFromLocalStorage<T>(key: string, defaultValue: T): T {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem(key);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (error) {
        console.error('Error parsing localStorage data:', error);
      }
    }
  }
  return defaultValue;
}

// Category management utilities
export function loadCategories(): Category[] {
  const stored = loadFromLocalStorage<Category[]>('categories', []);
  if (stored.length === 0) {
    // Initialize with default categories if none exist
    return DEFAULT_CATEGORIES;
  }
  return stored;
}

export function saveCategories(categories: Category[]): void {
  saveToLocalStorage('categories', categories);
} 