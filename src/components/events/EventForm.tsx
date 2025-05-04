import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Dialog } from '@headlessui/react';
import { VenueSelect } from './VenueSelect';

interface EventFormData {
  event_name: string;
  description: string;
  venue: string;
  start_date: string;
  end_date: string;
  start_time: string;
  end_time: string;
  organizer_name: string;
  organizer_code: string;
  contact_email: string;
  contact_phone: string;
  speakers: string;
  chief_guests: string;
  session_chair: string;
  special_guests: string;
  social_media_links: {
    facebook: string;
    twitter: string;
    instagram: string;
    linkedin: string;
    website: string;
  };
}

interface EventFormProps {
  mode: 'create' | 'update';
  initialData?: any;
  onClose?: () => void;
}

export function EventForm({ mode, initialData, onClose }: EventFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { register, handleSubmit, formState: { errors }, control, watch } = useForm<EventFormData>({
    defaultValues: mode === 'update' ? {
      ...initialData,
      start_date: initialData?.start_date?.split('T')[0],
      end_date: initialData?.end_date?.split('T')[0],
      start_time: initialData?.start_time,
      end_time: initialData?.end_time,
      speakers: initialData?.details?.speakers?.join(', ') || '',
      chief_guests: initialData?.details?.chief_guests?.join(', ') || '',
      session_chair: initialData?.details?.session_chair || '',
      special_guests: initialData?.details?.special_guests?.join(', ') || '',
      social_media_links: initialData?.details?.social_media_links || {
        facebook: '',
        twitter: '',
        instagram: '',
        linkedin: '',
        website: ''
      }
    } : undefined
  });

  // Watch for date/time changes to pass to VenueSelect
  const startDate = watch('start_date');
  const endDate = watch('end_date');
  const startTime = watch('start_time');
  const endTime = watch('end_time');

  const onSubmit = async (formData: EventFormData) => {
    try {
      console.log('Starting form submission with context:', { mode, userId: profile?.user_id, formData });
      setLoading(true);
      setError(null);

      if (!user || !profile) {
        throw new Error('You must be logged in to create/update events');
      }

      // Format dates and times
      const startDate = new Date(formData.start_date);
      const endDate = new Date(formData.end_date);
      
      console.log('Formatted dates:', {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        startTime: formData.start_time,
        endTime: formData.end_time
      });

      if (mode === 'create') {
        console.log('Creating new event...');
        
        // Split comma-separated strings into arrays
        const speakers = formData.speakers ? formData.speakers.split(',').map(s => s.trim()) : [];
        const chiefGuests = formData.chief_guests ? formData.chief_guests.split(',').map(s => s.trim()) : [];
        const specialGuests = formData.special_guests ? formData.special_guests.split(',').map(s => s.trim()) : [];

        // Call the new RPC function
        const { data: eventData, error: eventError } = await supabase.rpc(
          'create_event_with_details',
          {
            p_event_name: formData.event_name,
            p_description: formData.description,
            p_venue: formData.venue,
            p_start_date: formData.start_date,
            p_start_time: formData.start_time,
            p_end_date: formData.end_date,
            p_end_time: formData.end_time,
            p_organizer_name: formData.organizer_name,
            p_organizer_code: formData.organizer_code,
            p_contact_email: formData.contact_email,
            p_contact_phone: formData.contact_phone,
            p_speakers: speakers,
            p_chief_guests: chiefGuests,
            p_session_chair: formData.session_chair,
            p_special_guests: specialGuests,
            p_social_media_links: formData.social_media_links
          }
        );

        if (eventError) {
          console.error('Error creating event:', eventError);
          throw new Error(eventError.message);
        }

        console.log('Event created successfully:', eventData);
      } else {
        // Handle update logic using a single transaction via RPC
        const { data: eventData, error: eventError } = await supabase.rpc(
          'update_event_with_details',
          {
            p_event_id: initialData.event_id,
            p_event_name: formData.event_name,
            p_description: formData.description,
            p_venue: formData.venue,
            p_start_date: formData.start_date,
            p_start_time: formData.start_time,
            p_end_date: formData.end_date,
            p_end_time: formData.end_time,
            p_organizer_name: formData.organizer_name,
            p_organizer_code: formData.organizer_code,
            p_contact_email: formData.contact_email,
            p_contact_phone: formData.contact_phone,
            p_speakers: formData.speakers ? formData.speakers.split(',').map(s => s.trim()) : [],
            p_chief_guests: formData.chief_guests ? formData.chief_guests.split(',').map(s => s.trim()) : [],
            p_session_chair: formData.session_chair,
            p_special_guests: formData.special_guests ? formData.special_guests.split(',').map(s => s.trim()) : [],
            p_social_media_links: formData.social_media_links
          }
        );

        if (eventError) {
          console.error('Error updating event:', eventError);
          throw new Error(eventError.message);
        }

        console.log('Event updated successfully:', eventData);
      }

      setShowSuccessDialog(true);
    } catch (err) {
      console.error('Error in form submission:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleDialogClose = () => {
    setShowSuccessDialog(false);
    
    if (onClose) {
      onClose();
    } else {
      if (mode === 'create') {
        navigate('/dashboard/events');
      } else {
        navigate('/dashboard');
      }
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded relative">
            {error}
          </div>
        )}

        <div className="bg-white shadow rounded-lg p-6 space-y-6">
          <h2 className="text-xl font-semibold border-b pb-2">Basic Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Event Name *</label>
              <input
                type="text"
                {...register('event_name', { required: 'Event name is required' })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
              />
              {errors.event_name && (
                <p className="mt-1 text-sm text-red-600">{errors.event_name.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Venue *</label>
              <Controller
                name="venue"
                control={control}
                rules={{ required: 'Venue is required' }}
                render={({ field }) => (
                  <VenueSelect
                    value={field.value}
                    onChange={field.onChange}
                    startDate={startDate}
                    endDate={endDate}
                    startTime={startTime}
                    endTime={endTime}
                    currentEventId={initialData?.event_id}
                  />
                )}
              />
              {errors.venue && (
                <p className="mt-1 text-sm text-red-600">{errors.venue.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Start Date *</label>
              <input
                type="date"
                {...register('start_date', { required: 'Start date is required' })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
              />
              {errors.start_date && (
                <p className="mt-1 text-sm text-red-600">{errors.start_date.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">End Date *</label>
              <input
                type="date"
                {...register('end_date', { required: 'End date is required' })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
              />
              {errors.end_date && (
                <p className="mt-1 text-sm text-red-600">{errors.end_date.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Start Time *</label>
              <input
                type="time"
                {...register('start_time', { required: 'Start time is required' })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
              />
              {errors.start_time && (
                <p className="mt-1 text-sm text-red-600">{errors.start_time.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">End Time *</label>
              <input
                type="time"
                {...register('end_time', { required: 'End time is required' })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
              />
              {errors.end_time && (
                <p className="mt-1 text-sm text-red-600">{errors.end_time.message}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              {...register('description')}
              rows={4}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
            />
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6 space-y-6">
          <h2 className="text-xl font-semibold border-b pb-2">Organizer Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Organizer Name *</label>
              <input
                type="text"
                {...register('organizer_name', { required: 'Organizer name is required' })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
              />
              {errors.organizer_name && (
                <p className="mt-1 text-sm text-red-600">{errors.organizer_name.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Organizer Code *</label>
              <input
                type="text"
                {...register('organizer_code', { required: 'Organizer code is required' })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
              />
              {errors.organizer_code && (
                <p className="mt-1 text-sm text-red-600">{errors.organizer_code.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Contact Email *</label>
              <input
                type="email"
                {...register('contact_email', { required: 'Contact email is required' })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
              />
              {errors.contact_email && (
                <p className="mt-1 text-sm text-red-600">{errors.contact_email.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Contact Phone *</label>
              <input
                type="tel"
                {...register('contact_phone', { required: 'Contact phone is required' })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
              />
              {errors.contact_phone && (
                <p className="mt-1 text-sm text-red-600">{errors.contact_phone.message}</p>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6 space-y-6">
          <h2 className="text-xl font-semibold border-b pb-2">Additional Event Details</h2>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Speakers</label>
              <input
                type="text"
                {...register('speakers')}
                placeholder="Enter speakers (comma separated)"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Chief Guests</label>
              <input
                type="text"
                {...register('chief_guests')}
                placeholder="Enter chief guests (comma separated)"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Session Chair</label>
              <input
                type="text"
                {...register('session_chair')}
                placeholder="Enter session chair name"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Special Guests</label>
              <input
                type="text"
                {...register('special_guests')}
                placeholder="Enter special guests (comma separated)"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
              />
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6 space-y-6">
          <h2 className="text-xl font-semibold border-b pb-2">Social Media Links</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Facebook URL</label>
              <input
                type="url"
                {...register('social_media_links.facebook')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Twitter URL</label>
              <input
                type="url"
                {...register('social_media_links.twitter')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Instagram URL</label>
              <input
                type="url"
                {...register('social_media_links.instagram')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">LinkedIn URL</label>
              <input
                type="url"
                {...register('social_media_links.linkedin')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Website URL</label>
              <input
                type="url"
                {...register('social_media_links.website')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/dashboard/events')}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-white bg-primary border border-transparent rounded-md shadow-sm hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
          >
            {loading ? 'Saving...' : mode === 'create' ? 'Create Event' : 'Update Event'}
          </button>
        </div>
      </form>

      {/* Success Dialog */}
      <Dialog
        open={showSuccessDialog}
        onClose={handleDialogClose}
        className="fixed inset-0 z-50 overflow-y-auto"
      >
        <div className="flex items-center justify-center min-h-screen">
          <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

          <Dialog.Panel className="relative bg-white rounded-lg max-w-md mx-auto p-6">
            <Dialog.Title className="text-lg font-medium text-primary mb-2">
              {mode === 'create' ? 'Event Created Successfully!' : 'Event Updated Successfully!'}
            </Dialog.Title>
            <Dialog.Description className="text-sm text-gray-500 mb-4">
              {mode === 'create' 
                ? 'Your event has been created successfully. You can view it in the events list.'
                : 'Your event has been updated successfully. The changes are now visible in the overview.'}
            </Dialog.Description>
            <button
              onClick={handleDialogClose}
              className="w-full px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary-dark"
            >
              {mode === 'create' ? 'Return to All Events' : 'Return to Overview'}
            </button>
          </Dialog.Panel>
        </div>
      </Dialog>
    </>
  );
} 