import styles from './page.module.css';
import Heatmap from '@/components/Heatmap';

export default function Home() {
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Digital Twin Dashboard</h1>
          <p className={styles.subtitle}>Welcome back! Here's your carbon impact.</p>
        </div>
      </header>

      <section className={styles.twinSection}>
        <div className={`${styles.twinCard} ${styles.currentTwin}`}>
          <div className={styles.twinHeader}>
            <h2>Current You</h2>
            <span className={styles.badge}>4.2 Tons / yr</span>
          </div>
          <div className={styles.avatar}>🙎‍♂️</div>
          <p className={styles.twinDetail}>Heavy AC Usage, Daily Cab Commute</p>
        </div>
        
        <div className={styles.vsDivider}>VS</div>

        <div className={`${styles.twinCard} ${styles.greenerTwin}`}>
          <div className={styles.twinHeader}>
            <h2>Greener You</h2>
            <span className={`${styles.badge} ${styles.greenBadge}`}>2.8 Tons / yr</span>
          </div>
          <div className={styles.avatar}>🦸‍♂️🍃</div>
          <p className={styles.twinDetail}>Optimized Cooling, Metro Commute</p>
        </div>
      </section>

      <section className={styles.simulations}>
        <h3>AI Simulations (What if?)</h3>
        <div className={styles.simCard}>
          <div className={styles.simInfo}>
            <h4>Replace AC with Energy Efficient Model</h4>
            <p>Current: 1.2 tons/year ➔ Alternative: 0.9 tons/year</p>
          </div>
          <div className={styles.simAction}>
            <span className={styles.savings}>25% Savings</span>
            <button className={styles.simButton}>Simulate</button>
          </div>
        </div>
        
        <div className={styles.simCard}>
          <div className={styles.simInfo}>
            <h4>Work from home 2 days/week</h4>
            <p>Emission reduction: 180 kg/year</p>
          </div>
          <div className={styles.simAction}>
            <span className={styles.savings}>High Impact</span>
            <button className={styles.simButton}>Simulate</button>
          </div>
        </div>
      </section>

      <section>
        <Heatmap />
      </section>
    </div>
  );
}
