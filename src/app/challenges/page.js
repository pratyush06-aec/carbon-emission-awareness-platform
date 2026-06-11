'use client';
import { useState } from 'react';
import styles from './page.module.css';

export default function Challenges() {
  const [chatStep, setChatStep] = useState(0);
  const [inputValue, setInputValue] = useState('');
  const [showChallenge, setShowChallenge] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);

  const handleSend = () => {
    if (!inputValue.trim()) return;
    setInputValue('');
    setChatStep(1);
    
    // Simulate AI parsing and triggering challenge mode
    setTimeout(() => {
      setShowChallenge(true);
    }, 1500);
  };

  const handleOptionClick = async (idx) => {
    if (selectedOption !== null) return;
    setSelectedOption(idx);

    if (idx === 2) {
      // Award 20 XP
      try {
        await fetch('/api/challenges/reward', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ xpAmount: 20, challengeName: 'Daily Transport Challenge' })
        });
        // Dispatch an event so the sidebar knows to refresh the wallet
        window.dispatchEvent(new Event('walletUpdated'));
      } catch (err) {
        console.error('Failed to reward XP:', err);
      }
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Daily Check-in</h1>
        <p className={styles.subtitle}>Log your activities to unlock challenges and earn XP.</p>
      </header>

      <section className={styles.chatInterface}>
        <div className={styles.chatHistory}>
          <div className={`${styles.message} ${styles.aiMessage}`}>
            Hey! The day is almost over. What did you do today?
          </div>
          {chatStep >= 1 && (
            <div className={`${styles.message} ${styles.userMessage}`}>
              Took cab to office, used AC 8 hours, ordered food online.
            </div>
          )}
          {showChallenge && (
            <div className={`${styles.message} ${styles.aiMessage}`}>
              Got it. I've converted that into activities. Entering Challenge Mode! 🎮
            </div>
          )}
        </div>
        
        <div className={styles.chatInputArea}>
          <input 
            type="text" 
            className={styles.inputField} 
            placeholder="Type your activities..." 
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            disabled={chatStep > 0}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          />
          <button className={styles.sendButton} onClick={handleSend} disabled={chatStep > 0}>
            Send
          </button>
        </div>
      </section>

      {showChallenge && (
        <section className={styles.challengeMode}>
          <div className={styles.challengeHeader}>
            <h2>⚡ Challenge Mode</h2>
            <span>Question 1/3</span>
          </div>
          
          <div className={styles.question}>
            You travelled 4 km by cab. What alternative could have significantly reduced your emissions?
          </div>
          
          <div className={styles.optionsGrid}>
            {[
              { text: 'A. Metro', isCorrect: false },
              { text: 'B. Walk', isCorrect: false },
              { text: 'C. Bicycle', isCorrect: true }
            ].map((opt, idx) => {
              let optClass = styles.optionBtn;
              if (selectedOption !== null) {
                if (idx === selectedOption) {
                  optClass = opt.isCorrect ? `${styles.optionBtn} ${styles.correctOption}` : `${styles.optionBtn} ${styles.wrongOption}`;
                } else if (opt.isCorrect) {
                  optClass = `${styles.optionBtn} ${styles.correctOption}`;
                }
              }

              return (
                <button 
                  key={idx} 
                  className={optClass}
                  onClick={() => handleOptionClick(idx)}
                >
                  {opt.text}
                </button>
              );
            })}
          </div>

          {selectedOption !== null && (
            <div className={styles.feedback}>
              <span className={styles.feedbackText}>
                {selectedOption === 2 ? 'Correct Answer: Bicycle' : 'Incorrect. The correct answer was Bicycle.'}
              </span>
              {selectedOption === 2 && <span className={styles.xpAward}>+20 XP Awarded!</span>}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
