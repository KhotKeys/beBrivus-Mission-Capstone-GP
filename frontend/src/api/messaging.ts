import { api } from './index';

export interface Message {
  id: number;
  sender: {
    id: number;
    username: string;  // Get user's bookings
  }
  receiver: {
    id: number;
    username: string;
    first_name: string;
    last_name: string;
    profile_picture?: string;
  };
  content: string;
  timestamp: string;
  is_read: boolean;
  message_type: 'text' | 'system' | 'booking_confirmation';
}

export interface Conversation {
  id: number;
  participants: Array<{
    id: number;
    username: string;
    first_name: string;
    last_name: string;
    profile_picture?: string;
  }>;
  last_message?: Message;
  unread_count: number;
  created_at: string;
  updated_at: string;
}

export interface BookingSession {
  id: number;
  mentor_name: string;
  mentor_id: number;
  mentor_avatar?: string | null;
  mentor_company?: string | null;
  session_date: string;
  session_end_date?: string | null;
  start_time: string;
  end_time?: string | null;
  duration_minutes: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'in_progress';
  session_type?: string;
  notes?: string;
  mentee_notes?: string;
  agenda?: string;
  meeting_link?: string;
  meeting_id?: string;
  created_at: string;
  updated_at?: string;
}

export interface CreateBookingRequest {
  mentor_id: number;
  title: string;
  description: string;
  scheduled_date: string;
  duration_minutes: number;
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
    api.get<{ results: Conversation[] }>('/messaging/conversations/'),

  // Get conversation by ID
  getConversation: (conversationId: number) =>
    api.get<Conversation>(`/messaging/conversations/${conversationId}/`),

  // Get messages for a conversation
  getMessages: (conversationId: number, page?: number) =>
    api.get<{ results: Message[]; has_more: boolean }>(
      `/messaging/conversations/${conversationId}/messages/${page ? `?page=${page}` : ''}`
    ),

  // Send a message to a conversation
  sendMessage: (conversationId: number, content: string) =>
    api.post<Message>(`/messaging/conversations/${conversationId}/send_message/`, {
      content
    }),

  // Start conversation with another user (by user ID)
  startConversation: (userId: number, initialMessage?: string) =>
    api.post<Conversation>('/messaging/conversations/', {
      participant_id: userId,
      initial_message: initialMessage || ''
    }),

  // Mark conversation as read
  markAsRead: (conversationId: number) =>
    api.post(`/messaging/conversations/${conversationId}/mark_read/`),

  // Send message to mentor (starts conversation if needed)
  sendMessageToMentor: (mentorId: number, content: string) =>
    api.post(`/messaging/conversations/send_to_mentor/`, { 
      mentor_id: mentorId,
      content 
    }),
};

// Booking API
export const bookingApi = {
  // Get available time slots for a mentor
  getAvailableSlots: (mentorId: number, date?: string) =>
    api.get<{ results: TimeSlot[] }>(`/mentors/${mentorId}/available-slots/${date ? `?date=${date}` : ''}`),

  // Book a session with mentor
  bookSession: (bookingData: CreateBookingRequest) =>
    api.post<BookingSession>('/bookings/sessions/', bookingData),

  // Get user's bookings
  getMyBookings: (status?: string) =>
    api.get<{ results: BookingSession[] }>(`/mentors/bookings/${status ? `?status=${status}` : ''}`),

  // Get booking details
  getBooking: (bookingId: number) =>
    api.get<BookingSession>(`/bookings/sessions/${bookingId}/`),

  // Cancel booking
  cancelBooking: (bookingId: number, reason?: string) =>
    api.post(`/bookings/sessions/${bookingId}/cancel/`, { reason }),

  // Confirm booking (mentor only)
  confirmBooking: (bookingId: number) =>
    api.post(`/bookings/sessions/${bookingId}/confirm/`),

  // Join session (generates/gets meeting link)
  joinSession: (bookingId: number) =>
    api.post<{ meeting_link: string; meeting_id: string }>(`/bookings/sessions/${bookingId}/join/`),

  // End session
  endSession: (bookingId: number) =>
    api.post(`/bookings/sessions/${bookingId}/end/`),
};
