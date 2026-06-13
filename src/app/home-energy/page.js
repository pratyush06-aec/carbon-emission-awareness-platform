'use client';
import { useState, useEffect } from 'react';
import styles from './page.module.css';

export default function HomeEnergy() {
  const [phase, setPhase] = useState('intro'); // intro | running | entering | chat | loading | results
  const [inputValue, setInputValue] = useState('');
  const [userInput, setUserInput] = useState('');
  const [applianceData, setApplianceData] = useState(null);

  // Handle character tap
  const handleCharacterTap = () => {
    if (phase !== 'intro') return;
    setPhase('running');
  };

  // Running animation complete → entering phase
  useEffect(() => {
    if (phase === 'running') {
      const timer = setTimeout(() => setPhase('entering'), 5000);
      return () => clearTimeout(timer);
    }
  }, [phase]);

  // Entering animation complete → chat phase
  useEffect(() => {
    if (phase === 'entering') {
      const timer = setTimeout(() => setPhase('chat'), 1500);
      return () => clearTimeout(timer);
    }
  }, [phase]);

  const skipAnimation = () => {
    setPhase('chat');
  };

  const handleSend = async () => {
    if (!inputValue.trim()) return;
    const text = inputValue.trim();
    setUserInput(text);
    setInputValue('');
    setPhase('loading');

    try {
      const res = await fetch('/api/home-energy/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appliances: text })
      });

      if (!res.ok) throw new Error('Failed to analyze');

      const data = await res.json();
      setApplianceData(data);
      setPhase('results');
    } catch (err) {
      console.warn('Analyze error:', err.message);
      alert('Could not analyze appliances. Please try again.');
      setPhase('chat');
    }
  };

  const handleRestart = () => {
    setPhase('intro');
    setInputValue('');
    setUserInput('');
    setApplianceData(null);
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'low': return '#2ea043';
      case 'medium': return '#e3b341';
      case 'high': return '#f85149';
      default: return '#888';
    }
  };

  return (
    <div className={styles.container}>

      {/* ============ INTRO PHASE ============ */}
      {phase === 'intro' && (
        <div className={styles.introScene}>
          <div className={styles.introBoard}>
            <h1 className={styles.introTitle}>Visualize Your Carbon Footprint at Home</h1>
            <p className={styles.introSubtitle}>Tap the character below to begin your journey home</p>
          </div>

          <div className={styles.groundLine}></div>

          <div className={styles.characterIdle} onClick={handleCharacterTap}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/assets/character-idle.png"
              alt="Character"
              width={160}
              height={220}
              className={styles.idleImage}
            />
            <div className={styles.tapHint}>Tap me! 👆</div>
          </div>
        </div>
      )}

      {/* ============ RUNNING PHASE ============ */}
      {(phase === 'running') && (
        <div className={styles.runningScene}>
          <button className={styles.skipBtn} onClick={skipAnimation}>
            Skip Animation →
          </button>

          <div className={styles.sceneryScroll}>
            <div className={styles.houseTarget}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/assets/house-exterior.png"
                alt="House"
                width={300}
                height={250}
                className={styles.houseImage}
              />
            </div>
          </div>

          <div className={styles.groundLine}></div>

          <div className={styles.characterRunning}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/assets/character-running.png"
              alt="Running"
              width={140}
              height={200}
              className={styles.runImage}
            />
          </div>
        </div>
      )}

      {/* ============ ENTERING PHASE ============ */}
      {phase === 'entering' && (
        <div className={styles.enteringScene}>
          <div className={styles.exteriorFade}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/assets/house-exterior.png"
              alt="House exterior"
              className={styles.exteriorImage}
            />
          </div>
          <div className={styles.interiorReveal}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/assets/house-interior.png"
              alt="House interior"
              className={styles.interiorImage}
            />
          </div>
        </div>
      )}

      {/* ============ CHAT PHASE ============ */}
      {(phase === 'chat' || phase === 'loading') && (
        <div className={styles.chatPhase}>
          <div className={styles.interiorBg}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/assets/house-interior.png"
              alt="Interior"
              className={styles.bgImage}
            />
            <div className={styles.bgOverlay}></div>
          </div>

          <div className={styles.chatContainer}>
            <section className={styles.chatInterface}>
              <div className={styles.chatHistory}>
                <div className={`${styles.message} ${styles.aiMessage}`}>
                  🏠 Welcome home! I&apos;m your Home Energy Assistant. Tell me about the modern appliances you have in your house, and I&apos;ll analyze their carbon footprint.
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
                    Analyzing your appliances...
                  </div>
                )}
              </div>

              <div className={styles.chatInputArea}>
                <input
                  type="text"
                  className={styles.inputField}
                  placeholder="e.g. Old fridge, 3 ACs, washing machine, 2 TVs, water heater..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  disabled={phase === 'loading'}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                />
                <button className={styles.sendButton} onClick={handleSend} disabled={phase === 'loading'}>
                  Send
                </button>
              </div>
            </section>

            {phase === 'loading' && (
              <div className={styles.loadingCard}>
                <div className={styles.spinner}></div>
                <p>Gemini is analyzing your home appliances...</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============ RESULTS PHASE ============ */}
      {phase === 'results' && applianceData && (
        <div className={styles.resultsPhase}>
          <header className={styles.resultsHeader}>
            <h1 className={styles.resultsTitle}>🏠 Your Home Carbon Footprint</h1>
            <div className={styles.totalFootprint}>
              <span className={styles.totalLabel}>Total Yearly Emissions</span>
              <span className={styles.totalValue}>{applianceData.totalFootprint}</span>
            </div>
          </header>

          <div className={styles.applianceGrid}>
            {applianceData.appliances.map((item, idx) => (
              <div
                key={idx}
                className={styles.applianceCard}
                style={{ borderTopColor: getSeverityColor(item.severity) }}
              >
                <div className={styles.cardEmoji}>{item.emoji}</div>
                <h3 className={styles.cardName}>{item.name}</h3>
                <div className={styles.cardMetrics}>
                  <div className={styles.metric}>
                    <span className={styles.metricValue}>{item.yearlyCO2}</span>
                    <span className={styles.metricLabel}>kg CO₂/yr</span>
                  </div>
                  <div className={styles.metric}>
                    <span className={styles.ratingBadge} style={{ background: getSeverityColor(item.severity) }}>
                      {item.rating}
                    </span>
                    <span className={styles.metricLabel}>Rating</span>
                  </div>
                </div>
                <div className={styles.severityBar}>
                  <div
                    className={styles.severityFill}
                    style={{
                      width: `${Math.min((item.yearlyCO2 / 800) * 100, 100)}%`,
                      background: getSeverityColor(item.severity)
                    }}
                  ></div>
                </div>
                <p className={styles.cardTip}>💡 {item.tip}</p>
              </div>
            ))}
          </div>

          <button className={styles.restartBtn} onClick={handleRestart}>
            ← Start Over
          </button>
        </div>
      )}
    </div>
  );
}
