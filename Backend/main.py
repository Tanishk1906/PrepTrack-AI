from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import time
import pdfplumber
import io
import random

app = FastAPI(title="PrepTrack AI API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Question Database mapped to Skills
SKILL_QUESTIONS = {
    "python": [
        {"q": "What is the difference between list and tuple in Python?", "options": ["Mutability", "Size", "No Difference"], "correct": 0},
        {"q": "What does GIL stand for in Python?", "options": ["Global Interpreter Lock", "General Interface Library", "None"], "correct": 0}
    ],
    "java": [
        {"q": "Which keyword is used to inherit a class in Java?", "options": ["extends", "implements", "inherits"], "correct": 0},
        {"q": "What is the default value of an int in Java?", "options": ["0", "null", "undefined"], "correct": 0}
    ],
    "sql": [
        {"q": "Which SQL command is used to remove a table completely?", "options": ["DROP", "DELETE", "TRUNCATE"], "correct": 0},
        {"q": "What does ACID stand for in DBMS?", "options": ["Atomicity, Consistency, Isolation, Durability", "Access, Control, Identity, Data", "None"], "correct": 0}
    ],
    "react": [
        {"q": "What is the virtual DOM in React?", "options": ["A lightweight copy of the real DOM", "A database", "A CSS framework"], "correct": 0},
        {"q": "Which hook is used to manage state in functional components?", "options": ["useState", "useEffect", "useContext"], "correct": 0}
    ],
    "aws": [
        {"q": "Which AWS service is used for object storage?", "options": ["S3", "EC2", "RDS"], "correct": 0},
        {"q": "What does EC2 stand for?", "options": ["Elastic Compute Cloud", "Electronic Code Computer", "None"], "correct": 0}
    ]
}

class AssessmentData(BaseModel):
    resume_text: str
    github_url: str
    quiz_answers: list
    video_transcript: str

@app.get("/")
def read_root():
    return {"message": "PrepTrack AI API is running"}

@app.post("/generate-questions")
def generate_questions(data: dict):
    resume_text = data.get("resume_text", "").lower()
    
    # Find matching skills in resume
    matched_skills = [skill for skill in SKILL_QUESTIONS.keys() if skill in resume_text]
    
    questions = []
    if matched_skills:
        for skill in matched_skills[:2]: # Pick top 2 skills
            questions.extend(random.sample(SKILL_QUESTIONS[skill], min(2, len(SKILL_QUESTIONS[skill]))))
    
    # Fill remaining with general DSA/CS questions if needed
    general_questions = [
        {"q": "Time complexity of Binary Search?", "options": ["O(log n)", "O(n)", "O(1)"], "correct": 0},
        {"q": "What is a Deadlock in OS?", "options": ["Circular wait for resources", "Fast processing", "None"], "correct": 0}
    ]
    
    while len(questions) < 4:
        questions.append(random.choice(general_questions))
        
    # Shuffle and return only 4
    random.shuffle(questions)
    return {"questions": questions[:4]}

@app.post("/analyze")
def analyze_readiness(data: AssessmentData):
    start_time = time.time()
    
    # 1. Resume AI Analysis
    key_skills = ["python", "java", "c++", "sql", "react", "node", "aws", "docker", "kubernetes", "git", "tensorflow", "pytorch", "mongodb", "postgresql"]
    text_lower = data.resume_text.lower()
    tech_found = [kw for kw in key_skills if kw in text_lower]
    resume_score = min(100, (len(tech_found) * 5) + 20)
    
    # 2. Technical Quiz Analysis
    correct_count = sum(1 for ans in data.quiz_answers if ans.get('is_correct', False))
    total_questions = len(data.quiz_answers) if data.quiz_answers else 1
    tech_score = int((correct_count / total_questions) * 100)
    
    # 3. Communication AI Analysis
    filler_words = ["um", "uh", "like", "you know", "actually", "basically"]
    transcript_lower = data.video_transcript.lower()
    filler_count = sum(transcript_lower.count(word) for word in filler_words)
    word_count = len(transcript_lower.split())
    comm_score = max(0, 100 - (filler_count * 10) - (0 if word_count > 30 else 20))
    
    # 4. Portfolio Check
    portfolio_score = 90 if "github.com" in data.github_url.lower() else 40
    
    overall_score = int((resume_score * 0.35) + (tech_score * 0.35) + (comm_score * 0.15) + (portfolio_score * 0.15))
    
    level = "Expert" if overall_score >= 85 else "Intermediate" if overall_score >= 60 else "Beginner"
    color = "green" if overall_score >= 85 else "yellow" if overall_score >= 60 else "red"
    
    feedback = []
    if resume_score < 70: feedback.append("Add more technical keywords like Cloud or DBs.")
    if tech_score < 70: feedback.append("Review core DSA patterns.")
    if comm_score < 80: feedback.append("Reduce filler words. Practice STAR method.")
    if not feedback: feedback.append("Great job! Focus on System Design next.")
    
    return {
        "overall_score": overall_score,
        "level": level,
        "color": color,
        "breakdown": {"resume": resume_score, "technical": tech_score, "communication": comm_score, "portfolio": portfolio_score},
        "feedback": feedback,
        "processing_time": round(time.time() - start_time, 2)
    }

@app.post("/upload-pdf")
async def upload_pdf(file: UploadFile = File(...)):
    if file.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="File must be a PDF")
    contents = await file.read()
    text = ""
    try:
        with pdfplumber.open(io.BytesIO(contents)) as pdf:
            for page in pdf.pages:
                extracted = page.extract_text()
                if extracted: text += extracted + "\n"
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error parsing PDF: {str(e)}")
    if not text.strip():
        raise HTTPException(status_code=400, detail="Could not extract text from PDF.")
    return {"text": text}