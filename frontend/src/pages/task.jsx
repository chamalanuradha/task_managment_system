import React, { useEffect, useState } from 'react';
import {
  getTasks,
  getTaskById,
  createTasks,
  updateTasks,
  deleteTasks,
} from '../services/api';

export default function TaskPage() {
  const [tasks, setTasks] = useState([]);
  const [form, setForm] = useState({
    title: '',
    description: '',
    time: '',
    status: 'pending',
  });
  const [attachment, setAttachment] = useState(null);
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const res = await getTasks();
      setTasks(res.data.data);
    } catch (error) {
      console.error('Error loading tasks', error);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setAttachment(e.target.files[0]);
  };

  const handleEdit = async (id) => {
    try {
      const res = await getTaskById(id);
      const task = res.data.data;
      setForm({
        title: task.title,
        description: task.description,
        time: task.time,
        status: task.status,
      });
      setEditId(id);
      setErrors({});
      setSuccessMsg('');
    } catch (error) {
      console.error('Failed to load task', error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    try {
      await deleteTasks(id);
    } catch (error) {
      console.error('Delete failed', error);
    }
  };

  const validate = () => {
    const errs = {};
    if (!form.title.trim()) errs.title = 'Title is required';
    if (!form.description.trim()) errs.description = 'Description is required';
    if (!form.time) errs.time = 'Date is required';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    setSuccessMsg('');

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append('title', form.title);
    formData.append('description', form.description);
    formData.append('time', form.time);
    formData.append('status', form.status);
    if (attachment) {
      formData.append('attachment', attachment);
    }

    try {
      if (editId) {
        await updateTasks(editId, formData);
        setSuccessMsg('Task updated successfully!');
      } else {
        await createTasks(formData);
        setSuccessMsg('Task created successfully!');
      }
      setForm({ title: '', description: '', time: '', status: 'pending' });
      setAttachment(null);
      setEditId(null);
    } catch (error) {
      console.error('Submit failed', error);
      setErrors({ submit: 'Failed to submit the task' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">{editId ? 'Update Task' : 'Create Task'}</h1>

      {successMsg && <div className="mb-4 text-green-600">{successMsg}</div>}
      {errors.submit && <div className="mb-4 text-red-600">{errors.submit}</div>}

      <form onSubmit={handleSubmit} className="mb-8" encType="multipart/form-data">

        <label className="block mb-2 font-medium">Title</label>
        <input
          type="text"
          name="title"
          value={form.title}
          onChange={handleChange}
          placeholder="Enter title"
          className={`block w-full mb-1 p-2 border rounded ${errors.title ? 'border-red-500' : ''}`}
        />
        {errors.title && <p className="text-red-500 text-sm mb-2">{errors.title}</p>}

        <label className="block mb-2 font-medium">Description</label>
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="Enter description"
          className="block w-full mb-4 p-2 border rounded"
        ></textarea>
        {errors.description && <p className="text-red-500 text-sm mb-2">{errors.description}</p>}


        <label className="block mb-2 font-medium">Due Date</label>
        <input
          type="date"
          name="time"
          value={form.time}
          onChange={handleChange}
          className={`block w-full mb-1 p-2 border rounded ${errors.time ? 'border-red-500' : ''}`}
        />
        {errors.time && <p className="text-red-500 text-sm mb-2">{errors.time}</p>}

        <label className="block mb-2 font-medium">Status</label>
        <select
          name="status"
          value={form.status}
          onChange={handleChange}
          className="block w-full mb-4 p-2 border rounded"
        >
          <option value="pending">Pending</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>


        <label className="block mb-2 font-medium">Attachment</label>
        <input
          type="file"
          name="attachment"
          accept=".jpg,.jpeg,.png"
          onChange={handleFileChange}
          className="block text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 mb-6"
        />

  
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded"
          disabled={loading}
        >
          {loading ? 'Submitting...' : editId ? 'Update Task' : 'Create Task'}
        </button>
      </form>

      {/* Task List */}
      <h2 className="text-xl font-semibold mb-4">Task List</h2>
      <ul className="space-y-4">
        {tasks.map((task) => (
          <li key={task.id} className="p-4 border rounded shadow">
            <h3 className="font-semibold">{task.title}</h3>
            <p>{task.description}</p>
            <p>Status: {task.status}</p>
            <p className="text-sm text-gray-600">Due: {task.time}</p>
            <div className="space-x-4 mt-2">
              <button
                onClick={() => handleEdit(task.id)}
                className="text-blue-600 underline"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(task.id)}
                className="text-red-600 underline"
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
