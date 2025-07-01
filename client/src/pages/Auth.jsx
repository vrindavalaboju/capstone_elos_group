import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';
import '../assets/Auth.css';  // Import the CSS file

export default function Auth() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [showNameField, setShowNameField] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    setStatus('');
    setLoading(true);

    const cleanEmail = email.trim();
    const cleanPassword = password.trim();

    if (!cleanEmail || !cleanPassword) {
      setStatus('Please enter both email and password.');
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password: cleanPassword,
    });

    if (error) {
      setStatus(`Login Error: ${error.message}`);
      setLoading(false);
      return;
    }

    setStatus('Login successful! Redirecting...');
    navigate('/dashboard');
    setLoading(false);
  };

  const handleSignup = async () => {
    setStatus('');
    setLoading(true);

    const cleanEmail = email.trim();
    const cleanPassword = password.trim();
    const cleanName = name.trim();

    if (!cleanEmail || !cleanPassword || !cleanName) {
      setStatus('Please fill in all fields.');
      setLoading(false);
      return;
    }

    const { data, error } = await supabase.auth.signUp({
      email: cleanEmail,
      password: cleanPassword,
    });

    if (error) {
      setStatus(`Signup Error: ${error.message}`);
      setLoading(false);
      return;
    }

    if (data?.user) {
      const user = data.user;
      const { error: insertError } = await supabase
        .from('profiles')
        .insert([{ id: user.id, email: user.email, name: cleanName }]);

      if (insertError) {
        setStatus(`Profile creation error: ${insertError.message}`);
        setLoading(false);
        return;
      }

      setStatus('Signup successful! Please check your email to verify your account.');
    }
    setName('');
    setShowNameField(false);
    setLoading(false);
  };

  const handleSignupClick = () => {
    if (!showNameField) {
      setShowNameField(true);
    } else {
      handleSignup();
    }
  };

  return (
    <div className="auth-page-wrapper">
      <div className="auth-form-box">
        <h2>Login or Sign Up</h2>

        {showNameField && (
          <input
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={loading}
            className="auth-input"
          />
        )}

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
          className="auth-input"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading}
          className="auth-input"
        />

        <div className="auth-button-group">
          <button 
            onClick={handleLogin} disabled={loading} className="auth-button">
            Log In
          </button>
          <button onClick={handleSignupClick} disabled={loading} className="auth-button">
            Sign Up
          </button>
        </div>

        {status && (
          <div className={`auth-status ${status.toLowerCase().includes('error') ? 'error' : 'success'}`}>
            {status}
          </div>
        )}
      </div>
    </div>
  );
}
