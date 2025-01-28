import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../contexts/AuthContext';
import { useCache } from '../../contexts/CacheContext';
import { supabase } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';

interface ParticipantFormProps {
  eventId: string;
  onSuccess?: () => void;
}

interface ParticipantFormData {
  name: string;
  designation: string;
  phone: string;
  email: string;
  address: string;
  batch?: string;
  student_id?: string;
  gender: string;
  department: string;
}

const DEPARTMENTS = ['CSE', 'EEE', 'SWE', 'JMC', 'BBA', 'SOC', 'ENG', 'LAW', 'TEX', 'AIDS'];

export const ParticipantForm = ({ eventId, onSuccess }: ParticipantFormProps) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user, profile } = useAuth();
  const { invalidateCache } = useCache();
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm<ParticipantFormData>();

  const onSubmit = async (data: ParticipantFormData) => {
    try {
      setLoading(true);
      setError(null);

      if (!user || !profile) {
        throw new Error('You must be logged in to register for events');
      }

      // First check if the event exists and is open for registration
      const { data: eventData, error: eventError } = await supabase
        .from('events')
        .select('*')
        .eq('event_id', eventId)
        .single();

      if (eventError) {
        throw new Error('Event not found or not accessible');
      }

      // Check if registration is still open
      const eventEndDate = new Date(eventData.end_date);
      if (eventEndDate < new Date()) {
        throw new Error('Event registration has closed');
      }

      // Check if user has already registered for this event
      const { data: existingRegistration, error: checkError } = await supabase
        .from('participants')
        .select('participant_id')
        .eq('event_id', eventId)
        .eq('user_id', profile.user_id)
        .maybeSingle();

      if (checkError) {
        console.error('Error checking existing registration:', checkError);
        throw new Error('Failed to check registration status');
      }

      if (existingRegistration) {
        throw new Error('You have already registered for this event');
      }

      // Create new participant registration
      const { data: newRegistration, error: registrationError } = await supabase
        .from('participants')
        .insert({
          event_id: eventId,
          user_id: profile.user_id,
          name: data.name,
          designation: data.designation,
          phone: data.phone,
          email: data.email,
          address: data.address,
          batch: data.batch || null,
          student_id: data.student_id || null,
          gender: data.gender.toLowerCase(),
          department: data.department,
          status: 'registered'
        })
        .select()
        .single();

      if (registrationError) {
        console.error('Registration error:', registrationError);
        throw new Error('Failed to complete registration');
      }

      // Clear any cached participant data
      const cacheKey = `participants_${profile.user_id}`;
      invalidateCache(cacheKey);

      onSuccess?.();
      navigate('/dashboard/participants');
    } catch (err) {
      console.error('Error registering for event:', err);
      setError(err instanceof Error ? err.message : 'Failed to register for event');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-2xl mx-auto">
      <div className="bg-white shadow-sm rounded-lg p-6">
        {error && (
          <div className="mb-4 p-3 text-sm text-red-600 bg-red-100 rounded-md">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Full Name *</label>
            <input
              type="text"
              {...register('name', { required: 'Name is required' })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Designation *</label>
            <select
              {...register('designation', { required: 'Designation is required' })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">Select designation</option>
              <option value="Student">Student</option>
              <option value="Faculty">Faculty</option>
              <option value="Staff">Staff</option>
            </select>
            {errors.designation && (
              <p className="mt-1 text-sm text-red-600">{errors.designation.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Phone Number *</label>
            <input
              type="tel"
              {...register('phone', { required: 'Phone number is required' })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
            {errors.phone && (
              <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Email *</label>
            <input
              type="email"
              {...register('email', { required: 'Email is required' })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Address *</label>
            <textarea
              {...register('address', { required: 'Address is required' })}
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
            {errors.address && (
              <p className="mt-1 text-sm text-red-600">{errors.address.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Batch</label>
            <input
              type="text"
              {...register('batch')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Student ID</label>
            <input
              type="text"
              {...register('student_id')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Gender</label>
            <select
              {...register('gender', { required: 'Gender is required' })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
            {errors.gender && (
              <p className="mt-1 text-sm text-red-600">{errors.gender.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Department</label>
            <select
              {...register('department', { required: 'Department is required' })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">Select Department</option>
              {DEPARTMENTS.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
            {errors.department && (
              <p className="mt-1 text-sm text-red-600">{errors.department.message}</p>
            )}
          </div>
        </div>

        <div className="mt-6">
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {loading ? 'Registering...' : 'Register for Event'}
          </button>
        </div>
      </div>
    </form>
  );
}; 