# Digital Planner

A sleek, minimal web-based planner to track tasks and events across school, work, and personal contexts. Built with Next.js, TypeScript, Tailwind CSS, and shadcn/ui.

## Features
- Unified dashboard for School, Work, Personal
- Calendar view (month/week/day)
- Kanban-style task mode
- Add/edit/delete tasks/events with category, time/date, notes
- Color-coded tags and category filters
- Daily/weekly summary panel
- Supabase or localStorage data persistence
- Responsive, modern UI with dark mode
- **User Authentication** - Sign up and login with email/password
- **Personal Data** - Each user has their own private tasks and categories

## Getting Started

### Prerequisites
- Node.js 18+ installed
- A Supabase account (free tier works great!)

### Step 1: Clone the Repository
```bash
git clone https://github.com/Casey1357918/Digital-Planner-v1.git
cd Digital-Planner-v1
```

### Step 2: Set Up Supabase (Free & Easy!)

1. **Create a Supabase Account:**
   - Go to [https://supabase.com](https://supabase.com)
   - Click "Start your project" and sign up (free tier)

2. **Create a New Project:**
   - Click "New Project"
   - Choose your organization
   - Enter a project name (e.g., "Digital Planner")
   - Set a database password
   - Choose a region close to you
   - Click "Create new project"

3. **Get Your API Keys:**
   - In your Supabase dashboard, go to **Settings > API**
   - Copy your **Project URL** and **anon public** key

4. **Set Up Environment Variables:**
   ```bash
   # Copy the example environment file
   cp .env.example .env.local
   
   # Edit .env.local and add your Supabase credentials:
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   ```

### Step 3: Install Dependencies & Run
```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

### Step 4: Create Your Account
- Click the user icon in the top-right corner
- Click "Sign Up" to create your account
- Start adding your tasks and categories!

## How It Works

- **Authentication**: Each user has their own account with email/password
- **Personal Data**: Your tasks and categories are private to your account
- **Real-time**: Changes sync instantly across all your devices
- **Secure**: Built with Supabase's Row Level Security (RLS)

## Features

### Task Management
- Create tasks with categories, dates, times, and importance levels
- Mark tasks as complete/incomplete
- Edit or delete tasks
- Filter by category

### Categories
- Create custom categories with icons and colors
- Organize tasks by school, work, personal, or any custom category
- Visual category indicators

### Calendar View
- Monthly calendar view of all your tasks
- Click on tasks to edit them
- Visual indicators for task importance and completion status

### Dark Mode
- Toggle between light and dark themes
- Automatic theme detection

## Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Real-time)
- **UI Components**: shadcn/ui, Lucide React icons
- **Styling**: Tailwind CSS with dark mode support

## Learn More

To learn more about the technologies used:

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
