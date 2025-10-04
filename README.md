# Interview Bot - Frontend Setup

## What This Is
This is the **frontend** (the part users see and click on) for an AI-powered interview practice tool. Think of it like the face of a website - it's what you interact with using your web browser.

## What I Just Created For You

### 1. **DockerFile** (`frontend/Dockerfile`)
- This tells Docker (your container system) how to build your website
- It uses Node.js version 18 (a programming language for websites)
- It copies your code and installs everything needed to run your website

### 2. **Package Configuration** (`frontend/package.json`)
- This is like a shopping list of all the tools your website needs
- It includes **Next.js** (makes websites fast and modern)
- It includes **React** (makes interactive buttons and forms)
- It tells your computer what commands to run when you want to start your website

### 3. **Website Pages**
- **`pages/index.tsx`** - This is your main homepage where users paste their job description and resume
- **_app.tsx** - This is the "frame" that wraps around every page of your website

### 4. **Styling** (`styles/globals.css`)
- This makes your website look pretty with colors, fonts, and layout
- I made it look modern with a purple gradient background
- The form has a white box that stands out nicely

### 5. **Configuration Files**
- **`next.config.js`** - Settings for how Next.js should work
- **`tsconfig.json`** - Settings for TypeScript (a safer way to write JavaScript)

## How It All Works Together

1. **User visits your website** → They see a homepage asking for job description and resume
2. **User fills out the form** → They paste their job info and resume text
3. **User clicks "Start Interview"** → This will eventually connect to your AI backend
4. **The website is pretty** → Clean, modern design that looks professional

## What You Need To Do Next

### Step 1: Create Your Backend
- You need Python code that talks to AI services (like ChatGPT)
- This will process the job description and generate interview questions

### Step 2: Connect Frontend to Backend
- Right now, clicking "Start Interview" just logs to the console
- You need to make it send data to your Python backend
- The backend will send back interview questions

### Step 3: Add Interview Flow
- Create a page that shows interview questions one by one
- Let users type or speak their answers
- Show the AI feedback after each question

### Step 4: Add Features
- Audio recording for speech-to-text
- Score tracking and progress bars
- Better feedback visualization

## How To Run Your Website Now

1. **Open Terminal/Command Prompt**
2. **Navigate to your project folder**
3. **Run this command:**
   ```bash
   make dev-up
   ```
4. **Open your browser and go to:** http://localhost:3000

## What Each File Does (Simple Explanation)

- **`.gitignore`** = Tells Git (version control) what files NOT to save
- **`docker-compose.yml`** = Connects your frontend and backend together
- **`Makefile`** = Contains simple commands to start/stop your project
- **`frontend/Dockerfile`** = Instructions for building your website
- **`frontend/package.json`** = List of what your website needs to work
- **`frontend/pages/`** = Your actual website pages
- **`frontend/styles/`** = Colors, fonts, and layout rules

## Next Steps Priority

1. ✅ **Frontend setup** (You just completed this!)
2. 🔄 **Backend Python setup** (Need this next)
3. 🔄 **AI integration** (Connect to OpenAI/Anthropic)
4. 🔄 **Interview flow** (Questions → Answers → Feedback)
5. ⏰ **Audio features** (Optional, for later)

Remember: You're building this step by step. Each piece makes the next piece possible!
