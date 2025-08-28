// src/pages/LandingPage.jsx

import React, {useState} from 'react';
import PublicNavbar from '../components/PublicNavbar';
import './LandingPage.css';

// The component now receives an onAuthClick prop from App.jsx
const LandingPage = ({ onAuthClick }) => {
    const [feedbackName, setFeedbackName] = useState('');
    const [feedbackEmail, setFeedbackEmail] = useState('');
    const [feedbackMessage, setFeedbackMessage] = useState('');
    const [activeFaq, setActiveFaq] = useState(null);

    const handleFeedbackSubmit = async (e) => {
        e.preventDefault();
        // ... (feedback logic remains the same)
    };

    const faqData = [
        { q: 'What is MentorBook?', a: 'MentorBook is a platform designed to connect students with experienced teachers and mentors for personalized guidance and learning.' },
        { q: 'How do I find a mentor?', a: 'Once you sign up as a student, you can use our search and filter functions to find mentors based on subject, expertise, and availability.' },
        { q: 'Is MentorBook free to use?', a: 'Basic access to search for mentors is free. Booking sessions may involve a fee, which is set by the individual mentor.' },
        { q: 'How can I become a mentor?', a: 'If you are a qualified teacher or professional, you can sign up by selecting the "I am a Teacher" role and completing your profile for review.' }
    ];

    const toggleFaq = (index) => {
        setActiveFaq(activeFaq === index ? null : index);
    };


    return (
        <div className="landing-page">
            {/* Pass the onAuthClick function to the navbar */}
            <PublicNavbar onLoginClick={onAuthClick} />

            <section id="hero" className="hero-section">
                <div className="hero-content">
                    <h1>Mentor<span>Book</span></h1>
                    <p>Your gateway to personalized mentorship. Connect with the best mentors, anytime, anywhere.</p>
                    <div className="hero-cta-container">
                        {/* The "Get Started" button now triggers the modal via this function */}
                        <button className="get-started-button" onClick={onAuthClick}>
                            Get Started
                        </button>
                    </div>
                </div>
            </section>
            
            <section id="about" className="about-section">
                <h2>About MentorBook</h2>
                <div className="about-content">
                    <div className="about-text">
                        <h3>Unlock Your Potential</h3>
                        <p>At MentorBook, we believe that the right guidance can make all the difference. Our mission is to bridge the gap between eager learners and experienced educators. Whether you're a student seeking academic help or a professional looking to share your knowledge, MentorBook provides the tools to make meaningful connections.</p>
                    </div>
                    <div className="about-image">
                        <img src="https://images.unsplash.com/photo-1543269865-cbf427effbad?auto=format&fit=crop&w=800&q=60" alt="Mentorship session" />
                    </div>
                </div>
            </section>

            <section id="faq" className="faq-section">
                <h2>Frequently Asked Questions</h2>
                <div className="faq-container">
                    {faqData.map((item, index) => (
                        <div key={index} className="faq-item">
                            <button className="faq-question" onClick={() => toggleFaq(index)}>
                                {item.q}
                                <span className="material-symbols-outlined">
                                    {activeFaq === index ? 'expand_less' : 'expand_more'}
                                </span>
                            </button>
                            <div className={`faq-answer ${activeFaq === index ? 'open' : ''}`}>
                                <p>{item.a}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            <section id="feedback" className="feedback-section">
                <h2>Share Your Feedback</h2>
                <form className="feedback-form" onSubmit={handleFeedbackSubmit}>
                    <input id="feedbackName" name="name" type="text" placeholder="Your Name" value={feedbackName} onChange={(e) => setFeedbackName(e.target.value)} required />
                    <input id="feedbackEmail" name="email" type="email" placeholder="Your Email" value={feedbackEmail} onChange={(e) => setFeedbackEmail(e.target.value)} required />
                    <textarea id="feedbackMessage" name="message" placeholder="Your Message" value={feedbackMessage} onChange={(e) => setFeedbackMessage(e.target.value)} required></textarea>
                    <button type="submit">Submit Feedback</button>
                </form>
            </section>
        </div>
    );
};

export default LandingPage;
