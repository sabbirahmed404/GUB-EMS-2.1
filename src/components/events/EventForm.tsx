import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../contexts/AuthContext';
import { useCache } from '../../contexts/CacheContext';
import { supabase } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const eventSchema = z.object({
  event_name: z.string().min(3, 'Event name must be at least 3 characters'),
  organizer_name: z.string().min(2, 'Organizer name must be at least 2 characters'),
  organizer_code: z.string().min(3, 'Organizer code must be at least 3 characters'),
  venue: z.string().min(3, 'Venue must be at least 3 characters'),
  description: z.string().optional(),
  start_date: z.string().refine(date => new Date(date) >= new Date(new Date().setHours(0, 0, 0, 0)), {
    message: 'Start date must not be in the past'
  }),
  end_date: z.string().refine(date => new Date(date) >= new Date(new Date().setHours(0, 0, 0, 0)), {
    message: 'End date must not be in the past'
  }),
  start_time: z.string(),
  end_time: z.string(),
  contact_email: z.string().email('Invalid email address'),
  contact_phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  banner_url: z.string().optional(),
  // Event Details Fields
  speakers: z.array(z.string()).optional(),
  sponsors: z.array(z.object({
    name: z.string(),
    type: z.string(),
    contact: z.string().optional()
  })).optional(),
  chief_guests: z.array(z.string()).optional(),
  session_chair: z.string().optional(),
  special_guests: z.array(z.string()).optional(),
  social_media_links: z.object({
    facebook: z.string().optional(),
    twitter: z.string().optional(),
    instagram: z.string().optional(),
    linkedin: z.string().optional(),
    website: z.string().optional()
  }).optional()
}).refine(data => {
  const start = new Date(`${data.start_date} ${data.start_time}`);
  const end = new Date(`${data.end_date} ${data.end_time}`);
  return end > start;
}, {
  message: "End date/time must be after start date/time",
  path: ["end_date"]
});

type EventFormData = z.infer<typeof eventSchema>;

interface EventFormProps {
  mode?: 'create' | 'update';
  initialData?: any;
}

export const EventForm = ({ mode = 'create', initialData }: EventFormProps) => {
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors }, reset } = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues: mode === 'create' ? {
      organizer_code: `ORG-${Math.random().toString(36).substring(2, 7).toUpperCase()}`
    } : {
      event_name: initialData?.event_name || '',
      organizer_name: initialData?.organizer_name || '',
      organizer_code: initialData?.organizer_code || '',
      venue: initialData?.venue || '',
      description: initialData?.description || '',
      start_date: initialData?.start_date?.split('T')[0] || '',
      end_date: initialData?.end_date?.split('T')[0] || '',
      start_time: initialData?.start_time || '',
      end_time: initialData?.end_time || '',
      contact_email: initialData?.contact_email || '',
      contact_phone: initialData?.contact_phone || '',
      banner_url: initialData?.banner_url || '',
      speakers: initialData?.details?.speakers || '',
      chief_guests: initialData?.details?.chief_guests || '',
      session_chair: initialData?.details?.session_chair || '',
      special_guests: initialData?.details?.special_guests || '',
      social_media_links: {
        facebook: initialData?.details?.social_media_links?.facebook || '',
        twitter: initialData?.details?.social_media_links?.twitter || '',
        instagram: initialData?.details?.social_media_links?.instagram || '',
        linkedin: initialData?.details?.social_media_links?.linkedin || '',
        website: initialData?.details?.social_media_links?.website || ''
      }
    }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user, profile } = useAuth();
  const { invalidateCache } = useCache();

  useEffect(() => {
    console.log('EventForm mounted', { mode, initialData, user, profile });
    if (!user || !profile) {
      console.error('No user or profile found');
      navigate('/test-auth');
    }
  }, [mode, initialData, user, profile, navigate]);

  // Reset form when initialData changes
  useEffect(() => {
    if (mode === 'update' && initialData) {
      reset({
        event_name: initialData.event_name || '',
        organizer_name: initialData.organizer_name || '',
        organizer_code: initialData.organizer_code || '',
        venue: initialData.venue || '',
        description: initialData.description || '',
        start_date: initialData.start_date?.split('T')[0] || '',
        end_date: initialData.end_date?.split('T')[0] || '',
        start_time: initialData.start_time || '',
        end_time: initialData.end_time || '',
        contact_email: initialData.contact_email || '',
        contact_phone: initialData.contact_phone || '',
        banner_url: initialData.banner_url || '',
        speakers: initialData.details?.speakers || '',
        chief_guests: initialData.details?.chief_guests || '',
        session_chair: initialData.details?.session_chair || '',
        special_guests: initialData.details?.special_guests || '',
        social_media_links: {
          facebook: initialData.details?.social_media_links?.facebook || '',
          twitter: initialData.details?.social_media_links?.twitter || '',
          instagram: initialData.details?.social_media_links?.instagram || '',
          linkedin: initialData.details?.social_media_links?.linkedin || '',
          website: initialData.details?.social_media_links?.website || ''
        }
      });
    }
  }, [mode, initialData, reset]);

  const generateEID = () => {
    const timestamp = Date.now().toString(36);
    const randomStr = Math.random().toString(36).substring(2, 5);
    return `EV-${timestamp}-${randomStr}`.toUpperCase();
  };

  const onSubmit = async (data: EventFormData) => {
    console.log('Form submitted with data:', data);
    try {
      setLoading(true);
      setError(null);

      if (!user?.id) {
        console.error('No user ID found');
        throw new Error('Authentication required');
      }

      // Get user_id from the users table
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('user_id')
        .eq('auth_id', user.id)
        .single();

      if (userError) {
        console.error('Error fetching user_id:', userError);
        throw new Error(`User verification failed: ${userError.message}`);
      }

      if (!userData) {
        console.error('No user data found');
        throw new Error('User profile not found');
      }

      const eventData = {
        event_name: data.event_name,
        organizer_name: data.organizer_name,
        organizer_code: data.organizer_code,
        venue: data.venue,
        description: data.description || '',
        start_date: data.start_date,
        end_date: data.end_date,
        start_time: data.start_time,
        end_time: data.end_time,
        contact_email: data.contact_email,
        contact_phone: data.contact_phone,
        banner_url: data.banner_url || null,
      };

      if (mode === 'create') {
        // Create new event
        const { data: newEvent, error: createError } = await supabase
          .from('events')
          .insert([{ ...eventData, eid: generateEID(), created_by: userData.user_id }])
          .select()
          .single();

        if (createError) throw createError;

        // Create event details
        if (newEvent) {
          const detailsData = {
            event_id: newEvent.event_id,
            speakers: data.speakers,
            chief_guests: data.chief_guests,
            session_chair: data.session_chair,
            special_guests: data.special_guests,
            social_media_links: data.social_media_links
          };

          const { error: detailsError } = await supabase
            .from('event_details')
            .insert([detailsData]);

          if (detailsError) throw detailsError;
        }
      } else {
        // Update existing event
        const { error: updateError } = await supabase
          .from('events')
          .update(eventData)
          .eq('eid', initialData.eid);

        if (updateError) throw updateError;

        // Update event details
        const detailsData = {
          speakers: data.speakers,
          chief_guests: data.chief_guests,
          session_chair: data.session_chair,
          special_guests: data.special_guests,
          social_media_links: data.social_media_links
        };

        const { error: detailsError } = await supabase
          .from('event_details')
          .update(detailsData)
          .eq('event_id', initialData.event_id);

        if (detailsError && detailsError.code !== 'PGRST116') {
          // If error is not "no rows affected", throw it
          throw detailsError;
        }
      }

      // Invalidate cache to refresh event lists
      invalidateCache('all_events');
      
      // Show success message and redirect
      alert(`Event ${mode === 'create' ? 'created' : 'updated'} successfully!`);
      navigate('/dashboard/events');
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      console.error('Error in form submission:', { error: err, message: errorMessage });
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-white p-6 rounded-lg shadow">
      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-md">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Event Name</label>
          <input
            type="text"
            {...register('event_name')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
          {errors.event_name && (
            <p className="mt-1 text-sm text-red-600">{errors.event_name.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Organizer Name</label>
          <input
            type="text"
            {...register('organizer_name')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
          {errors.organizer_name && (
            <p className="mt-1 text-sm text-red-600">{errors.organizer_name.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Organizer Code</label>
          <input
            type="text"
            {...register('organizer_code')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
          {errors.organizer_code && (
            <p className="mt-1 text-sm text-red-600">{errors.organizer_code.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Venue</label>
          <input
            type="text"
            {...register('venue')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <textarea
            {...register('description')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            rows={3}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Start Date</label>
          <input
            type="date"
            {...register('start_date')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">End Date</label>
          <input
            type="date"
            {...register('end_date')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Start Time</label>
          <input
            type="time"
            {...register('start_time')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">End Time</label>
          <input
            type="time"
            {...register('end_time')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Contact Email</label>
          <input
            type="email"
            {...register('contact_email')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Contact Phone</label>
          <input
            type="tel"
            {...register('contact_phone')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="border-t pt-6 mt-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Additional Event Details</h3>
        
        {/* Speakers */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Speakers</label>
          <div className="mt-1">
            <input
              type="text"
              {...register('speakers')}
              placeholder="Enter speakers (comma separated)"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Chief Guests */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Chief Guests</label>
          <div className="mt-1">
            <input
              type="text"
              {...register('chief_guests')}
              placeholder="Enter chief guests (comma separated)"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Session Chair */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Session Chair</label>
          <div className="mt-1">
            <input
              type="text"
              {...register('session_chair')}
              placeholder="Enter session chair name"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Special Guests */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Special Guests</label>
          <div className="mt-1">
            <input
              type="text"
              {...register('special_guests')}
              placeholder="Enter special guests (comma separated)"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Social Media Links */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Social Media Links</label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="url"
              {...register('social_media_links.facebook')}
              placeholder="Facebook URL"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
            <input
              type="url"
              {...register('social_media_links.twitter')}
              placeholder="Twitter URL"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
            <input
              type="url"
              {...register('social_media_links.instagram')}
              placeholder="Instagram URL"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
            <input
              type="url"
              {...register('social_media_links.linkedin')}
              placeholder="LinkedIn URL"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
            <input
              type="url"
              {...register('social_media_links.website')}
              placeholder="Website URL"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-4">
        <button
          type="button"
          onClick={() => {
            console.log('Canceling form submission');
            navigate('/dashboard');
          }}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {loading ? 'Creating...' : mode === 'create' ? 'Create Event' : 'Update Event'}
        </button>
      </div>
    </form>
  );
}; 