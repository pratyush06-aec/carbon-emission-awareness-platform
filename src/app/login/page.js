'use client';

import { useEffect, useRef } from 'react';
import { signIn } from 'next-auth/react';
import styles from './page.module.css';

export default function Login() {
  const containerRef = useRef(null);

  const cardRef = useRef(null);
  const isHoveringRef = useRef(false);

  // Modern Lerp-based animation loop for the magnetic card effect
  useEffect(() => {
    const container = containerRef.current;
    const card = cardRef.current;
    if (!container || !card) return;

    let rafId;
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;
    
    // For the glowing background
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;

    const handleMouseMove = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      if (!isHoveringRef.current) {
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;
        
        // Calculate how far the mouse is from the center
        // A multiplier of 1 would mean it exactly tracks the mouse.
        // 0.8 means it stays slightly bounded
        targetX = (e.clientX - centerX) * 0.8;
        targetY = (e.clientY - centerY) * 0.8;
      }
      // If isHoveringRef is true, we freeze targetX and targetY 
      // so the card stops running away and the user can click it!
    };

    window.addEventListener('mousemove', handleMouseMove);

    const renderLoop = () => {
      // Lerp (Linear Interpolation) for buttery smooth trailing physics
      // 0.05 is the "spring" factor. Lower = slower trailing effect.
      currentX += (targetX - currentX) * 0.05;
      currentY += (targetY - currentY) * 0.05;

      // 3D Tilt calculation based on current lerped position
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      const rotateY = (currentX / centerX) * 15; 
      const rotateX = -(currentY / centerY) * 15;

      // Apply the transformation directly to the card DOM node
      card.style.transform = `translate(${currentX}px, ${currentY}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
      
      // Apply the radial glow directly to the container
      container.style.setProperty('--mouse-x', `${mouseX}px`);
      container.style.setProperty('--mouse-y', `${mouseY}px`);

      rafId = requestAnimationFrame(renderLoop);
    };

    // Start the physics loop
    renderLoop();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <main className={styles.container} ref={containerRef}>
      {/* Background layer for the Antigravity deep mesh floating animation */}
      <div className={styles.ambientBackground}></div>

      {/* Main Glassmorphism Login Card */}
      <section 
        className={styles.loginCard} 
        ref={cardRef}
        onMouseEnter={() => { isHoveringRef.current = true; }}
        onMouseLeave={() => { isHoveringRef.current = false; }}
      >
        <div className={styles.logoContainer}>
          <div className={styles.appIcon}></div>
          <h1 className={styles.title}>CarbonSense</h1>
        </div>

        <p className={styles.subtitle}>
          Sign in to access your Digital Twin and start reducing your carbon footprint.
        </p>

        <button 
          className={styles.googleButton}
          aria-label="Sign in securely with your Google account"
          onClick={() => signIn('google', { callbackUrl: '/' })}
        >
          <img 
            src="https://authjs.dev/img/providers/google.svg" 
            alt="Google Logo" 
            className={styles.providerIcon} 
          />
          Sign in with Google
        </button>
      </section>
    </main>
  );
}
