import { useState } from 'react';

interface FormData {
  name: string;
  email: string;
  studentId: string;
}

export default function RegistrationForm() {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    studentId: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <input
          type="text"
          placeholder="Full Name"
          className="w-full px-4 py-3 rounded-full border border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        />
      </div>
      <div>
        <input
          type="email"
          placeholder="Email"
          className="w-full px-4 py-3 rounded-full border border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        />
      </div>
      <div>
        <input
          type="text"
          placeholder="Student ID"
          className="w-full px-4 py-3 rounded-full border border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition"
          value={formData.studentId}
          onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
        />
      </div>
      <button
        type="submit"
        className="w-full bg-primary hover:bg-accent text-white py-3 px-6 rounded-full font-semibold transition-colors duration-300"
      >
        Get Started
      </button>
    </form>
  );
}