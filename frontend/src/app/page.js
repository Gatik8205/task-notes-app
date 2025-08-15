'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Check, X, Save } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function TaskNotesApp() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingTask, setEditingTask] = useState(null);
  const [newTask, setNewTask] = useState({ title: '', content: '' });
  const [showAddForm, setShowAddForm] = useState(false);

  // Fetch tasks from API
  const fetchTasks = async () => {
    try {
      const response = await fetch(`${API_URL}/tasks`);
      if (response.ok) {
        const data = await response.json();
        setTasks(data);
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  // Create new task
  const createTask = async () => {
    if (!newTask.title.trim() || !newTask.content.trim()) return;

    try {
      const response = await fetch(`${API_URL}/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newTask),
      });

      if (response.ok) {
        const data = await response.json();
        setTasks([data, ...tasks]);
        setNewTask({ title: '', content: '' });
        setShowAddForm(false);
      }
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  // Update task
  const updateTask = async (id, updates) => {
    try {
      const response = await fetch(`${API_URL}/tasks/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (response.ok) {
        const data = await response.json();
        setTasks(tasks.map(task => task.id === id ? data : task));
        setEditingTask(null);
      }
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  // Delete task
  const deleteTask = async (id) => {
    try {
      const response = await fetch(`${API_URL}/tasks/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setTasks(tasks.filter(task => task.id !== id));
      }
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  // Toggle task completion
  const toggleComplete = async (id, completed) => {
    await updateTask(id, { completed: !completed });
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading tasks...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Task Notes</h1>
          <p className="text-gray-600">Organize your tasks and notes in one place</p>
        </div>

        {/* Add Task Button */}
        <div className="mb-6">
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 mx-auto transition-colors"
          >
            <Plus size={20} />
            Add New Task
          </button>
        </div>

        {/* Add Task Form */}
        {showAddForm && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-gray-200">
            <h3 className="text-xl font-semibold mb-4 text-gray-800">Create New Task</h3>
            <input
              type="text"
              placeholder="Task title..."
              value={newTask.title}
              onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg mb-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <textarea
              placeholder="Task content..."
              value={newTask.content}
              onChange={(e) => setNewTask({ ...newTask, content: e.target.value })}
              rows={4}
              className="w-full p-3 border border-gray-300 rounded-lg mb-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <div className="flex gap-2">
              <button
                onClick={createTask}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
              >
                <Save size={16} />
                Save Task
              </button>
              <button
                onClick={() => {
                  setShowAddForm(false);
                  setNewTask({ title: '', content: '' });
                }}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
              >
                <X size={16} />
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Tasks Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {tasks.map((task) => (
            <div key={task.id} className={`bg-white rounded-xl shadow-lg p-6 border transition-all hover:shadow-xl ${
              task.completed ? 'border-green-300 bg-green-50' : 'border-gray-200'
            }`}>
              {editingTask === task.id ? (
                <EditForm
                  task={task}
                  onSave={(updates) => updateTask(task.id, updates)}
                  onCancel={() => setEditingTask(null)}
                />
              ) : (
                <TaskCard
                  task={task}
                  onEdit={() => setEditingTask(task.id)}
                  onDelete={() => deleteTask(task.id)}
                  onToggleComplete={() => toggleComplete(task.id, task.completed)}
                />
              )}
            </div>
          ))}
        </div>

        {tasks.length === 0 && (
          <div className="text-center text-gray-500 mt-12">
            <div className="text-6xl mb-4">📝</div>
            <p className="text-xl">No tasks yet. Create your first task to get started!</p>
          </div>
        )}
      </div>
    </div>
  );
}

function TaskCard({ task, onEdit, onDelete, onToggleComplete }) {
  return (
    <>
      <div className="flex items-start justify-between mb-3">
        <h3 className={`text-lg font-semibold ${task.completed ? 'line-through text-gray-500' : 'text-gray-800'}`}>
          {task.title}
        </h3>
        <div className="flex gap-1">
          <button
            onClick={onToggleComplete}
            className={`p-1.5 rounded-lg transition-colors ${
              task.completed 
                ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            title={task.completed ? 'Mark as incomplete' : 'Mark as complete'}
          >
            <Check size={16} />
          </button>
          <button
            onClick={onEdit}
            className="p-1.5 bg-blue-100 text-blue-600 hover:bg-blue-200 rounded-lg transition-colors"
            title="Edit task"
          >
            <Edit2 size={16} />
          </button>
          <button
            onClick={onDelete}
            className="p-1.5 bg-red-100 text-red-600 hover:bg-red-200 rounded-lg transition-colors"
            title="Delete task"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
      
      <p className={`text-gray-600 mb-4 leading-relaxed ${task.completed ? 'line-through' : ''}`}>
        {task.content}
      </p>
      
      <div className="text-xs text-gray-400 border-t pt-3">
        Created: {new Date(task.createdAt).toLocaleDateString()}
        {task.updatedAt !== task.createdAt && (
          <div>Updated: {new Date(task.updatedAt).toLocaleDateString()}</div>
        )}
      </div>
    </>
  );
}

function EditForm({ task, onSave, onCancel }) {
  const [title, setTitle] = useState(task.title);
  const [content, setContent] = useState(task.content);

  const handleSave = () => {
    if (title.trim() && content.trim()) {
      onSave({ title, content });
    }
  };

  return (
    <>
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full p-2 border border-gray-300 rounded-lg mb-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        placeholder="Task title..."
      />
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={3}
        className="w-full p-2 border border-gray-300 rounded-lg mb-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        placeholder="Task content..."
      />
      <div className="flex gap-2">
        <button
          onClick={handleSave}
          className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg flex items-center gap-2 text-sm transition-colors"
        >
          <Save size={14} />
          Save
        </button>
        <button
          onClick={onCancel}
          className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1.5 rounded-lg flex items-center gap-2 text-sm transition-colors"
        >
          <X size={14} />
          Cancel
        </button>
      </div>
    </>
  );
}