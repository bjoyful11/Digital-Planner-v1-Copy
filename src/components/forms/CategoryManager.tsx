"use client";

import { useState, useEffect } from "react";
import { X, Plus, Edit2, Trash2, AlertCircle } from "lucide-react";
import { Category } from "@/types";
import { saveCategories } from "@/lib/utils";
import { saveCategory, updateCategory, deleteCategory } from "@/lib/auth";
import { z } from "zod";
import DOMPurify from "dompurify";

const categorySchema = z.object({
  name: z.string().min(2, "Category name must be at least 2 characters").max(20),
  icon: z.string().min(1, "Please select an icon"),
  color: z.string().min(1, "Please select a color"),
});

function containsSuspiciousLink(text: string) {
  return /https?:\/\//i.test(text);
}

interface CategoryManagerProps {
  isOpen: boolean;
  onClose: () => void;
  onCategoriesChange: (categories: Category[]) => void;
  categories: Category[];
  user?: { id: string; email?: string } | null;
}



const iconOptions = [
  '📚', '💼', '👤', '🏠', '🏃', '🎵', '🎨', '📱', '💻', '📖', 
  '✈️', '🍽️', '🛒', '🏥', '🎮', '📺', '📷', '🎯', '⭐', '💡'
];

const colorOptions = [
  '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', 
  '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6B7280'
];

export default function CategoryManager({ 
  isOpen, 
  onClose, 
  onCategoriesChange, 
  categories,
  user
}: CategoryManagerProps) {
  const [newCategory, setNewCategory] = useState({
    name: '',
    icon: '📚',
    color: '#3B82F6',
    isCollaborative: false,
    sharedWith: [] as string[],
  });
  
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editForm, setEditForm] = useState({
    name: '',
    icon: '📚',
    color: '#3B82F6',
    isCollaborative: false,
    sharedWith: [] as string[],
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [editErrors, setEditErrors] = useState<Record<string, string>>({});

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setNewCategory({ name: '', icon: '📚', color: '#3B82F6', isCollaborative: false, sharedWith: [] });
      setEditingCategory(null);
      setErrors({});
      setEditErrors({});
    }
  }, [isOpen]);

  const validateCategory = (data: { name: string; icon: string; color: string }) => {
    const result = categorySchema.safeParse(data);
    const newErrors: Record<string, string> = {};
    if (!result.success) {
      for (const err of result.error.issues) {
        const key = err.path[0];
        if (typeof key === 'string') {
          newErrors[key] = err.message;
        }
      }
    }
    if (containsSuspiciousLink(data.name)) {
      newErrors.name = "Links are not allowed in the category name.";
    }
    return newErrors;
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors = validateCategory(newCategory);
    setErrors(newErrors);
    if (Object.keys(newErrors).length === 0) {
      const nameExists = categories.some(
        cat => cat.name.toLowerCase() === newCategory.name.trim().toLowerCase()
      );
      if (nameExists) {
        setErrors({ name: "A category with this name already exists" });
        return;
      }
      // Sanitize name
      const sanitizedName = DOMPurify.sanitize(newCategory.name.trim());
      const category: Category = {
        id: `category_${Date.now()}`,
        name: sanitizedName,
        icon: newCategory.icon,
        color: newCategory.color,
        isCollaborative: newCategory.isCollaborative,
        sharedWith: newCategory.sharedWith,
      };
      const updatedCategories = [...categories, category];
      if (user) {
        try {
          await saveCategory(category, user.id);
          onCategoriesChange(updatedCategories);
        } catch (error) {
          console.error('Error saving category:', error);
        }
      } else {
        saveCategories(updatedCategories);
        onCategoriesChange(updatedCategories);
      }
      setNewCategory({ name: '', icon: '📚', color: '#3B82F6', isCollaborative: false, sharedWith: [] });
      setErrors({});
    }
  };

  const handleEditCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory) return;
    const newErrors = validateCategory(editForm);
    setEditErrors(newErrors);
    if (Object.keys(newErrors).length === 0) {
      const nameExists = categories.some(
        cat => cat.id !== editingCategory.id && 
               cat.name.toLowerCase() === editForm.name.trim().toLowerCase()
      );
      if (nameExists) {
        setEditErrors({ name: "A category with this name already exists" });
        return;
      }
      // Sanitize name
      const sanitizedName = DOMPurify.sanitize(editForm.name.trim());
      const updatedCategory: Category = {
        ...editingCategory,
        name: sanitizedName,
        icon: editForm.icon,
        color: editForm.color,
        isCollaborative: editForm.isCollaborative,
        sharedWith: editForm.sharedWith,
      };
      const updatedCategories = categories.map(cat => 
        cat.id === editingCategory.id ? updatedCategory : cat
      );
      if (user) {
        try {
          await updateCategory(updatedCategory, user.id);
          onCategoriesChange(updatedCategories);
        } catch (error) {
          console.error('Error updating category:', error);
        }
      } else {
        saveCategories(updatedCategories);
        onCategoriesChange(updatedCategories);
      }
      setEditingCategory(null);
      setEditErrors({});
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    const category = categories.find(cat => cat.id === categoryId);
    if (!category) return;

    if (window.confirm(`Are you sure you want to delete "${category.name}"? This action cannot be undone.`)) {
      const updatedCategories = categories.filter(cat => cat.id !== categoryId);
      
      if (user) {
        try {
          await deleteCategory(categoryId, user.id);
          onCategoriesChange(updatedCategories);
        } catch (error) {
          console.error('Error deleting category:', error);
        }
      } else {
        saveCategories(updatedCategories);
        onCategoriesChange(updatedCategories);
      }
    }
  };

  const startEditing = (category: Category) => {
    setEditingCategory(category);
    setEditForm({
      name: category.name,
      icon: category.icon,
      color: category.color,
      isCollaborative: category.isCollaborative ?? false,
      sharedWith: Array.isArray(category.sharedWith) ? category.sharedWith : [],
    });
  };

  const cancelEditing = () => {
    setEditingCategory(null);
    setEditErrors({});
  };

  const handleInputChange = (field: string, value: any) => {
    setNewCategory(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const handleEditInputChange = (field: string, value: any) => {
    setEditForm(prev => ({ ...prev, [field]: value }));
    if (editErrors[field]) {
      setEditErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Manage Categories
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Add New Category Form */}
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Add New Category
            </h3>
            <form onSubmit={handleAddCategory} className="space-y-4">
              <div>
                <label htmlFor="categoryName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Category Name *
                </label>
                <input
                  type="text"
                  id="categoryName"
                  value={newCategory.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.name 
                      ? "border-red-500 focus:ring-red-500" 
                      : "border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  }`}
                  placeholder="Enter category name"
                />
                {errors.name && (
                  <div className="flex items-center mt-1 text-red-600 dark:text-red-400 text-sm">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.name}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Icon Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Icon *
                  </label>
                  <div className="grid grid-cols-5 gap-2 max-h-32 overflow-y-auto border border-gray-300 dark:border-gray-600 rounded-lg p-2">
                    {iconOptions.map((icon) => (
                      <button
                        key={icon}
                        type="button"
                        onClick={() => handleInputChange("icon", icon)}
                        className={`p-2 rounded-lg text-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                          newCategory.icon === icon 
                            ? "bg-blue-100 dark:bg-blue-900/20 border-2 border-blue-500" 
                            : ""
                        }`}
                      >
                        {icon}
                      </button>
                    ))}
                  </div>
                  {errors.icon && (
                    <div className="flex items-center mt-1 text-red-600 dark:text-red-400 text-sm">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.icon}
                    </div>
                  )}
                </div>

                {/* Color Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Color *
                  </label>
                  <div className="grid grid-cols-5 gap-2 max-h-32 overflow-y-auto border border-gray-300 dark:border-gray-600 rounded-lg p-2">
                    {colorOptions.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => handleInputChange("color", color)}
                        className={`w-8 h-8 rounded-lg border-2 transition-colors ${
                          newCategory.color === color 
                            ? "border-gray-800 dark:border-white" 
                            : "border-gray-300 dark:border-gray-600"
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                  {errors.color && (
                    <div className="flex items-center mt-1 text-red-600 dark:text-red-400 text-sm">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.color}
                    </div>
                  )}
                </div>
              </div>
              {/* Collaborative Toggle */}
              <div>
                <label className="flex items-center gap-2 mt-4">
                  <input
                    type="checkbox"
                    checked={Boolean(newCategory.isCollaborative)}
                    onChange={e => handleInputChange('isCollaborative', e.target.checked)}
                  />
                  Collaborative Category
                </label>
                {newCategory.isCollaborative && (
                  <div className="mt-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Invite Friends (comma-separated emails)
                    </label>
                    <input
                      type="text"
                      value={Array.isArray(newCategory.sharedWith) ? newCategory.sharedWith.join(', ') : ''}
                      onChange={e => handleInputChange('sharedWith', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                      placeholder="friend1@email.com, friend2@email.com"
                    />
                  </div>
                )}
              </div>

              <button
                type="submit"
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4 inline mr-2" />
                Add Category
              </button>
            </form>
          </div>

          {/* Existing Categories */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Existing Categories
            </h3>
            <div className="space-y-3">
              {categories.map((category) => (
                <div 
                  key={category.id}
                  className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{category.icon}</span>
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {category.name}
                      </h4>
                      <div 
                        className="w-4 h-2 rounded-full mt-1"
                        style={{ backgroundColor: category.color }}
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => startEditing(category)}
                      className="p-2 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors"
                      title="Edit category"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteCategory(category.id)}
                      className="p-2 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 transition-colors"
                      title="Delete category"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Edit Category Modal */}
          {editingCategory && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Edit Category
                  </h3>
                  <button
                    onClick={cancelEditing}
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleEditCategory} className="p-6 space-y-4">
                  <div>
                    <label htmlFor="editCategoryName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Category Name *
                    </label>
                    <input
                      type="text"
                      id="editCategoryName"
                      value={editForm.name}
                      onChange={(e) => handleEditInputChange("name", e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        editErrors.name 
                          ? "border-red-500 focus:ring-red-500" 
                          : "border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                      }`}
                      placeholder="Enter category name"
                    />
                    {editErrors.name && (
                      <div className="flex items-center mt-1 text-red-600 dark:text-red-400 text-sm">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {editErrors.name}
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {/* Icon Selection */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Icon *
                      </label>
                      <div className="grid grid-cols-5 gap-2 max-h-32 overflow-y-auto border border-gray-300 dark:border-gray-600 rounded-lg p-2">
                        {iconOptions.map((icon) => (
                          <button
                            key={icon}
                            type="button"
                            onClick={() => handleEditInputChange("icon", icon)}
                            className={`p-2 rounded-lg text-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                              editForm.icon === icon 
                                ? "bg-blue-100 dark:bg-blue-900/20 border-2 border-blue-500" 
                                : ""
                            }`}
                          >
                            {icon}
                          </button>
                        ))}
                      </div>
                      {editErrors.icon && (
                        <div className="flex items-center mt-1 text-red-600 dark:text-red-400 text-sm">
                          <AlertCircle className="w-4 h-4 mr-1" />
                          {editErrors.icon}
                        </div>
                      )}
                    </div>

                    {/* Color Selection */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Color *
                      </label>
                      <div className="grid grid-cols-5 gap-2 max-h-32 overflow-y-auto border border-gray-300 dark:border-gray-600 rounded-lg p-2">
                        {colorOptions.map((color) => (
                          <button
                            key={color}
                            type="button"
                            onClick={() => handleEditInputChange("color", color)}
                            className={`w-8 h-8 rounded-lg border-2 transition-colors ${
                              editForm.color === color 
                                ? "border-gray-800 dark:border-white" 
                                : "border-gray-300 dark:border-gray-600"
                            }`}
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                      {editErrors.color && (
                        <div className="flex items-center mt-1 text-red-600 dark:text-red-400 text-sm">
                          <AlertCircle className="w-4 h-4 mr-1" />
                          {editErrors.color}
                        </div>
                      )}
                    </div>
                  </div>
                  {/* Collaborative Toggle */}
                  <div>
                    <label className="flex items-center gap-2 mt-4">
                      <input
                        type="checkbox"
                        checked={Boolean(editForm.isCollaborative)}
                        onChange={e => handleEditInputChange('isCollaborative', e.target.checked)}
                      />
                      Collaborative Category
                    </label>
                    {editForm.isCollaborative && (
                      <div className="mt-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Invite Friends (comma-separated emails)
                        </label>
                        <input
                          type="text"
                          value={Array.isArray(editForm.sharedWith) ? editForm.sharedWith.join(', ') : ''}
                          onChange={e => handleEditInputChange('sharedWith', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                          placeholder="friend1@email.com, friend2@email.com"
                        />
                      </div>
                    )}
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={cancelEditing}
                      className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Update Category
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 