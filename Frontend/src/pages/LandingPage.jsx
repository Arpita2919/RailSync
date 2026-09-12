import React, { useEffect } from 'react';
import '../components/landing/landingAnimations.css';
import LandingNavbar       from '../components/landing/LandingNavbar.jsx';
import LandingHero         from '../components/landing/LandingHero.jsx';
import LandingProblem      from '../components/landing/LandingProblem.jsx';
import LandingHowItWorks   from '../components/landing/LandingHowItWorks.jsx';
import LandingCapabilities from '../components/landing/LandingCapabilities.jsx';
import LandingDigitalTwin  from '../components/landing/LandingDigitalTwin.jsx';
import LandingOptimizer    from '../components/landing/LandingOptimizer.jsx';
import LandingWhatIf       from '../components/landing/LandingWhatIf.jsx';
import LandingCTA          from '../components/landing/LandingCTA.jsx';
import LandingFooter       from '../components/landing/LandingFooter.jsx';

export default function LandingPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-surface text-on-surface selection:bg-primary-container selection:text-on-primary overflow-x-hidden font-sans">

      {/* Navigation */}
      <LandingNavbar />

      <main>
        {/* 1. Hero — RAILSYNC brand + pipeline chain + CTAs */}
        <LandingHero />

        {/* 2. The Problem — 3 coordination challenges */}
        <LandingProblem />

        {/* 3. How RailSync Works — 5-stage pipeline */}
        <LandingHowItWorks />

        {/* 4. Key Capabilities — 8 real capabilities */}
        <LandingCapabilities />

        {/* 5. Digital Twin — simulated corridor visualisation */}
        <LandingDigitalTwin />

        {/* 6. Optimisation Preview — CP-SAT flow */}
        <LandingOptimizer />

        {/* 7. What-If Replanning — scenario sandbox */}
        <LandingWhatIf />

        {/* 8. Final CTA */}
        <LandingCTA />
      </main>

      {/* Footer */}
      <LandingFooter />
    </div>
  );
}
