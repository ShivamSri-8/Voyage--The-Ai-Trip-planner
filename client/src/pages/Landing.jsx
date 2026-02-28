import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const features = [
    {
        icon: '🤖',
        title: 'AI-Powered Itineraries',
        description: 'Personalized day-by-day travel plans with morning, afternoon, and evening activities — crafted by AI.',
    },
    {
        icon: '💰',
        title: 'Smart Budget Planning',
        description: 'Complete budget breakdowns in ₹ INR for hotels, food, transport, and activities.',
    },
    {
        icon: '🏨',
        title: 'Curated Hotel Picks',
        description: 'Hand-picked hotel recommendations from Budget to Luxury, with pricing and reasons for each pick.',
    },
    {
        icon: '🗺️',
        title: 'Mappls Integration',
        description: 'Intelligent place suggestions powered by Mappls as you type your destination.',
    },
    {
        icon: '📋',
        title: 'Trip History',
        description: 'All itineraries saved securely. Access, review, and manage your past adventures anytime.',
    },
    {
        icon: '👥',
        title: 'Group-Aware Planning',
        description: 'Solo, couple, friends, or family — the AI adapts everything to suit your group.',
    },
];

const steps = [
    {
        number: '1',
        title: 'Set your preferences',
        description: 'Enter destination, budget, duration, group type, and interests.',
    },
    {
        number: '2',
        title: 'AI builds your plan',
        description: 'Our AI-powered engine crafts the perfect itinerary in seconds.',
    },
    {
        number: '3',
        title: 'Explore & travel',
        description: 'Get your day-by-day itinerary, hotel picks, budget breakdown, and tips.',
    },
];

const Landing = () => {
    const { isAuthenticated } = useAuth();

    return (
        <div>
            {/* ── HERO ── */}
            <section className="landing-hero" id="hero-section">
                <div className="hero-bg">
                    <img
                        src="https://images.unsplash.com/photo-1506929562872-bb421503ef21?auto=format&fit=crop&w=1080&q=60"
                        alt="Travel destination"
                        loading="eager"
                    />
                </div>
                <div className="hero-overlay" />

                <div className="hero-content">
                    <div className="hero-badge">
                        <span>✈️</span>
                        AI-Powered Travel Planning
                    </div>

                    <h1 className="hero-title">
                        Plan Your Dream Trip
                        <br />
                        <span className="hero-title-gradient">In Seconds</span>
                    </h1>

                    <p className="hero-description">
                        Tell us where you want to go, your budget and interests — our AI
                        creates a personalized, day-by-day itinerary tailored exactly for you.
                    </p>

                    <div className="hero-actions">
                        {isAuthenticated ? (
                            <>
                                <Link to="/create-trip" className="hero-btn-primary" id="hero-plan-trip">
                                    ✨ Start Planning Now
                                </Link>
                                <Link to="/dashboard" className="hero-btn-secondary" id="hero-dashboard">
                                    View Dashboard
                                </Link>
                            </>
                        ) : (
                            <>
                                <Link to="/register" className="hero-btn-primary" id="hero-get-started">
                                    ✨ Start Planning Now
                                </Link>
                                <a href="#how-it-works" className="hero-btn-secondary" id="hero-how-it-works">
                                    See How It Works
                                </a>
                            </>
                        )}
                    </div>

                    <div className="hero-stats">
                        <div className="hero-stat">
                            <div className="hero-stat-value">50+</div>
                            <div className="hero-stat-label">Destinations</div>
                        </div>
                        <div className="hero-stat-divider" />
                        <div className="hero-stat">
                            <div className="hero-stat-value">AI</div>
                            <div className="hero-stat-label">Powered by Groq</div>
                        </div>
                        <div className="hero-stat-divider" />
                        <div className="hero-stat">
                            <div className="hero-stat-value">Free</div>
                            <div className="hero-stat-label">No hidden costs</div>
                        </div>
                    </div>
                </div>

                <div className="hero-scroll-indicator">
                    <div className="scroll-mouse">
                        <div className="scroll-dot" />
                    </div>
                </div>
            </section>

            {/* ── HOW IT WORKS ── */}
            <section className="section" id="how-it-works">
                <div className="section-header">
                    <div className="section-badge">How it works</div>
                    <h2 className="section-title">Three simple steps</h2>
                    <p className="section-subtitle">
                        No research, no stress. Just tell us what you want and go.
                    </p>
                </div>

                <div className="steps-grid stagger">
                    {steps.map((step, i) => (
                        <div className="step-card" key={i} id={`step-${i}`}>
                            <div className="step-number">{step.number}</div>
                            <h3 className="step-title">{step.title}</h3>
                            <p className="step-description">{step.description}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── FEATURES ── */}
            <section className="section" id="features-section" style={{ paddingTop: 32 }}>
                <div className="section-header">
                    <div className="section-badge">Features</div>
                    <h2 className="section-title">
                        Everything you need to plan
                        <br />
                        <span className="gradient-text">the perfect trip</span>
                    </h2>
                    <p className="section-subtitle">
                        From AI itineraries to smart budget management, Voyage has you covered.
                    </p>
                </div>

                <div className="features-grid stagger">
                    {features.map((feature, i) => (
                        <div className="feature-card" key={i} id={`feature-${i}`}>
                            <div className="feature-icon">{feature.icon}</div>
                            <h3 className="feature-title">{feature.title}</h3>
                            <p className="feature-description">{feature.description}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── CTA ── */}
            <section className="cta-section" id="cta-section">
                <h2 className="section-title" style={{ marginBottom: 12 }}>
                    Ready to <span className="gradient-text">explore?</span>
                </h2>
                <p className="section-subtitle" style={{ marginBottom: 32 }}>
                    Join travelers who plan smarter with Voyage.
                </p>
                {isAuthenticated ? (
                    <Link to="/create-trip" className="hero-btn-primary">
                        Plan your next trip →
                    </Link>
                ) : (
                    <Link to="/register" className="hero-btn-primary">
                        Create free account →
                    </Link>
                )}
            </section>

            {/* ── FOOTER ── */}
            <footer className="landing-footer">
                <p>© {new Date().getFullYear()} Voyage. AI-powered trip planning.</p>
            </footer>
        </div>
    );
};

export default Landing;
