"use client"

import React, { useState, useEffect } from "react"
import { CalendarDays, Clock, MapPin, User, Phone, Mail, Info, Link as LinkIcon } from "lucide-react"
import { supabase } from "../../lib/supabase"

import { Button } from "../ui/button"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "../ui/drawer"

interface EventDetail {
  event_id: string
  social_media_links?: {
    twitter?: string
    website?: string
    facebook?: string
    linkedin?: string
    instagram?: string
  }
  chief_guests?: string[]
  special_guests?: string[]
  speakers?: string[]
  session_chair?: string
  sponsors?: any
}

interface Event {
  event_id: string
  eid: string
  event_name: string
  organizer_name: string
  organizer_code: string
  venue: string
  description?: string
  start_date: string
  end_date: string
  start_time?: string
  end_time?: string
  contact_phone?: string
  contact_email?: string
  banner_url?: string
  status: string
}

interface EventDetailsDrawerProps {
  eventId: string
  trigger?: React.ReactNode
}

export function EventDetailsDrawer({ eventId, trigger }: EventDetailsDrawerProps) {
  const [event, setEvent] = useState<Event | null>(null)
  const [eventDetails, setEventDetails] = useState<EventDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // Fetch event data
        const { data: eventData, error: eventError } = await supabase
          .from('events')
          .select('*')
          .eq('event_id', eventId)
          .single()
        
        if (eventError) throw eventError
        
        setEvent(eventData)
        
        // Fetch event details
        const { data: detailsData, error: detailsError } = await supabase
          .from('event_details')
          .select('*')
          .eq('event_id', eventId)
          .maybeSingle()
        
        if (detailsError) throw detailsError
        
        if (detailsData) {
          setEventDetails(detailsData)
        }
        
      } catch (err) {
        console.error('Error fetching event details:', err)
        setError('Failed to load event details')
      } finally {
        setLoading(false)
      }
    }
    
    if (eventId) {
      fetchEvent()
    }
  }, [eventId])

  const formatDate = (dateString: string) => {
    if (!dateString) return null
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatTime = (timeString?: string) => {
    if (!timeString) return null
    
    // Handle PostgreSQL time format (HH:MM:SS)
    const parts = timeString.split(':')
    if (parts.length < 2) return null
    
    const hours = parseInt(parts[0], 10)
    const minutes = parts[1]
    const ampm = hours >= 12 ? 'PM' : 'AM'
    const displayHours = hours % 12 || 12
    
    return `${displayHours}:${minutes} ${ampm}`
  }

  return (
    <Drawer>
      <DrawerTrigger asChild>
        {trigger || <Button variant="outline" size="sm">Details</Button>}
      </DrawerTrigger>
      <DrawerContent className="max-h-[90vh] overflow-y-auto p-6">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : error ? (
          <div className="p-6 text-center text-red-500">{error}</div>
        ) : event ? (
          <div className="mx-auto w-full max-w-4xl">
            <DrawerHeader>
              <DrawerTitle className="text-2xl font-bold">{event.event_name}</DrawerTitle>
              <DrawerDescription className="text-base">
                {event.description || "No description available"}
              </DrawerDescription>
            </DrawerHeader>
            <div className="p-6">
              {event.banner_url && (
                <div className="mb-6 rounded-lg overflow-hidden">
                  <img 
                    src={event.banner_url} 
                    alt={`${event.event_name} banner`} 
                    className="w-full h-auto object-cover"
                  />
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <CalendarDays className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-medium">Date</h3>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(event.start_date)} - {formatDate(event.end_date)}
                      </p>
                    </div>
                  </div>
                  
                  {(event.start_time || event.end_time) && (
                    <div className="flex items-start space-x-3">
                      <Clock className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <div>
                        <h3 className="font-medium">Time</h3>
                        <p className="text-sm text-muted-foreground">
                          {formatTime(event.start_time)} - {formatTime(event.end_time)}
                        </p>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-start space-x-3">
                    <MapPin className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-medium">Venue</h3>
                      <p className="text-sm text-muted-foreground">{event.venue}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <User className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-medium">Organizer</h3>
                      <p className="text-sm text-muted-foreground">{event.organizer_name}</p>
                      <p className="text-xs text-muted-foreground">Code: {event.organizer_code}</p>
                    </div>
                  </div>
                  
                  {event.contact_phone && (
                    <div className="flex items-start space-x-3">
                      <Phone className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <div>
                        <h3 className="font-medium">Contact Phone</h3>
                        <p className="text-sm text-muted-foreground">{event.contact_phone}</p>
                      </div>
                    </div>
                  )}
                  
                  {event.contact_email && (
                    <div className="flex items-start space-x-3">
                      <Mail className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <div>
                        <h3 className="font-medium">Contact Email</h3>
                        <p className="text-sm text-muted-foreground">{event.contact_email}</p>
                      </div>
                    </div>
                  )}
                </div>
                
                {eventDetails && (
                  <div className="space-y-4">
                    {eventDetails.session_chair && (
                      <div className="flex items-start space-x-3">
                        <User className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                        <div>
                          <h3 className="font-medium">Session Chair</h3>
                          <p className="text-sm text-muted-foreground">{eventDetails.session_chair}</p>
                        </div>
                      </div>
                    )}
                    
                    {eventDetails.chief_guests && eventDetails.chief_guests.length > 0 && (
                      <div className="flex items-start space-x-3">
                        <User className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                        <div>
                          <h3 className="font-medium">Chief Guests</h3>
                          <ul className="text-sm text-muted-foreground list-disc pl-5">
                            {eventDetails.chief_guests.map((guest, index) => (
                              <li key={index}>{guest}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}
                    
                    {eventDetails.special_guests && eventDetails.special_guests.length > 0 && (
                      <div className="flex items-start space-x-3">
                        <User className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                        <div>
                          <h3 className="font-medium">Special Guests</h3>
                          <ul className="text-sm text-muted-foreground list-disc pl-5">
                            {eventDetails.special_guests.map((guest, index) => (
                              <li key={index}>{guest}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}
                    
                    {eventDetails.speakers && eventDetails.speakers.length > 0 && (
                      <div className="flex items-start space-x-3">
                        <User className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                        <div>
                          <h3 className="font-medium">Speakers</h3>
                          <ul className="text-sm text-muted-foreground list-disc pl-5">
                            {eventDetails.speakers.map((speaker, index) => (
                              <li key={index}>{speaker}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}
                    
                    {eventDetails.social_media_links && Object.values(eventDetails.social_media_links).some(link => link) && (
                      <div className="flex items-start space-x-3">
                        <LinkIcon className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                        <div>
                          <h3 className="font-medium">Social Media</h3>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {eventDetails.social_media_links.facebook && (
                              <a 
                                href={eventDetails.social_media_links.facebook} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-blue-500 hover:underline"
                              >
                                Facebook
                              </a>
                            )}
                            {eventDetails.social_media_links.twitter && (
                              <a 
                                href={eventDetails.social_media_links.twitter} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-blue-500 hover:underline"
                              >
                                Twitter
                              </a>
                            )}
                            {eventDetails.social_media_links.instagram && (
                              <a 
                                href={eventDetails.social_media_links.instagram} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-blue-500 hover:underline"
                              >
                                Instagram
                              </a>
                            )}
                            {eventDetails.social_media_links.linkedin && (
                              <a 
                                href={eventDetails.social_media_links.linkedin} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-blue-500 hover:underline"
                              >
                                LinkedIn
                              </a>
                            )}
                            {eventDetails.social_media_links.website && (
                              <a 
                                href={eventDetails.social_media_links.website} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-blue-500 hover:underline"
                              >
                                Website
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
            <DrawerFooter>
              <DrawerClose asChild>
                <Button variant="outline">Close</Button>
              </DrawerClose>
            </DrawerFooter>
          </div>
        ) : (
          <div className="p-6 text-center">Event not found</div>
        )}
      </DrawerContent>
    </Drawer>
  )
} 