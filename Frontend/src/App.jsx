import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { CheckCircle, AlertCircle, Mic, MicOff, FileText, Github, Loader } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const API_URL = "http://localhost:8000";

// Fallback Question Bank (Used if AI generation fails or for general CS knowledge)
const FALLBACK_QUESTIONS = [
  { q: "Difference between Process and Thread?", options: ["Memory Space", "CPU Usage", "No Difference"], correct: 0 },
  { q: "SQL Join that returns all records from both tables?", options: ["Inner Join", "Full Outer Join", "Left Join"], correct: 1 },
  { q: "Time complexity of HashMap insertion?", options: ["O(1) Average", "O(n)", "O(log n)"], correct: 0 },
  { q: "React Hook for side effects?", options: ["useState", "useEffect", "useContext"], correct: 1 },
  { q: "What is CORS?", options: ["Cross-Origin Resource Sharing", "Code Origin Security", "None"], correct: 0 },
  { q: "Which DB is NoSQL?", options: ["PostgreSQL", "MongoDB", "MySQL"], correct: 1 },
  { q: "What does AWS S3 store?", options: ["Databases", "Objects/Files", "Compute Instances"], correct: 1 },
  { q: "Git command to save changes?", options: ["git push", "git commit", "git pull"], correct: 1 }
];

function App() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [currentQuestions, setCurrentQuestions] = useState([]);

  // State for inputs
  const [resumeText, setResumeText] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [quizAnswers, setQuizAnswers] = useState([]);
  const [transcript, setTranscript] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [fileName, setFileName] = useState("");
  const [error, setError] = useState("");

  // Speech Recognition
  const startListening = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert("Use Chrome for Speech-to-Text.");
      return;
    }
    const recognition = new window.webkitSpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => setIsRecording(true);
    recognition.onend = () => setIsRecording(false);
    recognition.onresult = (event) => {
      const text = event.results[0][0].transcript;
      setTranscript((prev) => prev + " " + text);
    };
    recognition.start();
  };

  // PDF Upload Handler
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setFileName(file.name);
    setLoading(true);
    setError("");

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post(`${API_URL}/upload-pdf`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setResumeText(response.data.text);
      alert("PDF Parsed Successfully!");
    } catch (err) {
      console.error(err);
      setError("Failed to parse PDF. Please paste text manually.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch Dynamic Questions based on Resume Skills
  const fetchDynamicQuestions = async () => {
    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/generate-questions`, {
        resume_text: resumeText
      });
      // Ensure we have 4 questions
      let qs = response.data.questions || [];
      if (qs.length < 4) {
        // Fill with fallback questions if AI returns fewer than 4
        const shuffledFallback = [...FALLBACK_QUESTIONS].sort(() => 0.5 - Math.random());
        qs = [...qs, ...shuffledFallback].slice(0, 4);
      }
      setCurrentQuestions(qs);
    } catch (err) {
      console.error("AI Question Gen Failed, using fallback");
      const shuffled = [...FALLBACK_QUESTIONS].sort(() => 0.5 - Math.random());
      setCurrentQuestions(shuffled.slice(0, 4));
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (step === 1) {
      if (!githubUrl.trim()) {
        alert("GitHub Profile URL is Mandatory!");
        return;
      }
      if (!resumeText.trim()) {
        alert("Please upload PDF or paste resume text!");
        return;
      }
      // Trigger AI Question Generation when moving to Step 2
      fetchDynamicQuestions();
    }
    setStep(step + 1);
  };

  const submitAssessment = async () => {
    if (!transcript.trim()) {
      alert("Please record your introduction!");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const response = await axios.post(`${API_URL}/analyze`, {
        resume_text: resumeText,
        github_url: githubUrl,
        quiz_answers: quizAnswers,
        video_transcript: transcript
      });
      setResult(response.data);
      setStep(4);
    } catch (err) {
      console.error(err);
      setError("Backend Error. Ensure server is running on port 8000.");
    } finally {
      setLoading(false);
    }
  };

  // --- Components ---

  const Step1_Upload = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
        <FileText className="w-6 h-6 text-blue-600"/> Step 1: Profile Input
      </h2>
      
      {/* PDF Upload */}
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
        <label className="block text-sm font-medium text-blue-800 mb-2">Upload Resume (PDF Only)</label>
        <div className="flex items-center gap-2">
          <input 
            type="file" 
            accept=".pdf"
            onChange={handleFileUpload}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer"
          />
          {fileName && <span className="text-xs text-green-600 font-bold flex items-center gap-1"><CheckCircle className="w-3 h-3"/> {fileName}</span>}
        </div>
        {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Resume Text (Auto-filled)</label>
          <textarea 
            className="w-full p-3 border rounded-lg h-24 focus:ring-2 focus:ring-blue-500 outline-none bg-white text-sm"
            value={resumeText}
            onChange={(e) => setResumeText(e.target.value)}
            placeholder="Or paste text here..."
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">GitHub Profile URL <span className="text-red-500">*</span></label>
          <div className="relative">
            <Github className="absolute left-3 top-3 w-5 h-5 text-gray-400"/>
            <input 
              type="text" 
              className={`w-full pl-10 p-3 border rounded-lg focus:ring-2 outline-none bg-white ${githubUrl ? 'border-green-500 ring-1 ring-green-500' : 'border-gray-300'}`}
              placeholder="https://github.com/username"
              value={githubUrl}
              onChange={(e) => setGithubUrl(e.target.value)}
            />
          </div>
        </div>
      </div>
      <button onClick={handleNext} className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition shadow-md">
        Next: Technical Check
      </button>
    </div>
  );

  const Step2_Quiz = () => {
    const handleAnswer = (qIndex, optIndex) => {
      // Prevent changing answer if already answered
      if (quizAnswers[qIndex]) return;

      const newAnswers = [...quizAnswers];
      // Store whether the selected option was correct or not
      newAnswers[qIndex] = { 
        selected: optIndex, 
        is_correct: optIndex === currentQuestions[qIndex].correct 
      };
      setQuizAnswers(newAnswers);
    };

    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <CheckCircle className="w-6 h-6 text-green-600"/> Step 2: Technical Quiz
        </h2>
        
        {loading && currentQuestions.length === 0 ? (
           <div className="flex justify-center items-center h-40">
             <Loader className="animate-spin w-8 h-8 text-blue-600 mr-2"/>
             <span className="text-gray-600">Generating AI Questions...</span>
           </div>
        ) : (
          <div className="space-y-4">
            {currentQuestions.map((q, idx) => {
              const userAnswer = quizAnswers[idx];
              const isAnswered = !!userAnswer;

              return (
                <div key={idx} className="bg-gray-50 p-4 rounded-lg border">
                  <p className="font-medium mb-3 text-gray-800 text-sm">{idx + 1}. {q.q}</p>
                  <div className="flex gap-2 flex-wrap">
                    {q.options.map((opt, optIdx) => {
                      // Determine button color based on state
                      let btnClass = "hover:bg-white bg-white border-gray-200"; // Default

                      if (isAnswered) {
                        if (optIdx === q.correct) {
                          // Always show Correct Answer in Green
                          btnClass = "bg-green-100 border-green-500 text-green-800 font-semibold";
                        } else if (optIdx === userAnswer.selected && !userAnswer.is_correct) {
                          // Show Wrong Selection in Red
                          btnClass = "bg-red-100 border-red-500 text-red-800";
                        } else {
                          // Other options remain neutral but disabled
                          btnClass = "bg-gray-100 text-gray-400 cursor-not-allowed";
                        }
                      }

                      return (
                        <button 
                          key={optIdx}
                          onClick={() => handleAnswer(idx, optIdx)}
                          disabled={isAnswered} // Disable after first click
                          className={`px-3 py-2 rounded-md border text-xs transition ${btnClass}`}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <button 
          onClick={handleNext} 
          disabled={quizAnswers.length !== currentQuestions.length || loading}
          className={`w-full py-3 rounded-lg font-semibold transition shadow-md ${
            quizAnswers.length === currentQuestions.length && !loading
              ? 'bg-blue-600 text-white hover:bg-blue-700' 
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          Next: Communication Check
        </button>
      </div>
    );
  };

  const Step3_Communication = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
        <Mic className="w-6 h-6 text-purple-600"/> Step 3: Voice Introduction
      </h2>
      <div className="bg-purple-50 p-6 rounded-lg border text-center">
        <p className="mb-4 text-gray-700 text-sm">Click mic and speak: <strong>"Tell me about yourself."</strong></p>
        
        <button 
          onClick={isRecording ? () => {} : startListening}
          disabled={isRecording}
          className={`p-4 rounded-full mb-4 transition ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-purple-600 hover:bg-purple-700'}`}
        >
          {isRecording ? <MicOff className="w-8 h-8 text-white"/> : <Mic className="w-8 h-8 text-white"/>}
        </button>
        
        <div className="bg-white p-3 rounded-lg border min-h-[80px] text-left text-xs text-gray-600 overflow-y-auto max-h-32">
          {transcript || "Your speech will appear here..."}
        </div>
      </div>
      <button 
        onClick={submitAssessment} 
        disabled={loading}
        className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition shadow-md flex justify-center items-center gap-2"
      >
        {loading ? <><Loader className="animate-spin w-5 h-5"/> Analyzing...</> : "Get Readiness Score"}
      </button>
    </div>
  );

  const Step4_Results = () => {
    const data = [
      { subject: 'Resume', A: result.breakdown.resume, fullMark: 100 },
      { subject: 'Technical', A: result.breakdown.technical, fullMark: 100 },
      { subject: 'Comm.', A: result.breakdown.communication, fullMark: 100 },
      { subject: 'Portfolio', A: result.breakdown.portfolio, fullMark: 100 },
    ];

    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-800">Interview Readiness</h2>
          <div className={`text-6xl font-black my-4 text-${result.color}-600`}>{result.overall_score}/100</div>
          <span className={`px-4 py-1 rounded-full text-white bg-${result.color}-500 font-bold text-lg`}>{result.level}</span>
        </div>

        <div className="bg-white p-2 rounded-lg shadow-sm border h-64">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
              <PolarGrid />
              <PolarAngleAxis dataKey="subject" tick={{fill: '#4b5563', fontSize: 10}} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
              <Radar name="Score" dataKey="A" stroke="#2563eb" fill="#3b82f6" fillOpacity={0.6} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="font-bold text-lg mb-3 flex items-center gap-2 text-gray-800">
            <AlertCircle className="w-5 h-5 text-orange-500"/> Action Plan
          </h3>
          <ul className="space-y-2">
            {result.feedback.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2 text-gray-700 text-xs">
                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>
        
        <button onClick={() => window.location.reload()} className="w-full bg-gray-800 text-white py-3 rounded-lg font-semibold hover:bg-gray-900 transition">
          Start Over
        </button>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-blue-600 p-4 text-white flex justify-between items-center">
          <h1 className="font-bold text-xl tracking-tight">PrepTrack AI</h1>
        </div>
        <div className="p-6">
          <AnimatePresence mode="wait">
            <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
              {step === 1 && <Step1_Upload />}
              {step === 2 && <Step2_Quiz />}
              {step === 3 && <Step3_Communication />}
              {step === 4 && <Step4_Results />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

export default App;