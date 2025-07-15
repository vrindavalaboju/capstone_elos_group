import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../assets/Home.css';
import heroImage from '../assets/images/filler1.png';

export default function Home() {
    const navigate = useNavigate();

    return (
        <div className="home-container">
            <section className="hero">
                <div className="hero-content">
                    <div className="text">
                        <h1>
                            Connecting the Ethiopian Diaspora
                        </h1>
                        <p>
                            Trusted travel, business, and property services.
                        </p>
                        <button onClick={() => navigate('/dashboard')} className="button">
                            Get Started
                        </button>
                    </div>
                    <div className="image">
                        <img src={heroImage} alt="Professional Consulting" />
                    </div>
                </div>
            </section>
        </div>
    );
}
