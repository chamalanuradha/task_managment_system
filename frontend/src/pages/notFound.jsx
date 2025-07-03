import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="text-center p-10">
      <h1 className="text-4xl font-bold mb-4">404 - Page Not Found</h1>
      <p className="mb-6">Oops! The page you are looking for does not exist.</p>
      <button
        onClick={() => navigate(-1)}
        className="text-blue-600 underline"
      >
        Go back to previous page
      </button>
    </div>
  );
}
