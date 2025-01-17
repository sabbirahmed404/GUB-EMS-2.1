import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';

interface EventFormProps {
  mode?: 'create' | 'update';
  initialData?: any;
}

interface EventFormData {
  event_name: string;
  organizer_name: string;
  organizer_code: string;
  phone: string;
  email: string;
  start_date: string;
  end_date: string;
  start_time: string;
  end_time: string;
  venue: string;
  description?: string;
  social_media_links?: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    linkedin?: string;
  };
  guests?: string[];
  session_chair?: string;
  banner_image?: FileList;
  sponsors?: {
    tier: string;
    name: string;
  }[];
}

export const EventForm = ({ mode = 'create', initialData }: EventFormProps) => {
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors }, reset } = useForm<EventFormData>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user, profile } = useAuth();
  
  const [guests, setGuests] = useState<string[]>([]);
  const [newGuest, setNewGuest] = useState('');
  const [sponsors, setSponsors] = useState<{ tier: string; name: string; }[]>([]);
  const [newSponsor, setNewSponsor] = useState({ tier: '', name: '' });

  // Initialize form with existing data if in update mode
  useEffect(() => {
    if (mode === 'update' && initialData) {
      reset({
        event_name: initialData.event_name,
        organizer_name: initialData.organizer_name,
        organizer_code: initialData.organizer_code,
        phone: initialData.contact_phone === 'pending' ? '' : initialData.contact_phone,
        email: initialData.contact_email === 'pending' ? '' : initialData.contact_email,
        venue: initialData.venue,
        start_date: initialData.start_date.split('T')[0],
        end_date: initialData.end_date.split('T')[0],
        start_time: initialData.start_time,
        end_time: initialData.end_time,
        description: initialData.description || '',
        social_media_links: initialData.details?.social_media_links || {},
        session_chair: initialData.details?.session_chair || ''
      });
      setGuests(initialData.details?.chief_guests || []);
      setSponsors(initialData.details?.sponsors || []);
    }
  }, [mode, initialData, reset]);

  const generateEID = () => {
    const timestamp = Date.now().toString(36);
    const randomStr = Math.random().toString(36).substring(2, 5);
    return `EV-${timestamp}-${randomStr}`.toUpperCase();
  };

  const handleAddGuest = () => {
    if (newGuest.trim()) {
      setGuests([...guests, newGuest.trim()]);
      setNewGuest('');
    }
  };

  const handleAddSponsor = () => {
    if (newSponsor.tier && newSponsor.name) {
      setSponsors([...sponsors, newSponsor]);
      setNewSponsor({ tier: '', name: '' });
    }
  };

  const onSubmit = async (data: EventFormData) => {
    try {
      console.log('Starting form submission:', { mode, data });
      setLoading(true);
      setError(null);

      if (!user || !profile) {
        throw new Error('You must be logged in to manage events');
      }

      // Get user_id from the users table
      console.log('Fetching user data for:', user.id);
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('user_id')
        .eq('auth_id', user.id)
        .single();

      if (userError || !userData) {
        console.error('Failed to get user data:', userError);
        throw new Error('Failed to get user information');
      }
      console.log('User data fetched:', userData);

      let banner_url = initialData?.banner_url || null;

      // Handle image upload if provided
      if (data.banner_image?.[0]) {
        console.log('Starting banner image upload');
        const file = data.banner_image[0];
        if (file.size > 10 * 1024 * 1024) {
          throw new Error('Image size must be less than 10MB');
        }

        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `event-banners/${fileName}`;

        const { error: uploadError, data: uploadData } = await supabase.storage
          .from('banners')
          .upload(filePath, file);

        if (uploadError) {
          console.error('Banner upload error:', uploadError);
          throw new Error('Failed to upload banner image');
        }
        
        banner_url = uploadData.path;
        console.log('Banner uploaded successfully:', banner_url);
      }

      let eventId;

      if (mode === 'create') {
        // Create new event
        const eid = generateEID();
        console.log('Generated EID:', eid);
        
        // Debug logs
        console.log('User auth ID:', user.id);
        console.log('User profile:', profile);

        const eventData = {
          eid,
          event_name: data.event_name,
          organizer_name: data.organizer_name,
          organizer_code: data.organizer_code,
          created_by: userData.user_id,
          team_id: null,
          start_date: data.start_date,
          end_date: data.end_date,
          start_time: data.start_time,
          end_time: data.end_time,
          venue: data.venue,
          description: data.description || null,
          banner_url,
          contact_phone: data.phone || 'pending',
          contact_email: data.email || 'pending'
        };

        console.log('Event data being sent:', eventData);

        // Create the event
        const { data: createdEvent, error: eventError } = await supabase
          .from('events')
          .insert(eventData)
          .select('event_id')
          .single();

        if (eventError) {
          console.error('Event creation error:', eventError);
          throw new Error(`Failed to create event: ${eventError.message}`);
        }
        console.log('Event created successfully:', createdEvent);
        eventId = createdEvent.event_id;
      } else {
        // Update existing event
        console.log('Updating event:', initialData.event_id);
        
        // Debug logs
        console.log('User auth ID:', user.id);
        console.log('User profile:', profile);
        
        const updateData = {
          event_name: data.event_name,
          organizer_name: data.organizer_name,
          organizer_code: data.organizer_code,
          start_date: data.start_date,
          end_date: data.end_date,
          start_time: data.start_time,
          end_time: data.end_time,
          venue: data.venue,
          description: data.description || null,
          banner_url,
          contact_phone: data.phone || 'pending',
          contact_email: data.email || 'pending',
          updated_at: new Date().toISOString()
        };

        console.log('Event data being sent:', updateData);
        console.log('Event ID being updated:', initialData.event_id);

        const { error: eventError } = await supabase
          .from('events')
          .update(updateData)
          .eq('event_id', initialData.event_id)
          .eq('created_by', userData.user_id);

        if (eventError) {
          console.error('Event update error:', eventError);
          throw new Error(`Failed to update event: ${eventError.message}`);
        }
        console.log('Event updated successfully');
        eventId = initialData.event_id;
      }

      // Update event details
      const eventDetails = {
        event_id: eventId,
        social_media_links: data.social_media_links || null,
        chief_guests: guests,
        special_guests: [],
        speakers: [],
        session_chair: data.session_chair || null,
        sponsors: sponsors.length > 0 ? sponsors : null
      };

      console.log('Preparing event details:', eventDetails);

      if (mode === 'create') {
        const { error: detailsError } = await supabase
          .from('event_details')
          .insert([eventDetails]);

        if (detailsError) {
          console.error('Event details creation error:', detailsError);
          // Rollback event creation
          await supabase.from('events').delete().eq('event_id', eventId);
          throw new Error(`Failed to create event details: ${detailsError.message}`);
        }
        console.log('Event details created successfully');
      } else {
        const { error: detailsError } = await supabase
          .from('event_details')
          .update(eventDetails)
          .eq('event_id', eventId);

        if (detailsError) {
          console.error('Event details update error:', detailsError);
          throw new Error(`Failed to update event details: ${detailsError.message}`);
        }
        console.log('Event details updated successfully');
      }

      console.log('Event operation completed successfully');
      // Navigate back to dashboard on success
      navigate('/dashboard');
    } catch (err) {
      console.error('Error managing event:', err);
      setError(err instanceof Error ? err.message : 'Failed to manage event');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-4xl mx-auto">
      <div className="bg-white shadow-sm rounded-lg p-6">
        {error && (
          <div className="mb-4 p-3 text-sm text-red-600 bg-red-100 rounded-md">
            {error}
          </div>
        )}

        {/* Required Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Event Name *</label>
            <input
              type="text"
              {...register('event_name', { required: 'Event name is required' })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
            {errors.event_name && (
              <p className="mt-1 text-sm text-red-600">{errors.event_name.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Organizer Name *</label>
            <input
              type="text"
              {...register('organizer_name', { required: 'Organizer name is required' })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
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
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
            {errors.organizer_code && (
              <p className="mt-1 text-sm text-red-600">{errors.organizer_code.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Phone *</label>
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
            <label className="block text-sm font-medium text-gray-700">Venue *</label>
            <input
              type="text"
              {...register('venue', { required: 'Venue is required' })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
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
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
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
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
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
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
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
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
            {errors.end_time && (
              <p className="mt-1 text-sm text-red-600">{errors.end_time.message}</p>
            )}
          </div>
        </div>

        {/* Optional Fields */}
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              {...register('description')}
              rows={4}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Banner Image (Max 10MB)</label>
            <input
              type="file"
              accept="image/*"
              {...register('banner_image')}
              className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Guests/Speakers</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={newGuest}
                onChange={(e) => setNewGuest(e.target.value)}
                className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="Enter guest name"
              />
              <button
                type="button"
                onClick={handleAddGuest}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Add
              </button>
            </div>
            <div className="space-y-2">
              {guests.map((guest, index) => (
                <div key={index} className="flex items-center gap-2">
                  <span className="flex-1 text-sm">{guest}</span>
                  <button
                    type="button"
                    onClick={() => setGuests(guests.filter((_, i) => i !== index))}
                    className="text-red-600 hover:text-red-700"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Session Chair</label>
            <input
              type="text"
              {...register('session_chair')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Sponsors</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={newSponsor.tier}
                onChange={(e) => setNewSponsor({ ...newSponsor, tier: e.target.value })}
                className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="Sponsor tier"
              />
              <input
                type="text"
                value={newSponsor.name}
                onChange={(e) => setNewSponsor({ ...newSponsor, name: e.target.value })}
                className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="Sponsor name"
              />
              <button
                type="button"
                onClick={handleAddSponsor}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Add
              </button>
            </div>
            <div className="space-y-2">
              {sponsors.map((sponsor, index) => (
                <div key={index} className="flex items-center gap-2">
                  <span className="flex-1 text-sm">
                    {sponsor.tier} - {sponsor.name}
                  </span>
                  <button
                    type="button"
                    onClick={() => setSponsors(sponsors.filter((_, i) => i !== index))}
                    className="text-red-600 hover:text-red-700"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Social Media Links */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-700">Social Media Links</h3>
            <div>
              <label className="block text-sm text-gray-600">Facebook</label>
              <input
                type="url"
                {...register('social_media_links.facebook')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="https://facebook.com/..."
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600">Twitter</label>
              <input
                type="url"
                {...register('social_media_links.twitter')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="https://twitter.com/..."
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600">Instagram</label>
              <input
                type="url"
                {...register('social_media_links.instagram')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="https://instagram.com/..."
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600">LinkedIn</label>
              <input
                type="url"
                {...register('social_media_links.linkedin')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="https://linkedin.com/..."
              />
            </div>
          </div>
        </div>

        <div className="mt-6">
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {loading ? (mode === 'create' ? 'Creating Event...' : 'Updating Event...') : 
                      (mode === 'create' ? 'Create Event' : 'Update Event')}
          </button>
        </div>
      </div>
    </form>
  );
}; 