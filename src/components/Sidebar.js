'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signIn, signOut } from 'next-auth/react';
import styles from './Sidebar.module.css';

const navItems = [
  { name: 'Dashboard', path: '/', icon: '📊' },
  { name: 'Challenges', path: '/challenges', icon: '⚡' },
  { name: 'Navigation', path: '/navigation', icon: '🗺️' },
  { name: 'Food Tracking', path: '/food', icon: '🍔' },
  { name: 'Home Footprint', path: '/home-energy', icon: '🏠' },
  { name: 'Rewards Store', path: '/rewards', icon: '🎁' },
  { name: 'Live Pulse', path: '/live', icon: '🌍' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [balance, setBalance] = useState(0);

  const fetchBalance = async () => {
    try {
      const res = await fetch('/api/wallet');
      if (res.ok) {
        const data = await res.json();
        setBalance(data.xpBalance);
      }
    } catch (e) {
      console.error(e);
    }
  };

  React.useEffect(() => {
    if (status === 'authenticated') {
      fetchBalance();
    }
  }, [status]);

  React.useEffect(() => {
    const handleWalletUpdate = () => fetchBalance();
    window.addEventListener('walletUpdated', handleWalletUpdate);
    return () => window.removeEventListener('walletUpdated', handleWalletUpdate);
  }, []);

  return (
    <aside className={styles.sidebar}>
      <div className={styles.logoContainer}>
        <div className={styles.logoIcon}></div>
        <div className={styles.logoText}>CarbonSense</div>
      </div>

      <nav className={styles.navLinks} aria-label="Main Sidebar Navigation">
        {navItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Link href={item.path} key={item.name} aria-label={`Navigate to ${item.name}`}>
              <div className={`${styles.navItem} ${isActive ? styles.active : ''}`} aria-current={isActive ? 'page' : undefined}>
                <span className={styles.icon} aria-hidden="true">{item.icon}</span>
                {item.name}
              </div>
            </Link>
          );
        })}
      </nav>

      {status === 'authenticated' ? (
        <div className={styles.walletWidget}>
          <div className={styles.walletHeader}>
            <span>Carbon Wallet</span>
          </div>
          <div className={styles.walletBalance}>
            {balance} <span>XP</span>
          </div>
          <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <span style={{ fontSize: '12px', color: '#888' }}>{session.user?.name}</span>
            <button onClick={() => signOut()} style={{ padding: '8px', background: 'transparent', border: '1px solid #444', color: '#ccc', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>
              Sign Out
            </button>
          </div>
        </div>
      ) : (
        <div className={styles.walletWidget}>
          <div className={styles.walletHeader}>
            <span>Get Started</span>
          </div>
          <p style={{ fontSize: '12px', color: '#aaa', margin: '8px 0' }}>Sign in to track your carbon wallet and redeem rewards.</p>
          <button onClick={() => signIn('google')} style={{ width: '100%', padding: '10px', background: 'var(--primary-color)', border: 'none', color: '#000', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
            Sign In
          </button>
        </div>
      )}
    </aside>
  );
}
