# **App Name**: Trak'd

## Core Features:

- User Authentication: Secure user sign-up, login, and profile management using Firebase Authentication, with support for email/password and Google Sign-In.
- Profile Creation and Management: Allow users to create and update their profiles, including display name and profile picture, stored in Firestore.
- Group Creation and Management: Enable users to create and manage private groups, including inviting members via unique invite codes, and storing group data in Firestore.
- Real-time Location Sharing: Track and share user locations in real-time with group members, using background location updates and storing location data in Firestore.
- Map Display: Display a Google Map with custom markers for each group member, showing their location, display name, last updated time, and battery level.
- Invite Code Generation and Validation: Firebase Cloud Function to generate unique invite codes for groups and validate them when users attempt to join a group.
- Smart Location Sharing: AI tool using generative AI. Based on a group of members, proactively remind the other members to temporarily turn on location sharing for a set period of time.

## Style Guidelines:

- Primary color: Deep Blue (#283593), evoking trust and security.
- Background color: Light Grey (#F5F5F5), providing a clean and neutral backdrop.
- Accent color: Soft Lavender (#D1C4E9), adding a touch of modernity and highlighting key interactive elements.
- Headline font: 'Poppins' (sans-serif) for a modern, precise feel; body font: 'PT Sans' (sans-serif) for readability.
- Use clean, geometric icons from React Native Paper to represent locations, users, and group actions.
- Employ a tab-based navigation for switching between MapScreen, GroupsScreen, and ProfileScreen, ensuring easy access to core features.
- Implement subtle animations for marker updates and transitions between screens, enhancing user engagement without being distracting.