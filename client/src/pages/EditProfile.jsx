import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';

export default function EditProfile({ user }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState(user?.email || '');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState('');

  useEffect(() => {
    const fetchName = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('name')
        .eq('id', user.id)
        .single();

      if (data) setName(data.name || '');
      if (error) console.error('Failed to fetch name:', error.message);
    };

    if (user?.id) fetchName();
  }, [user]);

  const handleUpdate = async () => {
    setStatus('');

    // Update auth info (email/password)
    const updates = {};
    if (email !== user.email) updates.email = email;
    if (password.trim()) updates.password = password;

    if (Object.keys(updates).length > 0) {
      const { error: authError } = await supabase.auth.updateUser(updates);
      if (authError) {
        setStatus(`Error updating auth: ${authError.message}`);
        return;
      }
    }

    // Update name in profiles table
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ name })
      .eq('id', user.id);

    if (profileError) {
      setStatus(`Error updating profile: ${profileError.message}`);
      return;
    }

    setStatus('Profile updated successfully!');
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Edit Profile</h2>

      <div>
        <label>Email:</label><br />
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ width: '300px', padding: '8px', marginBottom: '1rem' }}
        />
      </div>

      <div>
        <label>New Password:</label><br />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Leave blank to keep current"
          style={{ width: '300px', padding: '8px', marginBottom: '1rem' }}
        />
      </div>

      <div>
        <label>Display Name:</label><br />
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{ width: '300px', padding: '8px', marginBottom: '1rem' }}
        />
      </div>

      <button onClick={handleUpdate} style={{ padding: '10px 20px' }}>
        Save Changes
      </button>
      <button onClick={() => navigate('/dashboard')} style={{ marginLeft: '1rem', padding: '10px 20px' }}>
        Back to Dashboard
      </button>

      {status && <p style={{ marginTop: '1rem' }}>{status}</p>}
    </div>
  );
}
