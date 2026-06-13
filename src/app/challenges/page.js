'use client';
import { useState } from 'react';
import styles from './page.module.css';

export default function Challenges() {
  const [inputValue, setInputValue] = useState('');
  const [userInput, setUserInput] = useState('');
  const [phase, setPhase] = useState('chat'); // chat | loading | quiz | summary
  const [questions, setQuestions] = useState([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [score, setScore] = useState(0);
  const [totalXP, setTotalXP] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);

  const handleSend = async () => {
    if (!inputValue.trim()) return;
    const text = inputValue.trim();
    setUserInput(text);
    setInputValue('');
    setPhase('loading');

    try {
      const res = await fetch('/api/challenges/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ activities: text })
      });

      if (!res.ok) throw new Error('Failed to generate');

      const data = await res.json();
      setQuestions(data.questions);
      setPhase('quiz');
    } catch (err) {
      console.warn('Generate error:', err.message);
      alert('Could not generate challenges. Please try again.');
      setPhase('chat');
      setUserInput('');
    }
  };

  const handleOptionClick = async (idx) => {
    if (showFeedback) return;
    setSelectedOption(idx);
    setShowFeedback(true);

    const q = questions[currentQ];
    if (idx === q.correctIndex) {
      setScore(s => s + 1);
      setTotalXP(xp => xp + (q.xp || 20));

      // Award XP via backend
      try {
        await fetch('/api/challenges/reward', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            xpAmount: q.xp || 20,
            challengeName: `Challenge: ${q.question.substring(0, 50)}...`
          })
        });
        window.dispatchEvent(new Event('walletUpdated'));
      } catch (err) {
        console.warn('Reward error:', err.message);
      }
    }
  };

  const handleNext = () => {
    if (currentQ + 1 >= questions.length) {
      setPhase('summary');
    } else {
      setCurrentQ(currentQ + 1);
      setSelectedOption(null);
      setShowFeedback(false);
    }
  };

  const handleRestart = () => {
    setPhase('chat');
    setUserInput('');
    setQuestions([]);
    setCurrentQ(0);
    setSelectedOption(null);
    setShowFeedback(false);
    setScore(0);
    setTotalXP(0);
  };

  const q = questions[currentQ];

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Daily Check-in</h1>
        <p className={styles.subtitle}>Log your activities to unlock challenges and earn XP.</p>
      </header>

      {/* Chat Interface */}
      <section className={styles.chatInterface}>
        <div className={styles.chatHistory}>
          <div className={`${styles.message} ${styles.aiMessage}`}>
            Hey! The day is almost over. What did you do today?
          </div>
          {userInput && (
            <div className={`${styles.message} ${styles.userMessage}`}>
              {userInput}
            </div>
          )}
          {phase === 'loading' && (
            <div className={`${styles.message} ${styles.aiMessage}`}>
              <div className={styles.typingIndicator}>
                <span></span><span></span><span></span>
              </div>
              Analyzing your activities and generating challenges...
            </div>
          )}
          {(phase === 'quiz' || phase === 'summary') && (
            <div className={`${styles.message} ${styles.aiMessage}`}>
              Got it! I've created {questions.length} personalized challenges based on your day. Let's go! 🎮
            </div>
          )}
        </div>

        <div className={styles.chatInputArea}>
          <input
            type="text"
            className={styles.inputField}
            placeholder="e.g. I ate meat 3 times, drove to office, used AC 6 hours..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            disabled={phase !== 'chat'}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          />
          <button className={styles.sendButton} onClick={handleSend} disabled={phase !== 'chat'}>
            Send
          </button>
        </div>
      </section>

      {/* Loading State */}
      {phase === 'loading' && (
        <section className={styles.loadingCard}>
          <div className={styles.spinner}></div>
          <p>Gemini is crafting your personalized challenges...</p>
        </section>
      )}

      {/* Quiz Phase */}
      {phase === 'quiz' && q && (
        <section className={styles.challengeMode}>
          {/* Progress Bar */}
          <div className={styles.progressBar}>
            <div
              className={styles.progressFill}
              style={{ width: `${((currentQ + 1) / questions.length) * 100}%` }}
            ></div>
          </div>

          <div className={styles.challengeHeader}>
            <h2>⚡ Challenge Mode</h2>
            <span>Question {currentQ + 1}/{questions.length}</span>
          </div>

          <div className={styles.question}>{q.question}</div>

          <div className={styles.optionsGrid}>
            {q.options.map((opt, idx) => {
              let optClass = styles.optionBtn;
              if (showFeedback) {
                if (idx === q.correctIndex) {
                  optClass = `${styles.optionBtn} ${styles.correctOption}`;
                } else if (idx === selectedOption && idx !== q.correctIndex) {
                  optClass = `${styles.optionBtn} ${styles.wrongOption}`;
                }
              }
              return (
                <button
                  key={idx}
                  className={optClass}
                  onClick={() => handleOptionClick(idx)}
                >
                  {opt}
                </button>
              );
            })}
          </div>

          {showFeedback && (
            <div className={selectedOption === q.correctIndex ? styles.feedback : styles.feedbackWrong}>
              <div>
                <span className={styles.feedbackText}>
                  {selectedOption === q.correctIndex ? '✅ Correct!' : '❌ Incorrect.'}
                </span>
                <p className={styles.explanationText}>{q.explanation}</p>
              </div>
              <div className={styles.feedbackRight}>
                {selectedOption === q.correctIndex && (
                  <span className={styles.xpAward}>+{q.xp || 20} XP</span>
                )}
                <button className={styles.nextBtn} onClick={handleNext}>
                  {currentQ + 1 >= questions.length ? 'View Results' : 'Next Question →'}
                </button>
              </div>
            </div>
          )}
        </section>
      )}

      {/* Summary Phase */}
      {phase === 'summary' && (
        <section className={styles.summaryCard}>
          <div className={styles.summaryEmoji}>
            {score === questions.length ? '🏆' : score >= questions.length / 2 ? '🌟' : '💪'}
          </div>
          <h2 className={styles.summaryTitle}>Challenge Complete!</h2>
          <div className={styles.summaryStats}>
            <div className={styles.statItem}>
              <span className={styles.statValue}>{score}/{questions.length}</span>
              <span className={styles.statLabel}>Correct</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statValue}>+{totalXP}</span>
              <span className={styles.statLabel}>XP Earned</span>
            </div>
          </div>
          <p className={styles.summaryMessage}>
            {score === questions.length
              ? 'Perfect score! You\'re a true carbon awareness champion!'
              : score >= questions.length / 2
              ? 'Great job! Keep learning and you\'ll master this.'
              : 'Every question is a chance to learn. Try again tomorrow!'}
          </p>
          <button className={styles.restartBtn} onClick={handleRestart}>
            Start New Check-in
          </button>
        </section>
      )}
    </div>
  );
}
