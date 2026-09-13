import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, ShieldCheck, Zap, Palette, FileText, CheckCircle2 } from 'lucide-react';
import './landing.css';

export default function Landing({ onStart }: { onStart: () => void }) {
  return (
    <div className="landing-container">
      {/* Navigation */}
      <nav className="landing-nav">
        <div className="nav-brand">
          <div className="nav-logo">
            <FileText size={20} />
          </div>
          <span className="nav-name">AInvoice</span>
        </div>
        <div className="nav-links">
          <span>Features</span>
          <span>Security</span>
          <span>Pricing</span>
        </div>
        <button className="nav-btn" onClick={onStart}>
          Create Invoice
        </button>
      </nav>

      {/* Hero Section */}
      <main className="hero-section">
        <div className="hero-background">
          <div className="glow glow-1"></div>
          <div className="glow glow-2"></div>
        </div>

        <div className="hero-content">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="beta-badge"
          >
            <span className="badge-dot"></span>
            AInvoice 2.0 is now live
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="hero-title"
          >
            Create Professional Invoices <br />
            <span className="text-gradient">in Seconds.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="hero-subtitle"
          >
            The world's smartest invoice generator. Powered by AI, protected by cryptographic hashes, and designed for modern businesses. Completely free to use.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="hero-cta"
          >
            <button className="cta-btn primary" onClick={onStart}>
              Start Generating Free <ArrowRight size={18} />
            </button>
            <p className="cta-subtext">No credit card required. No sign-up necessary.</p>
          </motion.div>
        </div>

        {/* Feature Grid */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="feature-grid"
        >
          <div className="feature-card">
            <div className="feature-icon icon-blue"><Zap size={24} /></div>
            <h3>AI-Powered Line Items</h3>
            <p>Let our AI suggest optimized line items and payment terms tailored to your industry to get you paid faster.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon icon-green"><ShieldCheck size={24} /></div>
            <h3>Tamper-Proof Verification</h3>
            <p>Every invoice generates a unique MD5 cryptographic hash to prove it hasn't been altered after creation.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon icon-purple"><Palette size={24} /></div>
            <h3>Premium Themes</h3>
            <p>Switch between dark mode, neon violet, or luxury gold instantly. Customize fonts, accents, and multiple currencies.</p>
          </div>
        </motion.div>
      </main>
      
      {/* Footer */}
      <footer className="landing-footer">
        <p>© 2026 AInvoice Generator. All rights reserved.</p>
      </footer>
    </div>
  );
}
