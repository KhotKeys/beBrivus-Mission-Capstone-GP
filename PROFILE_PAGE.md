# Profile Page Implementation

## Overview

A comprehensive user profile page with full edit capabilities for managing personal information, skills, education, and work experience.

## Features

### 1. **Basic Information**

- Profile picture display
- Name, email, location
- User type badge
- Verification status
- Bio/About section
- Contact information (phone number)
- Academic information (university, field of study, graduation year)
- Social/professional links (LinkedIn, GitHub, Portfolio)

### 2. **Skills Management**

- Add, view, and delete skills
- Skill proficiency levels (Beginner, Intermediate, Advanced, Expert)
- Color-coded skill tags based on proficiency
- Toggle edit mode for managing skills
- Real-time updates

### 3. **Education History**

- Add multiple education entries
- Fields: Institution, Degree, Field of Study, Start/End dates
- "Currently studying" checkbox
- Optional grade and description
- Delete education entries
- Chronologically ordered display

### 4. **Work Experience**

- Add multiple work experience entries
- Fields: Company, Position, Location, Start/End dates
- "Currently working" checkbox
- Optional description
- Delete experience entries
- Chronologically ordered display

## Technical Implementation

### Frontend (`ProfilePage.tsx`)

- **React Query** for data fetching and mutations
- **Optimistic updates** via query invalidation
- **Inline editing** with toggle modes
- **Form validation** for required fields
- **Loading states** and error handling
- **Responsive design** with Tailwind CSS

### API Client (`profile.ts`)

Endpoints:

- `GET /accounts/profile/` - Fetch user profile
- `PATCH /accounts/profile/` - Update basic info
- `GET /accounts/skills/` - Fetch skills
- `POST /accounts/skills/` - Add skill
- `PATCH /accounts/skills/:id/` - Update skill
- `DELETE /accounts/skills/:id/` - Delete skill
- `GET /accounts/education/` - Fetch education
- `POST /accounts/education/` - Add education
- `PATCH /accounts/education/:id/` - Update education
- `DELETE /accounts/education/:id/` - Delete education
- `GET /accounts/experience/` - Fetch experience
- `POST /accounts/experience/` - Add experience
- `PATCH /accounts/experience/:id/` - Update experience
- `DELETE /accounts/experience/:id/` - Delete experience

### Backend (Django)

Models:

- `User` - Core user model with profile fields
- `UserSkill` - Skills with proficiency levels
- `UserEducation` - Education history
- `UserExperience` - Work experience

Views:

- `ProfileView` - Retrieve/Update profile
- `UserSkillViewSet` - CRUD for skills
- `UserEducationViewSet` - CRUD for education
- `UserExperienceViewSet` - CRUD for experience

## Usage

### Accessing the Profile

Navigate to `/profile` or click on your name in the header dropdown.

### Editing Basic Info

1. Click "Edit Profile" button
2. Update any fields in the form
3. Click "Save Changes" or "Cancel"

### Managing Skills

1. Click "Manage Skills" button
2. Enter skill name and select proficiency level
3. Click "Add" to add the skill
4. Click "X" on any skill to delete it
5. Click "Done" when finished

### Adding Education

1. Click "Manage Education" button
2. Click "Add Education"
3. Fill in the form
4. Check "Currently studying here" if applicable
5. Click "Save"
6. Click trash icon to delete an entry

### Adding Experience

1. Click "Manage Experience" button
2. Click "Add Experience"
3. Fill in the form
4. Check "Currently working here" if applicable
5. Click "Save"
6. Click trash icon to delete an entry

## Component Structure

```
ProfilePage
├── BasicInfoForm (Edit mode for profile)
├── SkillsSection
│   └── Skill tags with add/delete
├── EducationSection
│   └── Education entries with add/delete
└── ExperienceSection
    └── Experience entries with add/delete
```

## Styling

- Uses existing Tailwind CSS utility classes
- Follows beBrivus design system (primary-600, secondary-900, etc.)
- Card-based layout with consistent spacing
- Icon integration with Lucide React
- Responsive grid layouts

## Future Enhancements

- [ ] Profile picture upload
- [ ] Skill endorsements
- [ ] Education verification
- [ ] Experience verification
- [ ] Portfolio items showcase
- [ ] Privacy controls per section
- [ ] Export profile as PDF
- [ ] Import from LinkedIn
