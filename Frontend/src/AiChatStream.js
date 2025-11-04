import React, { useState } from "react";
import { jsPDF } from "jspdf"; // ✅ Import jsPDF
import baseUrl from "./conf/conf"; // ✅ Keep if needed later for API calls
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const AiChatStream = () => {
  
  const MySwal = withReactContent(Swal);
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [count, setCount] = useState(5);

const handleGenerate = async () => {
  if (!prompt.trim() || count <= 0) {
    alert("Please enter a topic and a valid number of questions!");
    return;
  }
  setQuestions([]);
  setLoading(true);
  try {
    const params = new URLSearchParams({ topics: prompt, noOfQuestion: count });
    const url = `${baseUrl}/ai/generateByTopic?${params.toString()}`;

    const response = await fetch(url, { method: "GET" });
    if (!response.ok) throw new Error("Failed to fetch questions");

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      // Optional: log chunk progress
      // console.log("Received chunk:", buffer.length);

      // Check if complete JSON arrived (ends with ']')
      if (buffer.trim().endsWith("]")) {
        try {
          const parsed = JSON.parse(buffer.trim());
          setQuestions(parsed);
          console.log("✅ Parsed full question list:", parsed.length);
        } catch (e) {
          MySwal.fire('Error!', "❌ Failed to parse full JSON:", 'error');
        }
      }
    }
  } catch (err) {
    if (err.message.includes("429")) {
   
    MySwal.fire('Error!', "Server busy — too many requests. Please wait a few seconds.", 'error');
  }else{
   
    
    MySwal.fire('Error!', "Error fetching questions", 'error');
}
  } finally {
    setLoading(false);
  }
};




  // ✅ Edit Question
  const handleQuestionChange = (qIndex, field, value) => {
    const updated = [...questions];
    updated[qIndex][field] = value;
    setQuestions(updated);
  };

  // ✅ Edit Option
  const handleOptionChange = (qIndex, optIndex, value) => {
    const updated = [...questions];
    updated[qIndex].options[optIndex] = value;
    setQuestions(updated);
  };

  // ✅ Delete Question
  const handleDeleteQuestion = (qIndex) => {
    setQuestions(questions.filter((_, i) => i !== qIndex));
  };

  // ✅ Increase / Decrease Count
  const increaseCount = () => setCount((prev) => Number(prev) + 1);
  const decreaseCount = () => setCount((prev) => (prev > 1 ? Number(prev) - 1 : 1));

  // ✅ Download as PDF
 const downloadPDF = () => {
  const doc = new jsPDF();
  let y = 10;

  // ===============================
  // 1️⃣ Add Questions (no answers)
  // ===============================
  doc.setFontSize(14);
  doc.text("Quiz Questions", 10, y);
  y += 10;

  questions.forEach((q, i) => {
    doc.setFontSize(12);
    doc.text(`${i + 1}. ${q.questionText}`, 10, y);
    y += 8;

    q.options.forEach((opt, j) => {
      const optionLabel = String.fromCharCode(65 + j); // A, B, C, D
      doc.text(`   ${optionLabel}) ${opt}`, 14, y);
      y += 6;
    });

    y += 8;

    // New page if overflow
    if (y > 270) {
      doc.addPage();
      y = 10;
    }
  });

  // ===============================
  // 2️⃣ Add Answer Key (new page)
  // ===============================
  doc.addPage();
  y = 20;

  doc.setFontSize(14);
  doc.text("Answer Key", 10, y);
  y += 10;

  doc.setFontSize(12);
  questions.forEach((q, i) => {
    doc.text(`${i + 1}. ${q.answer}`, 10, y);
    y += 8;

    if (y > 270) {
      doc.addPage();
      y = 20;
    }
  });

  // ===============================
  // 3️⃣ Save file
  // ===============================
  doc.save("Quiz.pdf");
};


  return (
    <div className="chat-container no-scroll">
      
      <header className="chat-header">
        <h1>🤖 AI Quiz Generator</h1>
        <p><b>Generate • Customize • Download</b></p>
      </header>

      <div className="center-section">
        {loading && (
  <div className="loader">
     Generating quizz questions...
  </div>
)}

        {!loading && questions.length === 0 &&  (
          <div className="placeholder">
            ✨ Enter a topic and click send to generate your quiz! ✨
          </div>
        )}
        {questions.length > 0 && (
        <div className="questions-list">
      {questions.map((q, index) => (
  <div key={index} className="question-card">
    <div className="question-header">
      <h3 className="question-number">Q{index + 1}</h3>
      <button
        onClick={() => handleDeleteQuestion(index)}
        className="delete-btn"
        title="Delete Question"
      >
        <i className="fa-solid fa-trash"></i>
      </button>
    </div>

    <textarea
      value={q.questionText}
      onChange={(e) =>
        handleQuestionChange(index, "questionText", e.target.value)
      }
      className="question-text"
      placeholder="Enter your question..."
    />

    <div className="options-container">
      {q.options.map((opt, optIndex) => (
        <div key={optIndex} className="option-item">
          <span className="option-label">
            {String.fromCharCode(65 + optIndex)}.
          </span>
          <input
            type="text"
            value={opt}
            onChange={(e) =>
              handleOptionChange(index, optIndex, e.target.value)
            }
            className="option-input"
            placeholder={`Option ${String.fromCharCode(65 + optIndex)}`}
          />
        </div>
      ))}
    </div>

    <div className="answer-select">
      <label>✅ Correct Answer:</label>
      <select
        value={q.answer}
        onChange={(e) =>
          handleQuestionChange(index, "answer", e.target.value)
        }
      >
        {q.options.map((opt, i) => (
          <option key={i} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  </div>
))}
  <button onClick={downloadPDF} className="pdf-btn">
          📥 Download as PDF
        </button></div>)}


        {/* ✅ Footer controls */}
        <div className="chat-footer">
          <input
            type="text"
            className="inp"
            placeholder="Enter topic..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            disabled={loading}
          />

          <div className="incdec-container">
            <button
              className="count-btn"
              title="Increase Question Count"
              onClick={increaseCount}
            >
              <i className="fa-solid fa-caret-up"></i>
            </button>
            <button
              className="count-btn"
              title="Decrease Question Count"
              onClick={decreaseCount}
            >
              <i className="fa-solid fa-caret-down"></i>
            </button>
          </div>

          <input
            type="number"
            title="Number of Questions"
            value={count}
            className="count-input"
            onWheel={(e) => e.target.blur()}
            onChange={(e) => setCount(e.target.value)}
            min="1"
          />

          <button
            onClick={handleGenerate}
            disabled={loading}
            className="send-btn"
            title="Generate"
          >
            {loading ? (
              <i className="fa-solid fa-spinner fa-spin"></i>
            ) : (
              <i className="fa-solid fa-paper-plane"></i>
            )}
          </button>
        </div>

      
      </div>
    </div>
  );
};

export default AiChatStream;
