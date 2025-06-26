// Auth.jsx
import React, { useState } from 'react';
import { supabase } from './supabaseClient';
import { useNavigate } from 'react-router-dom';

export default function Auth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
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

    console.log('Logging in with:', { email: cleanEmail, password: '******' });

    const { error } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password: cleanPassword,
    });

    if (error) {
      setStatus(`Login Error: ${error.message}`);
      console.error('Login failed:', error);
    } else {
      setStatus('Login successful! Redirecting...');
      navigate('/dashboard');
    }

    setLoading(false);
  };

  const handleSignup = async () => {
    setStatus('');
    setLoading(true);

    const cleanEmail = email.trim();
    const cleanPassword = password.trim();

    if (!cleanEmail || !cleanPassword) {
      setStatus('Please enter both email and password.');
      setLoading(false);
      return;
    }

    console.log('Signing up with:', { email: cleanEmail, password: '******' });

    const { data, error } = await supabase.auth.signUp({
      email: cleanEmail,
      password: cleanPassword,
    });

    if (error) {
      setStatus(`Signup Error: ${error.message}`);
      console.error('Signup failed:', error);
      setLoading(false);
      return;
    }

    if (data?.user) {
      // Insert user profile into your 'profiles' table
      const user = data.user;
      const { error: insertError } = await supabase
        .from('profiles')
        .insert([{ id: user.id, email: user.email }]);

      if (insertError) {
        setStatus(`Profile creation error: ${insertError.message}`);
        console.error('Profile insert error:', insertError);
        setLoading(false);
        return;
      }

      setStatus('Signup successful! Please check your email to verify your account.');
    }

    setLoading(false);
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Login or Sign Up</h2>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{ marginBottom: '1rem', display: 'block' }}
        disabled={loading}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={{ marginBottom: '1rem', display: 'block' }}
        disabled={loading}
      />
      <button onClick={handleLogin} disabled={loading} style={{ marginRight: '1rem' }}>
        Log In
      </button>
      <button onClick={handleSignup} disabled={loading}>
        Sign Up
      </button>
      {status && (
        <div style={{ marginTop: '1rem', color: status.includes('Error') ? 'red' : 'green' }}>
          {status}
        </div>
      )}
    </div>
  );
}
