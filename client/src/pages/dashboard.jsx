import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';
import PropertyInterestForm from './PropertyInterestForm';

export default function Dashboard({ user }) {
  const navigate = useNavigate();
  const [name, setName] = useState('');

  useEffect(() => {
    const fetchUserName = async () => {
      if (!user || !user.id) return;
      const { data, error } = await supabase
        .from('profiles')
        .select('name')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error fetching name:', error.message);
      } else {
        setName(data.name);
      }
    };

    fetchUserName();
  }, [user]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Welcome to your Dashboard</h2>
      <p><strong>Logged in as:</strong> {name || user.email}</p>

      <button onClick={handleLogout} style={{ marginBottom: '1rem' }}>
        Log Out
      </button>

      {/* Pass user to the form */}
      {/* <PropertyInterestForm user={user} /> */}
    </div>
  );
}