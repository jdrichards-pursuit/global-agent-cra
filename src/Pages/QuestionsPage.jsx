import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
// import Navbar from "../Components/NavBar";
import shuffleAnswers from "../helpers/shuffleAnswers"; // Import the shuffleAnswers function
import calculateAge from "../helpers/calculateAge"; // Import the calculateAge function
import "../CSS/QuestionsPage.css";
const URL = import.meta.env.VITE_BASE_URL;

const QuestionsPage = ({ user }) => {
  const { countryId, caseFileId } = useParams();
  const navigate = useNavigate();
  const location = useLocation(); // Access the current location object

  const [questions, setQuestions] = useState([]); // State to store questions
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0); // State to track current question index
  const [score, setScore] = useState(0); // State to track score
  const [selectedAnswer, setSelectedAnswer] = useState(""); // State to track selected answer

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const age = calculateAge(user.dob); // Calculate user's age
        const personAge = age >= 18 ? `older_questions` : `younger_questions`; // Determine question set based on age
        const response = await fetch(`${URL}/api/${personAge}/${caseFileId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch questions");
        }
        const data = await response.json();
        // Shuffle answers for each question
        const shuffledQuestions = data.map((question) => ({
          ...question,
          answers: shuffleAnswers([
            question.y_correct_answer || question.o_correct_answer,
            question.y_incorrect_answer1 || question.o_incorrect_answer1,
            question.y_incorrect_answer2 || question.o_incorrect_answer2,
            question.y_incorrect_answer3 || question.o_incorrect_answer3,
          ]),
        }));
        setQuestions(shuffledQuestions); // Set shuffled questions
        setCurrentQuestionIndex(0); // Reset current question index
        setScore(0); // Reset score
      } catch (error) {
        console.error("Error fetching questions:", error); // Log any errors
      }
    };

    fetchQuestions();
  }, [caseFileId, user.dob, location.state?.refresh]); // Run this effect whenever dependencies change

  const handleSubmit = (event) => {
    event.preventDefault();
    const currentQuestion = questions[currentQuestionIndex]; // Get the current question
    const isCorrect =
      selectedAnswer ===
      (currentQuestion.y_correct_answer || currentQuestion.o_correct_answer); // Check if the selected answer is correct

    if (isCorrect) {
      setScore((prevScore) => prevScore + 1); // Increment score if the answer is correct
    }

    if (currentQuestionIndex === questions.length - 1) {
      // Navigate to results page with final score
      const finalScore = isCorrect ? score + 1 : score;
      navigate(
        `/countries/${countryId}/case_files/${caseFileId}/questions/results`,
        {
          state: { score: finalScore, totalQuestions: questions.length }, // Pass final score and total questions to results page
        }
      );
    } else {
      setCurrentQuestionIndex((prevIndex) => prevIndex + 1); // Move to the next question
      setSelectedAnswer(""); // Reset selected answer
    }
  };

  const calculateProgress = () => {
    return ((currentQuestionIndex + 1) / questions.length) * 100; // Calculate progress percentage
  };

  if (questions.length === 0) {
    return <div>Loading...</div>; // Display loading message if questions are not loaded
  }

  const currentQuestion = questions[currentQuestionIndex]; // Get the current question

  return (
    <div> 
      <div className="QuestionsPage">
        <div className="progress-bar">
          <div
            className="progress"
            style={{ width: `${calculateProgress()}%` }}
          ></div>{" "}
          {/* Display progress bar */}
        </div>
        <h2>{currentQuestion.y_question || currentQuestion.o_question}</h2>
        <form onSubmit={handleSubmit}>
          {currentQuestion.answers.map((answer, index) => (
            <label
              key={index}
              className={`answer-label ${
                selectedAnswer === answer ? "selected" : ""
              }`}
            >
              <input
                type="radio"
                name="answer"
                value={answer}
                checked={selectedAnswer === answer}
                onChange={(e) => setSelectedAnswer(e.target.value)} // Update selected answer
              />
              {answer}
            </label>
          ))}
          <button type="submit" disabled={!selectedAnswer}>
            Submit
          </button>{" "}
          {/* Disable submit button if no answer is selected */}
        </form>
      </div>
    </div>
  );
};

export default QuestionsPage;
