#  AI Video / Shorts Generator Agent  
  Project – Web Application

An AI-powered web application that converts a text description into a fully narrated short video or social-media-style reel.  
The system automatically generates scripts, visuals, voice-over, captions, and assembles everything into a synchronized video.

---

##  Problem Statement

Creating short-form videos for platforms like YouTube Shorts, Instagram Reels, and LinkedIn requires scripting, visual design, voice-over recording, captioning, and video editing.  
This process is time-consuming and requires technical expertise.

The challenge is to build a web-based AI system that automatically converts a text prompt into a complete short video with minimal user effort.

---

##  Objective

- Automatically generate short videos from text input  
- Support multiple platforms, tones, durations, and languages  
- Reduce manual video editing effort  
- Deliver platform-ready social media videos  

---

##  Features

- Scene-based script generation  
- AI-generated visuals per scene  
- AI voice-over narration  
- Audio–visual synchronization  
- Automatic caption/subtitle generation  
- Video preview and download  
- Regenerate individual components  

---


##  System Architecture

The AI Video / Shorts Generator Agent follows a modular, end-to-end pipeline that transforms user input into a fully synchronized short video.

```text
User Input
   ↓
Frontend (React + Vite)
   ↓
Backend API (Python + Flask)
   ↓
AI Services
   ├─ Script Generator
   ├─ Visual Generator
   ├─ Text-to-Speech
   ↓
Video Composer
   ↓
Final Video + Captions
```
##  Tech Stack

### Frontend
- React  
- TypeScript  
- Vite  
- HTML5 & CSS3  
- Web Audio API  
- ESLint  

### Backend
- Python  
- Flask  
- RESTful APIs  

### AI Components
- Open-source Text-to-Speech models  
- AI image / visual generation  

---
##  Project Structure

```text
AI-Video-Generator-Agent/
│
├── backend/
│   ├── app.py                # Main Flask application
│   ├── requirements.txt      # Backend dependencies
│   └── services/             # AI services (script, visuals, TTS)
│
├── frontend/
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── pages/            # Application pages
│   │   └── App.tsx           # Root React component
│   │
│   ├── package.json          # Frontend dependencies
│   └── vite.config.ts        # Vite configuration
│
├── README.md                 # Project documentation
└── .gitignore                # Git ignore rules
```
---

##  Inputs

The application accepts the following inputs:

- **Video Topic**  
- **Video Description / Script Idea**  
-  **Target Platform**
  - YouTube Shorts  
  - Instagram Reels  
  - LinkedIn  
  - Generic  
-  **Video Duration**
  - 15 seconds  
  - 30 seconds  
  - 60 seconds  
-  **Tone**
  - Informative  
  - Promotional  
  - Storytelling  
  - Humorous 
- **Voice Type**
  - Male  
  - Female  
  - Neutral  
-  **Language**  
-  English
- Hindi
- Telugu
---
##  Outputs

### Generated Script
- Scene-wise narration text  

###  AI-Generated Visuals
- Images or short clips for each scene  

###  AI Voice-Over
- Audio narration generated per scene  

###  Final Video
- Fully synchronized visuals and voice-over  

###  Captions / Subtitles
- Automatically generated and synced  

###  Video Preview
- In-browser preview of generated video  

###  Downloadable File
- Final video available for download  

---

## Quick Start (Local Development)

###  Prerequisites
- Python 3.8+  
- Node.js & npm  
- Modern web browser  

---
## Step 1: Clone the Repository

```bash
git clone https://github.com/Sreyagali0627/AI-Video-Generator-Agent-Final.git
cd AI-Video-Generator-Agent-Final
```
## Step 2: Run Backend
```bash
cd backend
pip install -r requirements.txt
python app.py
```
## step 3: Run Frontend
```bash
cd frontend
npm install
npm run dev
```
## Functional Requirements

-  **Scene-based script generation** from a single text description  
-  **AI-generated visuals** for each scene  
-  **AI voice-over narration** synchronized with scene content  
-  **Audio–visual synchronization** to ensure smooth playback  
-  **Automatic caption generation** from narration text  
-  **Video preview** within the web application  
-  **Download option** for the final generated video  
-  **Regeneration of individual components**, including:
  - Script  
  - Visuals  
  - Voice-over  
  - Specific scenes  
##  Evaluation Criteria

The project is evaluated based on the following parameters:

-  **Script clarity and flow** – Logical structure and smooth narration across scenes  
-  **Voice-over quality and synchronization** – Natural-sounding audio aligned with visuals  
- **Scene-to-visual relevance** – Accuracy of generated visuals with respect to scene narration  
-  **Video timing and coherence** – Consistent pacing and smooth scene transitions  
-  **Caption accuracy** – Correct, readable, and well-timed subtitles  
-  **UI usability** – Ease of use, clarity of controls, and overall user experience  

---

##  Future Enhancements

The following improvements are planned for future versions of the application:

-  **Image-based actor generation** – Use actor or character images that match the narration text  
-  **Animated avatars and talking characters**  
-  **Multi-language support** for scripts, voice-over, and captions  
-  **Background music and audio effects** integration  
-  **Visual style presets** (cinematic, corporate, social-media focused)  
-  **Platform-specific optimization** (aspect ratio, caption styles, pacing)  
-  **Scene-level editing and timeline control**  
-  **Cloud storage integration** for generated videos  
-  **Advanced AI agent logic** for smarter scene planning and transitions  

These enhancements aim to improve realism, personalization, and production quality while maintaining ease of use.
## License

This project is licensed under the **MIT License**. 

See the LICENSE file for complete details. 

##  Live Deployment

You can access the live web application here:  

**Live Web Application:** [https://your-project-live-link.com](https://your-project-live-link.com)  

> Note: This is a hosted demo of the AI Video / Shorts Generator Agent.  
> All features including script generation, AI visuals, voice-over, captions, and video download are available in real-time.


##  Edge Cases and Limitations

### Positive Edge Cases
- Short and medium-length text inputs generate speech with **low latency**  
- Emotion, pitch, and speed controls are **accurately reflected** in output audio  
- Multilingual text inputs work correctly for **supported languages**  
- Browser-based audio playback works **without additional plugins**  
- Frontend and backend setup provides **consistent behavior** across environments  
### Negative Edge Cases
- Very long text inputs may **increase processing time and latency**  
- Large AI models may cause **memory issues** on low-resource systems  
- First request after backend inactivity may experience **cold-start delay**  
- AI voice or scene generation quality may depend on **clarity and length of input text**  
- High concurrent requests may **reduce real-time performance**  
- Network interruptions can affect **video or audio streaming**

##  Contributors

- **Roshini Krishnasri** — [roshini-hub](https://github.com/RoshiniKrishnasri)  
- **Sreyagali** — [Sreyagali0627](https://github.com/Sreyagali0627)

Developed under the guidance and support of Coriolis.

##  Contributing
Contributions are welcome.

You may:

Submit pull requests for improvements or new features
Open issues to report bugs or suggest enhancements

Please ensure contributions follow the existing project structure and coding standards.
##  Acknowledgments

We would like to thank the following for their guidance and support in this project:

- **Open-source AI and TTS research community** – for models and libraries  
- **React, Vite, and Flask communities** – for frontend and backend frameworks  
- **Web Audio API and Media APIs** – for enabling browser-based audio playback  
- **Hackathon mentors and peers** – for feedback and suggestions  
- Inspiration from similar AI-powered video generation projects

---
🌟 Love this work? Your support means a lot!
