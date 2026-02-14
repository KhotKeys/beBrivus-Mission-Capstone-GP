import apiClient from './client';

// Types for messaging (simplified until backend is implemented)
export interface User {
  id: number;
  first_name: string;
  last_name: string;
  email?: string;
  profile_picture?: string;
}

export interface Message {
  id: number;
  content: string;
  sender: User;
  timestamp: string;
  is_read: boolean;
}

export interface Conversation {
  id: number;
  participants: User[];
  last_message: Message | null;
  created_at: string;
  updated_at: string;
}

// Booking interfaces that align with your mentors API
export interface BookingSession {
  id: number;
  mentee: number;
  mentor: number;
  mentee_name: string;
  mentor_name: string;
  session_date: string;
  start_time: string;
  duration: number;
  session_type: string;
  status: string;
  notes: string;
  feedback?: string;
  rating?: number;
  created_at: string;
}

export interface TimeSlot {
  id: number;
  mentor_id: number;
  start_time: string;
  end_time: string;
  is_available: boolean;
  price_per_hour?: number;
}

// Messaging API (simplified implementation using mentors API where possible)
export const messagingApi = {
  // Mock conversations - could be enhanced to use a backend messaging system
  getConversations: async (): Promise<{ data: { results: Conversation[] } }> => {
    // For now, create mock conversations based on recent mentor interactions
    // In a real app, this would fetch from a messaging backend
    return {
      data: {
        results: []
      }
    };
  },

  // Get conversation - enhanced to create a conversation concept
  getConversation: async (conversationId: number): Promise<{ data: Conversation }> => {
    // Mock conversation data
    const mockConversation: Conversation = {
      id: conversationId,
      participants: [],
      last_message: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    return { data: mockConversation };
  },

  // Get messages for a conversation
  getMessages: async (conversationId: number): Promise<{ data: { results: Message[] } }> => {
    // Mock some conversation messages
    const mockMessages: Message[] = [
      {
        id: 1,
        content: "Hi! I'm interested in learning more about your expertise. Could we schedule a session?",
        sender: {
          id: 1,
          first_name: "You",
          last_name: "",
        },
        timestamp: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
        is_read: true,
      },
      {
        id: 2,
        content: "Of course! I'd be happy to help. What specific areas would you like to focus on?",
        sender: {
          id: 2,
          first_name: "Mentor",
          last_name: "",
        },
        timestamp: new Date(Date.now() - 1800000).toISOString(), // 30 min ago
        is_read: true,
      }
    ];

    return {
      data: {
        results: mockMessages
      }
    };
  },

  // Send message - could potentially use the mentors API sendMessage method
  sendMessage: async (conversationId: number, content: string): Promise<{ data: Message }> => {
    // Create a mock message response
    const newMessage: Message = {
      id: Date.now(),
      content,
      sender: {
        id: 1,
        first_name: "You",
        last_name: "",
      },
      timestamp: new Date().toISOString(),
      is_read: true,
    };

    return { data: newMessage };
  },

  // Start conversation with mentor - could integrate with mentors API
  startConversation: async (mentorId: number, initialMessage: string): Promise<{ data: Conversation }> => {
    // Create mock conversation
    const newConversation: Conversation = {
      id: Date.now(),
      participants: [
        {
          id: mentorId,
          first_name: "Mentor",
          last_name: "",
        }
      ],
      last_message: {
        id: Date.now(),
        content: initialMessage,
        sender: {
          id: 1,
          first_name: "You", 
          last_name: "",
        },
        timestamp: new Date().toISOString(),
        is_read: false,
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    return { data: newConversation };
  },

  // Mark as read
  markAsRead: async (conversationId: number): Promise<void> => {
    // Mock implementation - in real app would mark messages as read
    console.log(`Marking conversation ${conversationId} as read`);
  },
};

// Booking API using your existing structure
export const bookingApi = {
  // Get mentor availability using your existing endpoint
  getAvailability: async (mentorId: number): Promise<{ data: { results: TimeSlot[] } }> => {
    try {
      const response = await apiClient.get(`/mentors/${mentorId}/availability/`);
      return response;
    } catch (error) {
      return { data: { results: [] } };
    }
  },

  // Book session using your existing endpoint
  bookSession: async (mentorId: number, sessionData: any): Promise<{ data: BookingSession }> => {
    const response = await apiClient.post(`/mentors/${mentorId}/book/`, sessionData);
    return response;
  },

  // Mock get bookings - you might need to add this endpoint to your backend
  getBookings: async (): Promise<{ data: { results: BookingSession[] } }> => {
    try {
      // This endpoint doesn't exist yet, return empty for now
      // You would need to add this to your mentors backend
      return {
        data: {
          results: []
        }
      };
    } catch (error) {
      return { data: { results: [] } };
    }
  },

  // Mock get single booking
  getBooking: async (bookingId: number): Promise<{ data: BookingSession }> => {
    throw new Error('Get booking endpoint not implemented yet');
  },

  // Mock join session
  joinSession: async (bookingId: number): Promise<{ data: { meeting_link: string; meeting_id: string } }> => {
    // Return mock video call data
    return {
      data: {
        meeting_link: `https://meet.example.com/session-${bookingId}`,
        meeting_id: `session-${bookingId}`
      }
    };
  },

  // Mock end session
  endSession: async (bookingId: number): Promise<void> => {
    // Do nothing for now
  },
};
