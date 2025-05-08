"use client"

import React, { useState, useEffect } from "react"
import { 
  CalendarDays, Clock, MapPin, User, Phone, Mail, Link as LinkIcon, 
  Edit, Calendar, Users, AlertCircle, ExternalLink, ChevronUp, X
} from "lucide-react"
import { supabase } from "../../lib/supabase"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../../contexts/AuthContext"

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
import { Avatar } from "../ui/avatar"
import { Badge } from "../ui/badge"
import { Separator } from "../ui/separator"
import { Skeleton } from "../../components/ui/skeleton"

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
  created_at?: string
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
  created_at?: string
  created_by?: string
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
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const { profile } = useAuth()

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
    
    if (eventId && open) {
      fetchEvent()
    }
  }, [eventId, open])

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

  const formatDateTime = (dateString: string) => {
    if (!dateString) return null
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Check if the current user is the organizer of this event
  const isUserEvent = () => {
    if (!profile || !event || !profile.organizer_code) return false
    return profile.organizer_code === event.organizer_code
  }

  const handleEdit = () => {
    setOpen(false)
    
    // Navigate to the edit page
    setTimeout(() => {
      navigate(`/dashboard/events/${event?.eid}/edit`);
    }, 300)
  }

  // Check if user is allowed to edit (not a visitor and is event organizer)
  const canEdit = () => {
    if (!profile || !event) return false
    return profile.role !== 'visitor' && isUserEvent()
  }

  return (
    <Drawer open={open} onOpenChange={setOpen} direction="right">
      <DrawerTrigger asChild>
        {trigger || <Button variant="outline" size="sm">View Details</Button>}
      </DrawerTrigger>
      <DrawerContent className="h-full max-w-md w-full rounded-l-lg bg-[hsl(var(--background))] border-l border-[hsl(var(--border))]">
        <div className="h-full flex flex-col bg-[hsl(var(--background))]">
          <DrawerHeader className="p-4 border-b bg-[hsl(var(--background))]">
            <div className="flex items-center justify-between">
              <DrawerTitle className="text-xl font-semibold">Event Details</DrawerTitle>
              <DrawerClose className="rounded-full p-2 hover:bg-gray-100">
                <X className="h-5 w-5" />
              </DrawerClose>
            </div>
          </DrawerHeader>
          
          <div className="flex-1 overflow-y-auto bg-[hsl(var(--background))]">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            ) : error ? (
              <div className="p-8 text-center">
                <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
                <h3 className="text-lg font-medium text-destructive">Error Loading Event</h3>
                <p className="text-muted-foreground mt-2">{error}</p>
              </div>
            ) : event ? (
              <div className="p-6 space-y-8">
                <div className="flex items-center gap-2">
                  <Badge variant={event.status === 'active' ? 'default' : 'secondary'} className="mb-2">
                    {event.status === 'active' ? 'Active Event' : event.status}
                  </Badge>
                </div>
                
                <h2 className="text-2xl font-bold">{event.event_name}</h2>
                
                {event.description && (
                  <p className="text-muted-foreground">{event.description}</p>
                )}
                
                {event.banner_url && (
                  <div className="rounded-lg overflow-hidden shadow-md">
                    <img 
                      src={event.banner_url} 
                      alt={`${event.event_name} banner`} 
                      className="w-full h-auto object-cover"
                    />
                  </div>
                )}
                
                <div className="grid grid-cols-1 gap-6">
                  <div className="bg-muted/40 rounded-lg p-4 space-y-4">
                    <h3 className="font-semibold text-lg flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-primary" />
                      Event Schedule
                    </h3>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <p className="text-sm font-medium">Start</p>
                        <p className="text-sm text-muted-foreground">{formatDate(event.start_date)}</p>
                        {event.start_time && (
                          <p className="text-sm text-muted-foreground">{formatTime(event.start_time)}</p>
                        )}
                      </div>
                      
                      <div className="space-y-1">
                        <p className="text-sm font-medium">End</p>
                        <p className="text-sm text-muted-foreground">{formatDate(event.end_date)}</p>
                        {event.end_time && (
                          <p className="text-sm text-muted-foreground">{formatTime(event.end_time)}</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Venue</p>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <MapPin className="h-4 w-4 text-primary shrink-0" />
                        {event.venue}
                      </p>
                    </div>
                  </div>
                  
                  <div className="bg-muted/40 rounded-lg p-4 space-y-4">
                    <h3 className="font-semibold text-lg flex items-center gap-2">
                      <Users className="h-5 w-5 text-primary" />
                      Organizer Information
                    </h3>
                    
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8 bg-primary/10">
                          <User className="h-4 w-4 text-primary" />
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">{event.organizer_name}</p>
                          <p className="text-xs text-muted-foreground">Code: {event.organizer_code}</p>
                        </div>
                      </div>
                      
                      {event.contact_email && (
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-primary shrink-0" />
                          <a 
                            href={`mailto:${event.contact_email}`} 
                            className="text-sm hover:underline"
                          >
                            {event.contact_email}
                          </a>
                        </div>
                      )}
                      
                      {event.contact_phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-primary shrink-0" />
                          <a 
                            href={`tel:${event.contact_phone}`} 
                            className="text-sm hover:underline"
                          >
                            {event.contact_phone}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {eventDetails?.session_chair && (
                    <div className="bg-muted/40 rounded-lg p-4">
                      <h3 className="font-semibold text-lg mb-3">Session Chair</h3>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8 bg-primary/10">
                          <User className="h-4 w-4 text-primary" />
                        </Avatar>
                        <span className="text-sm">{eventDetails.session_chair}</span>
                      </div>
                    </div>
                  )}
                  
                  {eventDetails?.speakers && eventDetails.speakers.length > 0 && (
                    <div className="bg-muted/40 rounded-lg p-4">
                      <h3 className="font-semibold text-lg mb-3">Speakers</h3>
                      <ul className="space-y-2">
                        {eventDetails.speakers.map((speaker, index) => (
                          <li key={index} className="flex items-center gap-3">
                            <Avatar className="h-8 w-8 bg-primary/10">
                              <User className="h-4 w-4 text-primary" />
                            </Avatar>
                            <span className="text-sm">{speaker}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {eventDetails?.chief_guests && eventDetails.chief_guests.length > 0 && (
                    <div className="bg-muted/40 rounded-lg p-4">
                      <h3 className="font-semibold text-lg mb-3">Chief Guests</h3>
                      <ul className="space-y-2">
                        {eventDetails.chief_guests.map((guest, index) => (
                          <li key={index} className="flex items-center gap-3">
                            <Avatar className="h-8 w-8 bg-primary/10">
                              <User className="h-4 w-4 text-primary" />
                            </Avatar>
                            <span className="text-sm">{guest}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {eventDetails?.special_guests && eventDetails.special_guests.length > 0 && (
                    <div className="bg-muted/40 rounded-lg p-4">
                      <h3 className="font-semibold text-lg mb-3">Special Guests</h3>
                      <ul className="space-y-2">
                        {eventDetails.special_guests.map((guest, index) => (
                          <li key={index} className="flex items-center gap-3">
                            <Avatar className="h-8 w-8 bg-primary/10">
                              <User className="h-4 w-4 text-primary" />
                            </Avatar>
                            <span className="text-sm">{guest}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {eventDetails?.social_media_links && Object.values(eventDetails.social_media_links).some(link => link) && (
                    <div className="bg-muted/40 rounded-lg p-4">
                      <h3 className="font-semibold text-lg mb-3">Connect Online</h3>
                      <div className="flex flex-wrap gap-2">
                        {eventDetails.social_media_links.facebook && (
                          <a 
                            href={eventDetails.social_media_links.facebook} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-sm bg-primary/10 text-primary px-3 py-1 rounded-full hover:bg-primary/20 transition-colors"
                          >
                            Facebook
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                        {eventDetails.social_media_links.twitter && (
                          <a 
                            href={eventDetails.social_media_links.twitter} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-sm bg-primary/10 text-primary px-3 py-1 rounded-full hover:bg-primary/20 transition-colors"
                          >
                            Twitter
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                        {eventDetails.social_media_links.instagram && (
                          <a 
                            href={eventDetails.social_media_links.instagram} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-sm bg-primary/10 text-primary px-3 py-1 rounded-full hover:bg-primary/20 transition-colors"
                          >
                            Instagram
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                        {eventDetails.social_media_links.linkedin && (
                          <a 
                            href={eventDetails.social_media_links.linkedin} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-sm bg-primary/10 text-primary px-3 py-1 rounded-full hover:bg-primary/20 transition-colors"
                          >
                            LinkedIn
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                        {eventDetails.social_media_links.website && (
                          <a 
                            href={eventDetails.social_media_links.website} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-sm bg-primary/10 text-primary px-3 py-1 rounded-full hover:bg-primary/20 transition-colors"
                          >
                            Website
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {event.created_at && (
                    <div className="text-xs text-muted-foreground">
                      <p>Created: {formatDateTime(event.created_at)}</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="py-16 text-center">
                <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium">Event Not Found</h3>
                <p className="text-muted-foreground mt-2">The requested event could not be found.</p>
              </div>
            )}
          </div>
          
          {event && (
            <DrawerFooter className="p-4 border-t bg-[hsl(var(--background))]">
              <div className="flex flex-col sm:flex-row gap-3 w-full">
                {canEdit() && (
                  <Button 
                    variant="default" 
                    onClick={handleEdit}
                    className="w-full sm:flex-1"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Event
                  </Button>
                )}
                <DrawerClose asChild>
                  <Button variant="outline" className="w-full sm:flex-1">
                    Close
                  </Button>
                </DrawerClose>
              </div>
            </DrawerFooter>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  )
} 