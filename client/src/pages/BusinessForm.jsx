import { useState } from 'react';
import { supabase } from '../supabaseClient';
import '../assets/PropertyInterestForm.css';

export default function BusinessSetupForm({ user }) {
  const [formData, setFormData] = useState({
    business_type: '',
    sector: '',
    legal_status: '',
    office_setup: false,
    investment: '',
    location: '',
    need_local_staff: false,
    support_needed: [],
    timeline: '',
    notes: '',
  });

  const [status, setStatus] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name === 'support_needed') {
      const newSupport = checked
        ? [...formData.support_needed, value]
        : formData.support_needed.filter((item) => item !== value);
      setFormData({ ...formData, support_needed: newSupport });
    } else {
      setFormData({
        ...formData,
        [name]: type === 'checkbox' ? checked : value,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      setStatus('You must be logged in to submit this form.');
      return;
    }

    const insertData = {
      ...formData,
      investment: formData.investment ? String(formData.investment) : null,
      support_needed: formData.support_needed.join(', '),
      user_id: user.id,
    };

    const { error } = await supabase.from('business_setup_forms').insert([insertData]);

    if (error) {
      setStatus('Submission failed: ' + error.message);
    } else {
      setStatus('Submitted successfully!');
      setFormData({
        business_type: '',
        sector: '',
        legal_status: '',
        office_setup: false,
        investment: '',
        location: '',
        need_local_staff: false,
        support_needed: [],
        timeline: '',
        notes: '',
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="property-form">
      <h2>Business Setup Form</h2>

      <label>Type of Business</label>
      <select
        name="business_type"
        value={formData.business_type}
        onChange={handleChange}
        required
      >
        <option value="">Select</option>
        <option>Sole Proprietorship</option>
        <option>PLC</option>
        <option>Branch</option>
        <option>Partnership</option>
      </select>

      <label>Sector/Industry</label>
      <input
        type="text"
        name="sector"
        value={formData.sector}
        onChange={handleChange}
        required
      />

      <label>Legal Status</label>
      <select
        name="legal_status"
        value={formData.legal_status}
        onChange={handleChange}
        required
      >
        <option value="">Select</option>
        <option>New</option>
        <option>Expanding existing</option>
      </select>

      <label>
        <input
          type="checkbox"
          name="office_setup"
          checked={formData.office_setup}
          onChange={handleChange}
        />
        Need for Office Setup?
      </label>

      <label>Estimated Investment (USD/ETB)</label>
      <input
        type="text"
        name="investment"
        value={formData.investment}
        onChange={handleChange}
        required
      />

      <label>Preferred Location</label>
      <input
        type="text"
        name="location"
        value={formData.location}
        onChange={handleChange}
        required
      />

      <label>
        <input
          type="checkbox"
          name="need_local_staff"
          checked={formData.need_local_staff}
          onChange={handleChange}
        />
        Do you need local staff?
      </label>

      <label>Support Needed</label>
      <div style={{ marginBottom: '1em' }}>
        {['Legal registration', 'Tax ID', 'Licensing', 'Recruitment'].map((option) => (
          <label key={option} style={{ display: 'block' }}>
            <input
              type="checkbox"
              name="support_needed"
              value={option}
              checked={formData.support_needed.includes(option)}
              onChange={handleChange}
            />
            {' '}{option}
          </label>
        ))}
      </div>

      <label>Timeline</label>
      <select
        name="timeline"
        value={formData.timeline}
        onChange={handleChange}
        required
      >
        <option value="">Select</option>
        <option>1–3 months</option>
        <option>3–6 months</option>
      </select>

      <label>Additional Notes</label>
      <textarea
        name="notes"
        value={formData.notes}
        onChange={handleChange}
      />

      <button type="submit">Submit</button>

      {status && <p>{status}</p>}
    </form>
  );
}
