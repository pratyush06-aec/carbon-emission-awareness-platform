'use client';
import { useState, useEffect } from 'react';
import { useSession, signIn } from 'next-auth/react';
import styles from './page.module.css';

const storeItems = [
  { id: 1, name: '2 Extra AC Hours', price: 1200, emoji: '❄️' },
  { id: 2, name: 'Skip Carpool Day', price: 2500, emoji: '🚗' },
  { id: 3, name: 'Fast Food Delivery pass', price: 800, emoji: '🍔' },
  { id: 4, name: 'Carbon Offset Certificate', price: 5000, emoji: '📜' },
];

export default function Rewards() {
  const { data: session, status } = useSession();
  const [balance, setBalance] = useState(0);
  const [ledger, setLedger] = useState([]);
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState('');

  const fetchWallet = async () => {
    const res = await fetch('/api/wallet');
    if (res.ok) {
      const data = await res.json();
      setBalance(data.xpBalance);
      setLedger(data.ledger);
    }
  };

  useEffect(() => {
    if (status === 'authenticated') {
      fetchWallet();
    }
  }, [status]);

  const addToCart = (item) => {
    setCart([...cart, item]);
    showToast(`Added ${item.name} to cart!`);
  };

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.price, 0);

  const checkout = async () => {
    if (cart.length === 0) return;
    setLoading(true);
    
    const res = await fetch('/api/redeem', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: cart })
    });

    if (res.ok) {
      await fetchWallet();
      setCart([]);
      setIsCartOpen(false);
      showToast('Successfully redeemed rewards!');
    } else {
      const err = await res.json();
      alert(`Checkout failed: ${err.error}`);
    }
    setLoading(false);
  };

  if (status === 'loading') return <div>Loading...</div>;

  if (status === 'unauthenticated') {
    return (
      <div className={styles.container} style={{ alignItems: 'center', marginTop: '100px' }}>
        <h2>Sign in to view your Rewards Store!</h2>
        <button onClick={() => signIn('google')} className={`${styles.actionButton} ${styles.primaryButton}`} style={{ marginTop: '16px' }}>
          Sign in with Google
        </button>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {toast && <div className={styles.toast}>{toast}</div>}
      <header className={styles.header}>
        <h1 className={styles.title}>Welcome to the Carbon Rewards Store!</h1>
        <p className={styles.subtitle}>Your sustainable choices built up these credits. Now, let's spend those hard-earned XP.</p>
      </header>

      <section className={styles.walletCard}>
        <div>
          <div className={styles.balanceLabel}>Available Credits</div>
          <div className={styles.balanceAmount}>{balance}</div>
          <p style={{ marginTop: '16px', color: 'var(--text-muted)', fontSize: '14px', maxWidth: '600px' }}>
            Want to earn more credits? New AI Challenges go live daily. Every challenge you answer correctly is a fresh chance to stack your credits.
          </p>
        </div>
        <div className={styles.walletActions}>
          <button className={`${styles.actionButton} ${styles.primaryButton}`} onClick={() => setIsCartOpen(true)}>
            View Cart ({cart.length}) →
          </button>
        </div>
      </section>

      <section>
        <div className={styles.storeGrid}>
          {storeItems.map(item => (
            <div key={item.id} className={styles.itemCard}>
              <div className={styles.itemImage}>{item.emoji}</div>
              <div className={styles.itemDetails}>
                <div className={styles.itemName}>{item.name}</div>
                <div className={styles.itemPrice}>{item.price} credits</div>
                <button className={styles.addToCartBtn} onClick={() => addToCart(item)}>Add to cart</button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.ledgerSection}>
        <div className={styles.ledgerHeader}>
          <h2>Ledger</h2>
        </div>
        <p style={{ color: 'var(--text-muted)', marginBottom: '16px' }}>
          Credits you earn (challenges, verified green travel) or spend on rewards.
        </p>

        <table className={styles.ledgerTable}>
          <thead>
            <tr>
              <th>When</th>
              <th>Activity</th>
              <th>Credits</th>
            </tr>
          </thead>
          <tbody>
            {ledger.map(row => (
              <tr key={row.id}>
                <td>{new Date(row.createdAt).toLocaleString()}</td>
                <td>{row.description}</td>
                <td className={row.amount > 0 ? styles.positiveXP : styles.negativeXP}>
                  {row.amount > 0 ? '+' : ''}{row.amount}
                </td>
              </tr>
            ))}
            {ledger.length === 0 && (
              <tr>
                <td colSpan="3" style={{ textAlign: 'center', padding: '24px' }}>No activity yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </section>

      {/* Slide-out Cart */}
      {isCartOpen && (
        <div className={styles.cartOverlay} onClick={(e) => e.target.className.includes('cartOverlay') && setIsCartOpen(false)}>
          <div className={styles.cartPanel}>
            <div className={styles.cartHeader}>
              <div className={styles.cartTitle}>Your Cart</div>
              <button className={styles.closeBtn} onClick={() => setIsCartOpen(false)}>×</button>
            </div>
            
            <div className={styles.cartItems}>
              {cart.map((item, idx) => (
                <div key={idx} className={styles.cartItem}>
                  <span className={styles.cartItemName}>{item.emoji} {item.name}</span>
                  <span className={styles.cartItemPrice}>{item.price}</span>
                </div>
              ))}
              {cart.length === 0 && <div style={{ color: '#888' }}>Your cart is empty.</div>}
            </div>

            <div className={styles.cartFooter}>
              <div className={styles.cartTotal}>
                <span>Total</span>
                <span className={cartTotal > balance ? styles.negativeXP : ''}>{cartTotal} XP</span>
              </div>
              <button 
                className={styles.checkoutBtn} 
                onClick={checkout} 
                disabled={cart.length === 0 || cartTotal > balance || loading}
              >
                {loading ? 'Processing...' : (cartTotal > balance ? 'Insufficient XP' : 'Checkout & Redeem')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
