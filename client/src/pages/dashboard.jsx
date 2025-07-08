import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';
import '../assets/Dashboard.css';

const STATUS_OPTIONS = [
  'Submitted',
  'In Review',
  'Pending Info',
  'In Progress',
  'Awaiting Payment',
  'Completed',
  'On Hold',
  'Cancelled',
  'Archived',
];

export default function Dashboard() {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [name, setName] = useState('');
  const [role, setRole] = useState('user');
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedIdx, setExpandedIdx] = useState(null);

  // For edit mode toggle
  const [isEditing, setIsEditing] = useState(false);

  // Track which requests are marked for deletion (by id)
  const [requestsToDelete, setRequestsToDelete] = useState(new Set());

  // Track status changes { requestId: newStatus }
  const [statusChanges, setStatusChanges] = useState({});

  useEffect(() => {
    const fetchUserAndData = async () => {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        console.error('Error fetching user:', userError?.message);
        navigate('/login');
        return;
      }

      setUserData(user);

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('name, role')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error('Error fetching profile:', profileError.message);
      } else {
        setName(profile.name);
        setRole(profile.role);
      }

      await fetchRequests(user, profile.role);

    };

    fetchUserAndData();
  }, [navigate]);

  const fetchRequests = async (userData, role) => {
    if (!userData || !userData.id) return;

    setLoading(true);

    const tables = [
      { name: 'travel_forms', service: 'Travel' },
      { name: 'business_setup_forms', service: 'Business' },
      { name: 'property_interest_forms', service: 'Property' },
    ];

    let allRequests = [];

    for (const table of tables) {
      const query = supabase
        .from(table.name)
        .select('*')
        .order('inserted_at', { ascending: false });

      if (role !== 'admin') {
        query.eq('user_id', userData.id);
      }

      const { data, error } = await query;

      if (error) {
        console.error(`Error fetching ${table.name}:`, error.message);
      } else {
        const enriched = data.map((entry) => ({
          ...entry,
          service: table.service,
          tableName: table.name,
          status: entry.status || 'Submitted',
        }));
        allRequests = allRequests.concat(enriched);
      }
    }

    // Collect unique user_ids from allRequests
    const uniqueUserIds = [...new Set(allRequests.map((r) => r.user_id))];

    // Fetch profiles for these user ids
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, name')
      .in('id', uniqueUserIds);

    if (profilesError) {
      console.error('Error fetching profiles:', profilesError.message);
    }

    // Map user_id to user name
    const userIdToName = {};
    profiles?.forEach((p) => {
      userIdToName[p.id] = p.name || 'No Name';
    });

    // Add userName field to each request
    allRequests = allRequests.map((req) => ({
      ...req,
      userName: userIdToName[req.user_id] || 'Unknown',
    }));

    allRequests.sort((a, b) => new Date(b.inserted_at) - new Date(a.inserted_at));
    setRequests(allRequests);
    setLoading(false);
  };

  // Toggle requests marked for deletion on row X click
  const toggleDeleteRequest = (id) => {
    setRequestsToDelete((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      return newSet;
    });
  };

  // Change status locally in state for request id
  const handleStatusChange = (id, newStatus) => {
    setStatusChanges((prev) => ({ ...prev, [id]: newStatus }));
  };

  // Save all changes (status updates + deletions)
  const handleSaveChanges = async () => {
    setLoading(true);

    // 1. Delete marked requests
    for (const id of requestsToDelete) {
      const req = requests.find((r) => r.id === id);
      if (!req) continue;
      const { error } = await supabase.from(req.tableName).delete().eq('id', id);
      if (error) console.error('Delete error for id:', id, error.message);
    }

    // 2. Update statuses
    for (const [id, newStatus] of Object.entries(statusChanges)) {
      // Skip if status was not changed or if request is being deleted
      if (requestsToDelete.has(id)) continue;

      const req = requests.find((r) => r.id === id);
      if (!req) continue;

      // Only update if newStatus is different from current
      if (req.status === newStatus) continue;

      const { error } = await supabase
        .from(req.tableName)
        .update({ status: newStatus })
        .eq('id', id);

      if (error) console.error('Update status error for id:', id, error.message);
    }

    // Refresh the requests from DB
    await fetchRequests();

    // Reset editing state
    setIsEditing(false);
    setRequestsToDelete(new Set());
    setStatusChanges({});
    setLoading(false);
  };

  // Cancel editing mode resets all changes
  const cancelEditing = () => {
    setIsEditing(false);
    setRequestsToDelete(new Set());
    setStatusChanges({});
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const toggleDetails = (idx) => {
    setExpandedIdx(expandedIdx === idx ? null : idx);
  };

  return (
    <div className="dashboard-container">
      <h2 className="dashboard-header">Welcome to your Dashboard</h2>
      <p><strong>Logged in as:</strong> {name || userData?.email}</p>
      <p><strong>Role:</strong> {role}</p>

      <button onClick={() => navigate('/edit-profile')} className="edit-profile">
        Edit Profile
      </button>

      <button onClick={handleLogout} className="logout">
        Log Out
      </button>

      {role === 'admin' && (
        <div style={{ margin: '1rem 0' }}>
          {!isEditing ? (
            <button
              className="edit-mode-button"
              onClick={() => setIsEditing(true)}
              aria-label="Enter edit mode"
            >
              ✏️ Edit
            </button>
          ) : (
            <>
              <button
                className="save-button"
                onClick={handleSaveChanges}
                aria-label="Save all changes"
                style={{ marginRight: '8px' }}
              >
                💾 Save
              </button>
              <button
                className="cancel-button"
                onClick={cancelEditing}
                aria-label="Cancel editing"
              >
                ❌ Cancel
              </button>
            </>
          )}
        </div>
      )}

      {loading ? (
        <p>Loading requests...</p>
      ) : requests.length === 0 ? (
        <p>No requests submitted yet.</p>
      ) : (
        <table className="dashboard-table">
          <thead>
            <tr>
              {role === 'admin' && isEditing && <th>Delete</th>}
              <th>Service</th>
              <th>User Name</th>
              <th>Date Submitted</th>
              <th>Status</th>
              <th>Details</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((req, idx) => {
              const isDeleted = requestsToDelete.has(req.id);
              const currentStatus = statusChanges[req.id] || req.status;

              return (
                <React.Fragment key={req.id}>
                  <tr
                    key={req.id}
                    style={{
                      opacity: isDeleted ? 0.5 : 1,
                      textDecoration: isDeleted ? 'line-through' : 'none',
                    }}
                  >
                    {role === 'admin' && isEditing && (
                      <td>
                        <button
                          onClick={() => toggleDeleteRequest(req.id)}
                          className="delete-row-button"
                          aria-label={`Delete request ${req.id}`}
                        >
                          ❌
                        </button>
                      </td>
                    )}
                    <td>{req.service}</td>
                    <td>{role === 'admin' ? req.userName : 'You'}</td>
                    <td>{new Date(req.inserted_at).toLocaleDateString()}</td>
                    <td>
                      {role === 'admin' && isEditing ? (
                        <select
                          value={currentStatus}
                          onChange={(e) => handleStatusChange(req.id, e.target.value)}
                        >
                          {STATUS_OPTIONS.map((opt) => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                      ) : (
                        currentStatus
                      )}
                    </td>
                    <td>
                      <button onClick={() => toggleDetails(idx)}>
                        {expandedIdx === idx ? 'Hide' : 'View'}
                      </button>
                    </td>
                  </tr>
                  {expandedIdx === idx && (
                    <tr className="details-row">
                      <td colSpan={role === 'admin' ? 6 : 5}>
                        <div>
                          {Object.entries(req).map(([key, value]) =>
                            !['id', 'user_id', 'inserted_at', 'service', 'status', 'tableName', 'userName'].includes(key) && (
                              <p key={key}>
                                <strong>{key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}:</strong>{' '}
                                {String(value)}
                              </p>
                            )
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}

