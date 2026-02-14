import apiClient from './client';

// User interface for messaging
export interface User {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  profile_picture?: string;
  expertise?: string[];
}

// Message interface
export interface Message {
  id: number;
  conversation: number;
  sender: User;
  content: string;
  timestamp: string;
  is_read: boolean;
}

// Conversation interface
export interface Conversation {
  id: number;
  participants: User[];
  last_message: Message | null;
  created_at: string;
  updated_at: string;
}

// Booking Session interface - aligned with your existing MentorSession
export interface BookingSession {
  id: number;
  mentor: User;
  mentee: User;
  session_date: string;
  start_time: string;
  duration: number;
  session_type: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'in_progress';
  notes: string;
  feedback?: string;
  rating?: number;
  meeting_link?: string;
  meeting_id?: string;
  created_at: string;
}

export interface CreateBookingRequest {
  mentor_id: number;
  session_date: string;
  start_time: string;
  duration: number;
  session_type: 'career_guidance' | 'interview_prep' | 'skill_development' | 'portfolio_review' | 'networking' | 'other';
  notes?: string;
}

export interface TimeSlot {
  id: number;
  mentor_id: number;
  start_time: string;
  end_time: string;
  is_available: boolean;
  price_per_hour: number;
}

// Messaging API
export const messagingApi = {
  // Get all conversations for current user
  getConversations: () =>
    apiClient.get<{ results: Conversation[] }>('/messaging/conversations/'),

  // Get conversation by ID with messages
  getConversation: (conversationId: number) =>
    apiClient.get<Conversation>(`/messaging/conversations/${conversationId}/`),

  // Get messages for a conversation
  getMessages: (conversationId: number, page?: number) =>
    apiClient.get<{ results: Message[] }>(`/messaging/conversations/${conversationId}/messages/${page ? `?page=${page}` : ''}`),

  // Send a message
  sendMessage: (conversationId: number, content: string) =>
    apiClient.post<Message>(`/messaging/conversations/${conversationId}/messages/`, {
      content
    }),

  // Start conversation with mentor
  startConversation: (mentorId: number, initialMessage: string) =>
    apiClient.post<Conversation>('/messaging/conversations/', {
      participant_id: mentorId,
      initial_message: initialMessage
    }),

  // Mark conversation as read
  markAsRead: (conversationId: number) =>
    apiClient.post(`/messaging/conversations/${conversationId}/mark_read/`),
};

// Booking API - using your existing mentors endpoints
export const bookingApi = {
  // Get available time slots for a mentor - using your existing availability endpoint
  getAvailableSlots: (mentorId: number, date?: string) =>
    apiClient.get<TimeSlot[]>(`/mentors/${mentorId}/availability/${date ? `?date=${date}` : ''}`),

  // Book a session with mentor - using your existing book endpoint
  bookSession: (bookingData: CreateBookingRequest) =>
    apiClient.post<BookingSession>(`/mentors/${bookingData.mentor_id}/book/`, {
      session_date: bookingData.session_date,
      start_time: bookingData.start_time,
      duration: bookingData.duration,
      session_type: bookingData.session_type,
      notes: bookingData.notes
    }),

  // Get user's bookings
  getMyBookings: (status?: string) =>
    apiClient.get<{ results: BookingSession[] }>(`/mentors/sessions/${status ? `?status=${status}` : ''}`),

  // Get user's bookings (alias for consistency)
  getBookings: (status?: string) =>
    apiClient.get<{ results: BookingSession[] }>(`/mentors/sessions/${status ? `?status=${status}` : ''}`),

  // Get booking details
  getBooking: (bookingId: number) =>
    apiClient.get<BookingSession>(`/mentors/sessions/${bookingId}/`),

  // Cancel booking
  cancelBooking: (bookingId: number, reason?: string) =>
    apiClient.post(`/mentors/sessions/${bookingId}/cancel/`, { reason }),

  // Confirm booking (mentor only)
  confirmBooking: (bookingId: number) =>
    apiClient.post(`/mentors/sessions/${bookingId}/confirm/`),

  // Join session (generates/gets meeting link)
  joinSession: (bookingId: number) =>
    apiClient.post<{ meeting_link: string; meeting_id: string }>(`/mentors/sessions/${bookingId}/join/`),

  // End session
  endSession: (bookingId: number) =>
    apiClient.post(`/mentors/sessions/${bookingId}/end/`),
};
