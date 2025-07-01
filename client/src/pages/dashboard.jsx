import React from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';
import BusinessSetupForm from './BusinessSetupForm';
import PropertyInterestForm from './PropertyInterestForm';

export default function Dashboard({ user }) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Welcome to your Dashboard</h2>
      <p><strong>Logged in as:</strong> {user.email}</p>

      <button onClick={handleLogout} style={{ marginBottom: '1rem' }}>
        Log Out
      </button>

      {/* Pass user to the form */}
<<<<<<< HEAD:client/src/dashboard.jsx
      <BusinessSetupForm user={user} />
=======
      {/* <PropertyInterestForm user={user} /> */}
>>>>>>> bd39e2def6098a0d842772650e44e53dcafd00f7:client/src/pages/dashboard.jsx
    </div>
  );
}
