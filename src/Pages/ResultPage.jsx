import React, { useState, useEffect } from "react";
import { Link, useParams, useLocation } from "react-router-dom";
// import Navbar from "../Components/NavBar";
import "../CSS/ResultPage.css";
const URL = import.meta.env.VITE_BASE_URL;

const ResultsPage = ({ userStats, user }) => {
  const { countryId, caseFileId } = useParams();
  const location = useLocation(); // Access the current location object
  const [currentStats, setCurrentStats] = useState(userStats); 
  const [hasUpdated, setHasUpdated] = useState(false); 

  // EXTRACT SCORE AND TOTALQUESTIONS
  const score = location.state?.score || 0; // Get score from the location state, default to 0
  const totalQuestions = location.state?.totalQuestions || 0; // Get totalQuestions from the location state, default to 0

  useEffect(() => {
    if (userStats) {
      setCurrentStats(userStats); 
    }
  }, [userStats]);

  const calculateXPEarned = () => {
    return score * 25; 
  };

  const updatePlayerStats = async (updatedStats) => {
    try {
      const response = await fetch(`${URL}/api/stats/${user.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.accessToken}`, 
        },
        body: JSON.stringify(updatedStats),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to update player stats: ${errorText}`);
      }

      const data = await response.json();
      console.log("Updated stats:", data);
    } catch (error) {
      console.error("Error updating player stats:", error);
    }
  };

  useEffect(() => {
    if (currentStats && !hasUpdated && score > 0) {
      const xpEarned = calculateXPEarned();

      const newCurrentStats = {
        ...currentStats,
        xp: currentStats.xp + xpEarned,
        games_played: currentStats.games_played + 1,
        questions_correct: currentStats.questions_correct + score,
        questions_wrong: currentStats.questions_wrong + (totalQuestions - score),
      };
      setCurrentStats(newCurrentStats);

      const smallIncrement = {
        xp: xpEarned,
        games_played: 1,
        questions_correct: score,
        questions_wrong: totalQuestions - score,
      };
      updatePlayerStats(smallIncrement);
      setHasUpdated(true);
    }
  }, [currentStats, score, totalQuestions, hasUpdated]);

  if (!currentStats) {
    return <p>Loading player stats...</p>;
  }

  return (
    <div className="ResultsPage">
      <h2>Case {caseFileId}</h2>
      <div className="findings-border">
        <p>
          Findings: {score} / {totalQuestions}
        </p>
        <p>XP Earned: {calculateXPEarned()}</p>
        <h3>Questions Summary:</h3>
        <div className="result-buttons">
          <Link
            to={`/countries/${countryId}/case_files/${caseFileId}/questions`}
            className="retry-link"
            state={{ refresh: true }} // Pass refresh state to retry link
          >
            <button className="retry-button">Retry Quiz</button>
          </Link>
          <Link to="/countries">
            <button>Start New Game</button>
          </Link>
        </div>
      </div>
      <div className="player-stats">
        <h2>Progress Report</h2>
        <h3>Rank: Junior Detective</h3>
        <p>XP: {currentStats.xp}</p>
        <p>Games Played: {currentStats.games_played}</p>
        <p>Questions Correct: {currentStats.questions_correct}</p>
        <p>Questions Wrong: {currentStats.questions_wrong}</p>
      </div>
      {/* <Navbar /> */}
    </div>
  );
};

export default ResultsPage;

