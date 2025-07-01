import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';
import Auth from './pages/Auth';
import Dashboard from './pages/dashboard';
import PropertyInterestForm from './pages/PropertyInterestForm';
import SidebarLayout from './components/SidebarLayout';
import TravelForm from './pages/TravelForm';
import BusinessForm from './pages/BusinessForm';
// import SettingsPage from './SettingsPage'; // Create this if needed
// import './assets/SidebarLayout.css';

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error) console.error('Auth Error:', error.message);
      setUser(data?.user ?? null);
      setLoading(false);
    };

    getUser();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  if (loading) return <p>Loading...</p>;

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={user ? <Navigate to="/dashboard" replace /> : <Auth />}
        />

        {user && (
          <Route element={<SidebarLayout />}>
            <Route path="/dashboard" element={<Dashboard user={user} />} />
            <Route path="/form/travel" element={<TravelForm user={user} />} />
            <Route path="/form/property" element={<PropertyInterestForm user={user} />} />
            <Route path="/form/business" element={<BusinessForm user={user} />} />
            {/* <Route path="/settings" element={<SettingsPage />} /> */}
          </Route>
        )}

        {/* Redirect if not authenticated */}
        {!user && (
          <>
            <Route path="/dashboard" element={<Navigate to="/" replace />} />
            <Route path="/form/*" element={<Navigate to="/" replace />} />
            {/* <Route path="/settings" element={<Navigate to="/" replace />} /> */}
          </>
        )}
      </Routes>
    </BrowserRouter>
  );
}
