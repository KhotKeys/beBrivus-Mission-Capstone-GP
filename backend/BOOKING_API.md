# Booking Management API

## Overview

The BookingViewSet provides comprehensive management of user's mentorship session bookings with full CRUD operations and additional management features.

## Base URL

`/api/mentors/bookings/`

## Endpoints

### 1. List All Bookings

- **GET** `/api/mentors/bookings/`
- **Description**: Get all bookings for the authenticated user
- **Query Parameters**:
  - `status`: Filter by session status (scheduled, completed, cancelled, etc.)
  - `session_type`: Filter by session type (video, chat, email, in_person)
  - `ordering`: Sort by field (-scheduled_start, created_at, status)
  - `page`: Page number for pagination
  - `page_size`: Number of results per page

### 2. Get Specific Booking

- **GET** `/api/mentors/bookings/{id}/`
- **Description**: Get details of a specific booking

### 3. Update Booking

- **PUT/PATCH** `/api/mentors/bookings/{id}/`
- **Description**: Update booking details (limited fields)
- **Allowed Fields**: `notes`, `mentee_notes`, `agenda`
- **Restrictions**: Only future sessions with status 'requested' or 'scheduled'

### 4. Cancel Booking

- **DELETE** `/api/mentors/bookings/{id}/`
- **Description**: Cancel a booking (sets status to 'cancelled')
- **Restrictions**: Only future sessions, cannot cancel completed/cancelled/no-show sessions

### 5. Upcoming Bookings

- **GET** `/api/mentors/bookings/upcoming/`
- **Description**: Get next 10 upcoming bookings
- **Filters**: Future sessions with status 'scheduled' or 'requested'

### 6. Past Bookings

- **GET** `/api/mentors/bookings/past/`
- **Description**: Get paginated list of past bookings
- **Query Parameters**:
  - `page`: Page number
  - `page_size`: Results per page (default: 20)

### 7. Reschedule Booking

- **POST** `/api/mentors/bookings/{id}/reschedule/`
- **Description**: Reschedule a booking to a new date/time
- **Request Body**:
  ```json
  {
    "session_date": "2025-10-15",
    "start_time": "14:30",
    "duration": 60
  }
  ```
- **Restrictions**: Only future sessions with status 'scheduled' or 'requested'

### 8. Booking Statistics

- **GET** `/api/mentors/bookings/statistics/`
- **Description**: Get user's booking statistics
- **Response**:
  ```json
  {
    "total_sessions": 25,
    "completed_sessions": 20,
    "upcoming_sessions": 3,
    "cancelled_sessions": 2,
    "total_hours": 35.5,
    "favorite_session_types": ["video", "chat"]
  }
  ```

## Response Format

### MentorSessionSerializer Fields

```json
{
  "id": 1,
  "mentee_name": "John Doe",
  "mentor_name": "Jane Smith",
  "mentor_id": 5,
  "mentor_avatar": "https://example.com/avatar.jpg",
  "mentor_company": "Tech Corp",
  "session_date": "2025-10-15T14:30:00Z",
  "session_end_date": "2025-10-15T15:30:00Z",
  "start_time": "14:30:00",
  "end_time": "15:30:00",
  "duration_minutes": 60,
  "session_type": "video",
  "session_type_display": "Video Call",
  "status": "scheduled",
  "status_display": "Scheduled",
  "notes": "Career guidance session",
  "mentee_notes": "Questions about career transition",
  "agenda": "Discuss career path options",
  "meeting_link": "https://meet.google.com/xyz",
  "meeting_id": "xyz-meeting-id",
  "location": "",
  "can_reschedule": true,
  "can_cancel": true,
  "is_upcoming": true,
  "created_at": "2025-09-23T10:00:00Z",
  "updated_at": "2025-09-23T10:00:00Z"
}
```

## Usage Examples

### Get All Bookings

```javascript
fetch("/api/mentors/bookings/", {
  headers: {
    Authorization: "Bearer your-jwt-token",
    "Content-Type": "application/json",
  },
});
```

### Cancel a Booking

```javascript
fetch("/api/mentors/bookings/1/", {
  method: "DELETE",
  headers: {
    Authorization: "Bearer your-jwt-token",
  },
});
```

### Reschedule a Booking

```javascript
fetch("/api/mentors/bookings/1/reschedule/", {
  method: "POST",
  headers: {
    Authorization: "Bearer your-jwt-token",
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    session_date: "2025-10-20",
    start_time: "15:00",
    duration: 90,
  }),
});
```

## Error Responses

### 400 Bad Request

- Attempting to update/cancel past sessions
- Invalid date/time format for rescheduling
- Trying to reschedule/cancel sessions with incompatible status

### 404 Not Found

- Booking doesn't exist or doesn't belong to user

### 405 Method Not Allowed

- Trying to create bookings through this endpoint (use mentor-specific booking endpoints)

## Notes

- All endpoints require authentication
- Only the booking owner (mentee) can manage their bookings
- Past sessions cannot be modified
- Completed, cancelled, and no-show sessions cannot be cancelled
- Rescheduling resets session status to 'scheduled'
- Statistics endpoint calculates total hours from actual session durations when available
