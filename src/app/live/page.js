'use client';

import { useState, useEffect } from 'react';
import styles from './page.module.css';

export default function LivePulse() {
  const [city, setCity] = useState('Kolkata');
  const [searchInput, setSearchInput] = useState('');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchPulseData = async (targetCity) => {
    setLoading(true);
    try {
      const res = await fetch('/api/live-pulse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ city: targetCity })
      });
      if (res.ok) {
        const json = await res.json();
        setData(json);
      } else {
        const errObj = await res.json().catch(() => ({}));
        console.error("Failed to fetch live pulse data:", errObj.details || "Unknown error");
        setData(null);
      }
    } catch (err) {
      console.error("Network or parsing error:", err);
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPulseData(city);
  }, [city]);

  const handleSearch = () => {
    if (searchInput.trim()) {
      setCity(searchInput.trim());
      setSearchInput('');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.titleWrapper}>
          <h1 className={styles.title}>Live Pulse</h1>
          <div className={styles.liveIndicator}>
            <div className={styles.pulseDot}></div>
            Live
          </div>
        </div>

        <div className={styles.citySearch}>
          <input 
            type="text" 
            placeholder="Search city (e.g. London, Tokyo)"
            className={styles.cityInput}
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={loading}
          />
          <button className={styles.searchBtn} onClick={handleSearch} disabled={loading}>
            Update
          </button>
        </div>
      </header>

      {loading ? (
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
          <p>Fetching real-time environmental data for {city}...</p>
        </div>
      ) : data ? (
        <>
          {/* Section 1: Global Carbon Pulse */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>
              📍 Global Carbon Pulse: {city}
            </h2>
            <div className={styles.metricsGrid}>
              <div className={styles.metricCard}>
                <div className={styles.metricInfo}>
                  <span className={styles.metricLabel}>Current Air Quality</span>
                  <span className={styles.metricValue}>{data.cityMetrics?.airQuality || 'Moderate'}</span>
                </div>
                <div className={styles.metricIcon}>🌫️</div>
              </div>

              <div className={styles.metricCard}>
                <div className={styles.metricInfo}>
                  <span className={styles.metricLabel}>Current City Emissions</span>
                  <span className={styles.metricValue}>{data.cityMetrics?.cityEmissions || 'N/A'}</span>
                </div>
                <div className={styles.metricIcon}>🏭</div>
              </div>

              <div className={styles.metricCard}>
                <div className={styles.metricInfo}>
                  <span className={styles.metricLabel}>Renewable Energy Usage</span>
                  <span className={styles.metricValue}>{data.cityMetrics?.renewableEnergy || 'N/A'}</span>
                </div>
                <div className={styles.metricIcon}>☀️</div>
              </div>

              <div className={styles.metricCard}>
                <div className={styles.metricInfo}>
                  <span className={styles.metricLabel}>Public Transport Usage</span>
                  <span className={styles.metricValue}>{data.cityMetrics?.publicTransport || 'N/A'}</span>
                </div>
                <div className={styles.metricIcon}>🚌</div>
              </div>
            </div>
          </section>

          {/* Section 2: Live Carbon Events */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>🌍 Live Carbon Events</h2>
            <div className={styles.measuresList}>
              {data.globalMeasures?.map((measure, idx) => (
                <div key={idx} className={styles.measureItem}>
                  <div className={styles.measureMain}>
                    <div className={styles.measureTitle}>{measure.title}</div>
                    <div className={styles.measureMeta}>
                      <span>📍 {measure.location}</span>
                      <span>🕒 {measure.time}</span>
                    </div>
                  </div>
                  <div className={styles.measureImpact}>
                    {measure.impact}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Section 3: Community Missions */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>🤝 Community Missions</h2>
            <div className={styles.missionsList}>
              {data.communityMissions?.map((mission, idx) => {
                const progressPercent = Math.min((mission.progress / mission.target) * 100, 100);
                return (
                  <div key={idx} className={styles.missionCard}>
                    <div className={styles.missionHeader}>
                      <div>
                        <h3 className={styles.missionTitle}>{mission.title}</h3>
                        <p className={styles.missionDesc}>Goal: {mission.goalDesc}</p>
                      </div>
                      <div className={styles.missionParticipants}>
                        👥 {mission.participants}
                      </div>
                    </div>
                    <div className={styles.missionProgress}>
                      <div className={styles.progressStats}>
                        <span className={styles.progressCurrent}>{mission.progress} kg CO₂</span>
                        <span className={styles.progressTarget}>{mission.target} kg CO₂</span>
                      </div>
                      <div className={styles.progressBar}>
                        <div 
                          className={styles.progressFill} 
                          style={{ width: `${progressPercent}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </>
      ) : (
        <div className={styles.loadingContainer}>
          <p>Error loading data. Please try again.</p>
        </div>
      )}
    </div>
  );
}
