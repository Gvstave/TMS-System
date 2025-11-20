# Task Management & Scheduling System (TMS)

This is a full-stack Task Management System (TMS) designed for academic environments. Built with Next.js, Firebase, and Genkit, this application provides a seamless platform for lecturers to create projects and for students to manage their tasks effectively. The system is enhanced with AI-powered features to assist in project planning and task breakdown.

## Features

### For Lecturers
- **Authentication**: Secure sign-up and login functionality.
- **Project Creation**: Easily create new projects with a title, detailed description, and a deadline.
- **Student Assignment**: Assign projects to one or multiple students from a list of available students.
- **AI Task Suggestions**: Automatically generate a list of actionable tasks for a new project using an AI assistant, ensuring a well-structured starting point.
- **Dashboard Overview**: View all created projects, filterable by status (Pending, In Progress, Completed), and search by project title.
- **Progress Tracking**: Open any project to view its associated tasks, their statuses, and any comments, providing a clear overview of student progress.
- **Project Deletion**: Remove projects and all their associated tasks and data.

### For Students
- **Authentication**: Secure sign-up and login, including associating with a specific lecturer.
- **Personalized Dashboard**: View all projects assigned specifically to you, filterable by status.
- **Task Management**:
    - View all tasks for a project.
    - Create new tasks and subtasks.
    - Update the status of each task (Pending, In Progress, Completed).
- **AI-Powered Task Breakdown**: Use an AI assistant to generate suggestions for breaking down a large project into smaller, manageable tasks.
- **Commenting System**: Add comments to any task to ask questions, provide updates, or collaborate.
- **Project Submission**: Once all tasks are marked as "Completed," students can submit the entire project for review.

## Tech Stack

- **Framework**: Next.js (App Router)
- **Styling**: Tailwind CSS with shadcn/ui components
- **Authentication**: Firebase Authentication
- **Database**: Firestore
- **Generative AI**: Google's Gemini models via Genkit
- **Deployment**: Firebase App Hosting

## Getting Started

1.  **Clone the repository.**
2.  **Install dependencies**:
    ```bash
    npm install
    ```
3.  **Set up Firebase**:
    - Create a new Firebase project in the [Firebase Console](https://console.firebase.google.com/).
    - Enable Firestore and Firebase Authentication (Email/Password provider).
    - Copy your Firebase project configuration into a `.env.local` file in the root of the project. See `.env.example` for the required variables.
4.  **Run the development server**:
    ```bash
    npm run dev
    ```
    The application will be available at `http://localhost:9002`.
