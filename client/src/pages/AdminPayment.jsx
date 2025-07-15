import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import '../assets/PropertyInterestForm.css';

export default function AdminPayment() {
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [requests, setRequests] = useState([]);
  const [selectedService, setSelectedService] = useState('');
  const [billAmount, setBillAmount] = useState('');
  const [status, setStatus] = useState('');
  const [invoiceFile, setInvoiceFile] = useState(null);

  // Fetch non-admin users on mount
  useEffect(() => {
    const fetchUsers = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, name')
        .eq('role', 'user');

      if (error) {
        console.error('Error fetching users:', error.message);
      } else {
        const filtered = data.filter((user) => user.name && user.name.trim() !== '');
        setUsers(filtered);
      }
    };

    fetchUsers();
  }, []);

  // Fetch service requests for the selected user
  useEffect(() => {
    if (!selectedUserId) return;

    const fetchRequests = async () => {
      const tables = [
        { name: 'travel_forms', service: 'Travel' },
        { name: 'business_setup_forms', service: 'Business' },
        { name: 'property_interest_forms', service: 'Property' },
      ];

      let allRequests = [];

      for (const table of tables) {
        const { data, error } = await supabase
          .from(table.name)
          .select('id, inserted_at')
          .eq('user_id', selectedUserId);

        if (!error && data.length) {
          const formatted = data.map((entry) => ({
            id: entry.id,
            service: table.service,
            inserted_at: entry.inserted_at,
          }));
          allRequests = allRequests.concat(formatted);
        }
      }

      // Sort most recent first
      allRequests.sort((a, b) => new Date(b.inserted_at) - new Date(a.inserted_at));
      setRequests(allRequests);
    };

    fetchRequests();
  }, [selectedUserId]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedUserId || !selectedService || !billAmount) {
      setStatus('Please fill in all fields.');
      return;
    }

    setStatus('Uploading...');

    let invoiceUrl = null;
    // Upload invoice pdf
    if (invoiceFile) {
        const fileExt = invoiceFile.name.split('.').pop();
        const fileName = `${selectedUserId}-${Date.now()}.${fileExt}`;
        const filePath = `invoices/${fileName}`;

        const { error: uploadError } = await supabase.storage
        .from('invoices') 
        .upload(filePath, invoiceFile);

        if (uploadError) {
            setStatus('Failed to upload invoice: ' + uploadError.message);
            return;
        }
        // Get public URL
        const { data } = supabase.storage.from('invoices').getPublicUrl(filePath);
        invoiceUrl = data.publicUrl;
  }

  // 2. Find selected request’s ID (from `requests`)
//   const selectedRequest = requests.find((r) => r.service === selectedService);

  // 3. Insert into invoices table
  const { error: insertError } = await supabase.from('invoices').insert([
    {
      user_id: selectedUserId,
      service_type: selectedService,
      amount_owed: billAmount,
      invoice_url: invoiceUrl,
    }
  ]);

  if (insertError) {
    setStatus('Failed to insert invoice: ' + insertError.message);
    return;
  }

  setStatus('Invoice created successfully!');
  setBillAmount('');
  setSelectedService('');
  setSelectedUserId('');
  setInvoiceFile(null);
};

  return (
    <form onSubmit={handleSubmit} className="property-form">
      <h2>Create Invoice</h2>

      <label>Select User</label>
      <select
        value={selectedUserId}
        onChange={(e) => {
          setSelectedUserId(e.target.value);
          setSelectedService('');
        }}
        required
      >
        <option value="">-- Choose User --</option>
        {users.map((u) => (
          <option key={u.id} value={u.id}>
            {u.name}
          </option>
        ))}
      </select>

      {requests.length > 0 && (
        <>
          <label>Select Service Request</label>
          <select
            value={selectedService}
            onChange={(e) => setSelectedService(e.target.value)}
            required
          >
            <option value="">-- Choose Request --</option>
            {requests.map((r) => (
              <option key={r.id} value={r.service}>
                {r.service} - {new Date(r.inserted_at).toLocaleDateString()}
              </option>
            ))}
          </select>
        </>
      )}

      <label>Amount Owed (USD)</label>
      <input
        type="number"
        min="0"
        value={billAmount}
        onChange={(e) => setBillAmount(e.target.value)}
        required
      />

      <label>Upload Invoice (PDF)</label>
      <input
        type="file"
        accept="application/pdf"
        onChange={(e) => setInvoiceFile(e.target.files[0])}
      />

      <button type="submit">Submit Invoice</button>

      {status && <p>{status}</p>}
    </form>
  );
}
