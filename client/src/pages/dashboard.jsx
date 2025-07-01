import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';
import '../assets/Dashboard.css';

export default function Dashboard({ user }) {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  useEffect(() => {
    const fetchAllRequests = async () => {

      setLoading(true);

      const tables = [
        { name: 'travel_forms', service: 'Travel' },
        { name: 'business_setup_forms', service: 'Business' },
        { name: 'property_interest_forms', service: 'Property' }
      ];

      let allRequests = [];

      for (const table of tables) {
        const { data, error } = await supabase
          .from(table.name)
          .select('*')
          .eq('user_id', user.id)
          .order('inserted_at', { ascending: false });

        if (error) {
          console.error(`Error fetching ${table.name}:`, error.message);
        } else {
          const enriched = data.map(entry => ({
            ...entry,
            service: table.service
          }));
          allRequests = allRequests.concat(enriched);
        }
      }

      allRequests.sort((a, b) => new Date(b.inserted_at) - new Date(a.inserted_at));

      setRequests(allRequests);
      setLoading(false);
    };

    fetchAllRequests();
  }, [user]);

  return (
    <div className="dashboard-container">
      <h2 className="dashboard-header">Welcome to your Dashboard</h2>
      <p><strong>Logged in as:</strong> {user.email}</p>

      <button onClick={handleLogout} className="logout-button">
        Log Out
      </button>

      {loading ? (
        <p>Loading requests...</p>
      ) : requests.length === 0 ? (
        <p>No requests submitted yet.</p>
      ) : (
        <table className="dashboard-table">
          <thead>
            <tr>
              <th>Service</th>
              <th>Date Submitted</th>
              <th>Status</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((req, idx) => (
              <tr key={idx}>
                <td>{req.service}</td>
                <td>{new Date(req.inserted_at).toLocaleDateString()}</td>
                <td>Pending</td>
                <td>{req.additional_notes || req.notes || req.additional_requests || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
