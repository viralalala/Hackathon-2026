# Cognito - AI Mental Health Companion

**Created by: printf scanf**

## Overview
Cognito is a premium, voice-first mental wellness companion designed to provide a calm, emotionally intelligent, and non-judgmental presence. Built using the cutting-edge Gemini Live API, Cognito allows users to have real-time, fluid voice conversations. The AI listens actively, validates feelings, and responds with a warm, grounded, and organic tone to make users feel heard, understood, and safe.

## Features
- **Real-Time Voice Interaction:** Have natural, low-latency voice conversations with the AI companion.
- **Live Transcription:** See real-time text transcriptions of both your speech and the AI's responses.
- **Emotionally Intelligent AI:** Powered by Gemini 3.1 Flash Live Preview, customized with system instructions to act as a supportive mental health guide.
- **Calm & Minimal UI:** A soothing, distraction-free interface designed specifically for mental wellness and focus.
- **Audio Streaming:** Uses WebSockets and the Web Audio API for seamless PCM audio streaming and playback.

## Tech Stack
- **Frontend Framework:** React 19, Vite
- **Styling:** Tailwind CSS
- **AI Integration:** `@google/genai` (Gemini 3.1 Flash Live Preview API)
- **Audio Processing:** Web Audio API (16kHz PCM recording, 24kHz playback)
- **Animations:** Framer Motion (`motion/react`)
- **Icons:** Lucide React

## Setup & Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure Environment Variables:**
   Create a `.env` file in the root directory and add your Gemini API key:
   ```env
   GEMINI_API_KEY=your_api_key_here
   ```

3. **Run the development server:**
   ```bash
   npm run dev
   ```

4. **Open the app:**
   Navigate to `http://localhost:3000/chat.html` in your browser to start a session.

## Credits
**All design, development, and implementation credits go exclusively to:**
- **printf scanf**

*(No other individuals or entities are credited for this project).*
