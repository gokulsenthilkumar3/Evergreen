# How to Build the Standalone Executable for EverGreen

This guide explains how to build the `.exe` installer for distributing the application to clients. The installer bundles the frontend, backend API, and database into a single file.

## Prerequisites

1.  **Stop Running Servers**: Ensure that existing development servers (`npm run start:dev`, `npm run desktop`) are stopped to avoid file lock issues.
2.  **Internet Connection**: Required for the first build to download electron dependencies and Prisma binaries.

## Build Process

1.  Open your terminal in the project root (`d:\EverGreen`).
2.  Run the following command:

    ***Important**: You must run this command in a terminal with **Administrator privileges** (Right-click -> Run as administrator) to allow the installer tools to unpack correctly.*

    ```bash
    node build-desktop.js
    ```

3.  Wait for the process to complete. It will:
    *   Build the Database package.
    *   Build the NestJS API.
    *   Build the React frontend.
    *   Bundle everything into a `backend` folder.
    *   Install necessary production dependencies (this may take a few minutes).
    *   Generate the installer using `electron-builder`.

## Output Location

Once the build finishes successfully, you will find the installer at:

**`d:\EverGreen\apps\desktop\dist\EverGreen Setup 1.0.0.exe`**

You can share this `.exe` file with your client.

## Installation & First Run

1.  **Install**: Run the `.exe` on the client machine.
2.  **Data Location**: The application stores its database and logs in `%APPDATA%\EverGreen`.
3.  **Database**: The app initializes with a fresh database structure (from `dev.db`).
    *   The `admin` user is created automatically on first run if the database is empty.
    *   **Default Credentials**: username: `author`, password: `author123`.

## Troubleshooting

*   **Symbolic Link Error**: If you see `Cannot create symbolic link`, please ensure you are running the terminal as **Administrator**.
*   **Build Issues**: If the build fails during `npm install`, ensure you have a stable internet connection and try deleting the `apps/desktop/backend` folder before running the script again.
*   **Database Warnings**: You might see warnings about `dev.db` if it hasn't been migrated. Ensure you have run migrations in your development environment at least once.

### Fallback Option
If the installer generation (step 8) keeps failing but you see a `win-unpacked` folder in `apps/desktop/dist`, that folder contains the fully functional application. You can simply ZIP that folder and share it with the client. They can run `EverGreen.exe` directly from inside it.
