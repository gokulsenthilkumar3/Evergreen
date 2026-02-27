# Ever Green Yarn Mills: Deployment & Distribution Guide

Congratulations on completing the **Ever Green Yarn Mills SMS**. This guide details exactly how the offline desktop application is structured, why it looks the way it does, and how to distribute it to your clients.

## 📦 The Distribution File: `EverGreen-Desktop-V1.zip`
This single archive contains everything your customer needs. It is currently located at:
**`D:\EverGreen\EverGreen-Desktop-V1.zip`**

### 🎯 The "Plug-and-Play" Architecture
When your customer extracts the ZIP file, they will see a folder containing `EverGreen.exe` alongside roughly 16 supporting files and directories (such as `ffmpeg.dll`, `d3dcompiler_47.dll`, `resources/`, and `locales/`). 

**Why are there so many files instead of just one `.exe`?**
This is the standard architecture of **Electron**, the enterprise-grade framework we used to make your complex web-based application run entirely offline. It is the exact same technology and file structure used by industry-leading desktop applications like:
* Slack
* Discord
* Microsoft Teams
* Visual Studio Code

### ⚙️ How it Works under the Hood
Electron works by taking the entire **Google Chrome browser engine (Chromium)** and the entire **Node.js runtime engine** and permanently strapping them directly to your app. 

* **The `.dll` files (e.g. `ffmpeg.dll`, `libEGL.dll`):** These are vital video, graphics, and rendering drivers. Because your application has modern charts and fluid Material-UI animations, Google Chrome needs these graphical drivers to independently draw your complex user interface on the screen.
* **The `resources/` folder:** This is the secure "vault" that actually holds all of your intellectual property—your specific NestJS backend code, Vite React frontend code, and the SQLite database file.
* **`EverGreen.exe` (The Master Switch):** Unifying all these pieces, this main executable is the launch trigger. When double-clicked, it silently powers up the embedded Node engine (spinning up your API backend), connects automatically to the SQLite database, and then launches the embedded Chromium engine (rendering the frontend web UI) seamlessly in a standalone window.

### 🌟 The Huge Benefit of this Architecture
Because we intentionally bundled *all* of these heavy dependency files inside the ZIP, **your customer does not need to install anything.**

1. They **do not** need to install Node.js natively.
2. They **do not** need to install a database management system (like SQL Server or Postgres).
3. They **do not** even need to have Google Chrome installed on their PC.

It is 100% self-contained.

***

## 🚀 Instructions for the Customer
You can copy-paste the instructions below in your email/delivery to the client:

1. Download and save `EverGreen-Desktop-V1.zip` to your computer (e.g., your Desktop or Documents folder).
2. Right-click the `.zip` file and select **"Extract All..."**.
3. Open the newly created folder and double-click the **`EverGreen.exe`** file.
4. **First Time Login:** Because this is a fresh database, an administrative account has been securely generated for you. 
   - **Username:** `author`
   - **Password:** `author123`
5. *(Optional but Highly Recommended)*: Go to the "Settings" tab immediately after logging in and change your password.

---

### 💾 Backing Up Their Data
Because the database is completely stored as a single local file (`dev.db`) inside their `resources/` folder, backing up the application is as simple as copying the entire extracted `EverGreen-Desktop-V1` folder to a USB thumb drive. No complex cloud or database exports are strictly required.
