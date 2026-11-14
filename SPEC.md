# Collaborative Bible Reading Platform — Product Blueprint & Spec

## 1. The Core "Why" & Guiding Philosophy

> _"Reading the Bible alone often leads to drop-off, isolation, and missed revelation. When we read together, scripture comes alive through diverse perspectives, shared epiphanies, and mutual encouragement."_

### Key Problems Solved

1. **Disconnected Commentary**: In apps like YouVersion or messaging apps like WhatsApp/iMessage, conversations are disconnected from the text, buried at the bottom of long chapters, or lost in chat streams.
2. **The "Checklist" Mentality**: Traditional Bible apps incentivize solitary box-checking and streaks. Missing a day induces guilt rather than grace.
3. **Intimidation & Friction**: Heavy academic or liturgical frameworks make ordinary believers hesitant to share thoughts.

### Core Product Principles

- **Text-Centric Marginalia**: The scripture is the canvas. Conversations live inline right on the verse, exactly like comments in Figma or Notion.
- **Grace-Filled Progression**: Pacing is guided, not enforced. No streak shaming. Latecomers can pick up anytime and view past discussions.
- **Casual & Low-Friction**: Casual marginalia allows any verse to spawn a lightweight, natural discussion thread without rigid forms.
- **Intimate Psychological Safety**: Designed first for high-trust private circles (3–10 people) with strict room isolation, while supporting church/ministry structures.

---

## 2. Platform Architecture & Tech Stack

```
                               ┌─────────────────────────────────────────┐
                               │             PostgreSQL (Supabase)        │
                               │  - Bibles (WEB, KJV, LSG)               │
                               │  - Rooms, Members, Roles                │
                               │  - Verse Threads, Comments, Reactions   │
                               │  - Reading Plans & Progress Logs        │
                               └────────────────────┬────────────────────┘
                                                    │
                               ┌────────────────────┴────────────────────┐
                               │               Backend Layer             │
                               │  - Better Auth (Postgres Adapter)       │
                               │  - Supabase Realtime (WebSockets)       │
                               │  - Shared DB Models (Drizzle / Prisma)  │
                               └──────────────┬──────────────────┬───────┘
                                              │                  │
                     ┌────────────────────────┴──────┐    ┌──────┴───────────────────────┐
                     │   Phase 1: apps/web (React)   │    │  Phase 2: apps/mobile (Expo) │
                     │   - Responsive Bible Reader   │    │  - Native iOS & Android      │
                     │   - Realtime Marginalia       │    │  - Native Push Notifications │
                     │   - Live Study Room Mode      │    │  - Offline Reading Cache     │
                     └───────────────────────────────┘    └──────────────────────────────┘
```

- **Monorepo Manager**: Turborepo + pnpm
- **Database**: PostgreSQL hosted on Supabase
- **Authentication**: Better Auth connected directly to Postgres
- **Realtime**: Supabase Realtime channels (presence, broadcast, postgres changes)
- **Bible Text**: Seeded open-license translations (WEB - World English Bible, KJV - King James Version, LSG - Louis Segond 1910)
- **Frontend**:
  - **Phase 1**: `apps/web` (React / Vite or Next.js, Tailwind CSS, Lucide icons)
  - **Phase 2**: `apps/mobile` (React Native / Expo)
- **Shared Packages**:
  - `packages/db`: Drizzle ORM schema, migrations, seed scripts
  - `packages/auth`: Better Auth configuration and client utilities
  - `packages/shared-types`: Common TypeScript interfaces and Bible canonical references

---

## 3. Comprehensive Feature Matrix

### Phase 1: MVP (Web & Core Backend)

#### A. Bible Reading Experience

- **High-Performance Scripture Reader**:
  - Fast book/chapter navigation (Old & New Testament).
  - Seeded translations: World English Bible (WEB), King James Version (KJV), Louis Segond (LSG).
  - Fluid typography, font sizing, line height, and dark/sepia/light modes.
- **Verse Interaction & Selection**:
  - Click or tap any verse (or multi-verse span) to open the contextual action bar.
  - Inline comment indicators (bubble showing active discussion count).

#### B. Reading Circles ("Rooms")

- **Circle Creation & Management**:
  - Create a private circle with a custom name, description, and group translation.
  - Invite code / deep link to join circles.
  - Member list with avatar presence indicators.
- **Data & Privacy Isolation**:
  - Comments, highlights, and discussions strictly scoped to the active circle.
  - Separate "Personal Space" for private solo reading and reflections.

#### C. Verse-Level Conversational Marginalia

- **Inline Threads**:
  - Tap a verse to open a floating side drawer or bottom sheet with that verse's thread.
  - Post thoughts, questions, reflections, and reply to specific comments.
  - Emoji reactions on comments (e.g. ❤️, 🙏, 💡, 🔥).
- **Grace-Filled Progress Tracking**:
  - Mark chapter as completed for the user; see collective progress indicators (e.g. "4 of 6 read today") without streak pressure.
  - Late readers can open any past chapter and see preserved conversation history.

#### D. Live Sync Mode ("Companion Study Mode")

- **Audio-Agnostic Real-Time Presence**:
  - Live status: see who is currently in the chapter (avatars at the top).
  - Real-time verse focus: clicking a verse highlights it for everyone with the reader's avatar indicator.
  - Live reactions: floating hearts, praying hands, and lightbulbs that burst over verses in real-time.

---

### Phase 2: Mobile Expansion & Church Structures

#### E. React Native Mobile App (`apps/mobile`)

- Expo-powered cross-platform mobile client sharing the same TypeScript types and backend APIs.
- Smooth gesture-based verse selection and haptic feedback.
- Push notifications (via Expo Notifications): notify members when someone replies to their verse comment or starts a live reading session.
- Offline caching of read chapters and local verse notes.

#### F. Structured Groups for Churches & Ministries

- Role-based access control: Owner, Leader, Member.
- Cohort scheduling: ability for leaders to set structured reading schedules (e.g. 30-day Romans Journey).
- Co-leader delegation and member management.

---

## 4. Database Schema Design (PostgreSQL / Drizzle)

### 1. `users` (Managed by Better Auth)

- `id` (text/uuid, primary key)
- `name`, `email`, `image`
- `created_at`, `updated_at`

### 2. `bible_verses` (Seeded)

- `id` (serial primary key)
- `translation` (text, e.g. `'WEB'`, `'KJV'`, `'LSG'`)
- `book_id` (text, e.g. `'JHN'`, `'GEN'`)
- `book_name` (text, e.g. `'John'`)
- `chapter` (integer)
- `verse` (integer)
- `text` (text)
- _Index on `(translation, book_id, chapter, verse)`_

### 3. `circles` (Reading Rooms)

- `id` (uuid, primary key)
- `name` (text)
- `invite_code` (text, unique)
- `translation` (text, default `'WEB'`)
- `created_by` (uuid -> users.id)
- `created_at` (timestamp)

### 4. `circle_members`

- `circle_id` (uuid -> circles.id)
- `user_id` (uuid -> users.id)
- `role` (enum: `'admin'`, `'member'`)
- `joined_at` (timestamp)

### 5. `verse_threads`

- `id` (uuid, primary key)
- `circle_id` (uuid -> circles.id, nullable for personal notes)
- `user_id` (uuid -> users.id, creator)
- `book_id` (text)
- `chapter` (integer)
- `verse_start` (integer)
- `verse_end` (integer)
- `created_at` (timestamp)

### 6. `thread_comments`

- `id` (uuid, primary key)
- `thread_id` (uuid -> verse_threads.id)
- `user_id` (uuid -> users.id)
- `content` (text)
- `created_at` (timestamp)
- `updated_at` (timestamp)

### 7. `live_sessions` (Ephemeral / Realtime Presence)

- Managed via Supabase Realtime Channels (`room:circle_<id>`) for real-time cursors, active verse focus, and live reactions without persistent DB overhead.

---

## 5. Next Steps & Execution Plan

1. **Monorepo Setup**:
   - [x] Initialize Turborepo with pnpm workspaces.
   - [ ] Configure `packages/db` with Drizzle ORM + PostgreSQL.
   - [ ] Configure `packages/auth` with Better Auth.
   - [x] Set up `apps/webapp` (React (Tanstack Start) + Tailwind CSS).
2. **Bible Data Seeding**:
   - [ ] Create seed scripts to populate public domain Bible texts (WEB, KJV, LSG) into the database.
3. **Core Reading UI & Circle System**:
   - [ ] Build the clean Scripture Reader.
   - [ ] Implement Circle creation, joining, and room switching.
4. **Realtime Marginalia**:
   - [ ] Implement inline verse comments and Supabase Realtime event listeners.
5. **Live Sync Companion Mode**:
   - [ ] Implement avatar presence and live verse highlighting.
