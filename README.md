# 🚀 PrepTrack AI - Intelligent Interview Readiness Assessor

> **Assess your interview readiness in under 2 minutes with AI-driven insights.**

<div align="center">

![Status](https://img.shields.io/badge/Status-Live-blue?style=for-the-badge)
![React](https://img.shields.io/badge/Frontend-React-61DAFB?style=flat-square&logo=react)
![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?style=flat-square&logo=fastapi)
![Tailwind](https://img.shields.io/badge/Styling-TailwindCSS-38B2AC?style=flat-square&logo=tailwindcss)
![Python](https://img.shields.io/badge/Language-Python-3776AB?style=flat-square&logo=python)

</div>

## 📌 Problem Statement 😟
Millions of students and job seekers face interviews unprepared, often discovering critical gaps in their technical knowledge, communication skills, or resume structure only **after rejection**. Traditional preparation methods are subjective, time-consuming, and lack immediate, actionable feedback.

**PrepTrack AI** solves this by providing an objective, data-driven **"Interview Readiness Score"** in less than 2 minutes, analyzing four key pillars:
1.  **Resume Quality** (Keyword & Structure Analysis) 📄
2.  **Technical Proficiency** (Dynamic Skill-Based Quiz) 💻
3.  **Communication Clarity** (Speech-to-Text Filler Word Detection) 🎙️
4.  **Portfolio Strength** (GitHub Integration) 🔗
5.  **SCREEN RECORDING OF THE PrepTrack AI - https://drive.google.com/drive/folders/1pzT0lbnE5UJ-NbMFGB4R83LmwssYL5Rk?usp=drive_link **

## 🌟 Key Features & Innovation ✨

### ⚡ Rapid Assessment (< 2 Minutes)
A streamlined 3-step flow ensures users get instant feedback without fatigue. No long forms, just quick, impactful inputs.

### 🧠 AI-Powered Dynamic Questioning
Unlike static quizzes, PrepTrack AI analyzes the user's uploaded resume to identify key skills (e.g., Python, AWS, React) and generates **personalized technical questions** relevant to their profile. *This ensures every user gets a unique assessment.*

### 🎙️ Speech-to-Text Communication Analysis
Users speak their introduction ("Tell me about yourself"). Our system converts speech to text and analyzes:
*   **Filler Words:** Detects "um," "uh," "like" to improve fluency. 🚫
*   **Content Length:** Ensures answers are substantial enough for an interview setting. ⏱️

### 📄 Smart PDF Parsing
Users can upload their resume in PDF format. The backend automatically extracts text using `pdfplumber`, eliminating manual copy-pasting errors. 📂

### 📊 Visual Readiness Dashboard
*   **Overall Score (0-100):** Clear metric with Beginner/Intermediate/Expert levels. 📈
*   **Radar Chart:** Visual breakdown of strengths across Resume, Technical, Communication, and Portfolio. 🕸️
*   **Actionable Feedback:** Specific, non-generic advice (e.g., *"Add more cloud technologies like AWS/Azure"*). 💡

## ️ Tech Stack 

| Component | Technology | Why We Chose It |
| :--- | :--- | :--- |
| **Frontend** | **React.js + Vite** ⚛️ | Fast, component-based UI for smooth user experience. |
| **Styling** | **Tailwind CSS** 🎨 | Rapid UI development with a clean, modern aesthetic. |
| **Visualization** | **Recharts** 📊 | Interactive Radar charts for score breakdown. |
| **Animations** | **Framer Motion** 🎬 | Smooth transitions between assessment steps. |
| **Backend** | **Python FastAPI** 🐍 | High-performance async API for quick scoring logic. |
| **PDF Processing** | **pdfplumber** 📑 | Accurate text extraction from resume PDFs. |
| **Speech API** | **Web Speech API** 🗣️ | Client-side speech-to-text for low-latency analysis. |
| **Icons** | **Lucide React** 🎒 | Clean, consistent iconography. |

## 📂 Project Structure 📁
preptrack-ai/
├── backend/
│ ├── main.py # FastAPI server, Scoring Logic, PDF Parsing
│ └── requirements.txt # Python dependencies
├── frontend/
│ ├── src/
│ │ ├── App.jsx # Main React Component & State Management
│ │ ├── index.css # Tailwind Directives
│ │ └── main.jsx # Entry Point
│ ├── index.html
│ ├── package.json
│ └── vite.config.js
└── README.md # Project Documentation


## 🏃‍♂️ How to Run Locally 💻

### Prerequisites
*   Node.js & npm installed
*   Python 3.8+ installed
