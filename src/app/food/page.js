'use client';
import { useState, useRef } from 'react';
import styles from './page.module.css';

export default function FoodTracking() {
  const [status, setStatus] = useState('idle'); // idle, processing, done, error
  const [results, setResults] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const fileInputRef = useRef(null);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setStatus('processing');
    
    const formData = new FormData();
    formData.append('receipt', file);

    try {
      const response = await fetch('/api/ocr', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to parse receipt');
      }

      const data = await response.json();
      setResults(data);
      setStatus('done');
    } catch (err) {
      console.warn('OCR Error:', err.message);
      setErrorMsg('Could not process the receipt. Please try another image.');
      setStatus('error');
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Food Delivery Integration</h1>
        <p className={styles.subtitle}>Upload your Swiggy/Zomato screenshot to estimate carbon footprint.</p>
      </header>

      {status === 'idle' || status === 'error' ? (
        <div className={styles.uploadSection} onClick={() => fileInputRef.current.click()}>
          <div className={styles.uploadIcon}>📸</div>
          <div className={styles.uploadText}>Click to upload screenshot</div>
          <div className={styles.uploadSubtext}>Supported formats: JPG, PNG. (Processed via Gemini Vision)</div>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            accept="image/png, image/jpeg" 
            style={{ display: 'none' }} 
          />
          {status === 'error' && (
            <div style={{ color: 'var(--danger-color)', marginTop: '16px' }}>{errorMsg}</div>
          )}
        </div>
      ) : null}

      {status === 'processing' && (
        <div className={styles.processingSection}>
          <div className={styles.loader}></div>
          <h3>Processing Receipt...</h3>
          <p style={{ color: 'var(--text-muted)', marginTop: '8px' }}>
            Analyzing items using Gemini AI... Calculating emissions for packaging, delivery, and food type...
          </p>
        </div>
      )}

      {status === 'done' && results && (
        <div className={styles.resultsSection}>
          <div className={styles.resultsHeader}>
            <h2>Analysis Complete</h2>
            <div className={styles.totalEmission}>Total: {results.total}</div>
          </div>
          
          <div className={styles.itemsList}>
            {results.items.map((item, idx) => (
              <div key={idx} className={styles.itemRow}>
                <div className={styles.itemName}>{item.name}</div>
                <div className={styles.itemBreakdown}>
                  <span title="Packaging Emissions">📦 {item.packaging}</span>
                  <span title="Delivery Distance Emissions">🛵 {item.delivery}</span>
                  <span title="Food Emissions">🥩 {item.food}</span>
                  <span style={{ color: 'var(--danger-color)', fontWeight: 'bold' }}>= {item.total}</span>
                </div>
              </div>
            ))}
          </div>
          
          <button 
            style={{ marginTop: '24px', padding: '12px 24px', background: 'var(--primary-color)', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
            onClick={() => setStatus('idle')}
          >
            Upload Another
          </button>
        </div>
      )}
    </div>
  );
}
