import { useState } from 'react';
import { supabase } from './supabaseClient';
import './BusinessSetupForm.css';

export default function BusinessSetupForm({ user }) {
  const [formData, setFormData] = useState({
    business_type: '',
    sector: '', //industry
    legal_status: '',
    office_setup: false,
    estimated_investment: '',
    preferred_location: '',
    staff_needed: false,
    support_needed: '',
    timeline: '',
    additional_notes: '',
  });

  const [status, setStatus] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  //submission&database stuff here
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      setStatus('You must be logged in to submit this form.');
      return;
    }
    
    const insertData = {
      ...formData,
      estimated_investment: formData.estimated_investment 
        ? Number(formData.estimated_investment) : null,
      user_id: user.id,
    };

    const { error } = await supabase.from('business_setup_forms').insert([insertData]);

    if (error) {
      setStatus('Submission failed: ' + error.message);
    } else {
      setStatus('Submitted successfully!');
      setFormData({
        business_type: '',
        sector: '', //industry
        legal_status: '',
        office_setup: false,
        estimated_investment: '',
        preferred_location: '',
        staff_needed: false,
        support_needed: '',
        timeline: '',
        additional_notes: '',
      });
    }
  };
  

  return(
    <form onSubmit={handleSubmit} className="business-form">
      <h2>Business Setup Form</h2>

      <label>Type of Business</label>
      <select name="business_type" value={formData.business_type} onChange={handleChange} required>
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
      <div>
        <label>
          <input
            type="radio"
            name="legal_status"
            value="New"
            checked={formData.legal_status === 'New'}
            onChange={handleChange}
          />
          New
        </label>

        <label>
          <input
            type="radio"
            name="legal_status"
            value="Expanding Existing"
            checked={formData.legal_status === 'Expanding Existing'}
            onChange={handleChange}
          />
          Expanding Existing
        </label>
       </div>

      <label>
        <input
          type="checkbox"
          name="office_setup"
          checked={formData.office_setup}
          onChange={handleChange}
        />
        Do you need office setup?
      </label>

      <label>Estimated Investment</label>
      <input
        type="number"
        name="estimated_investment"
        value={formData.estimated_investment}
        onChange={handleChange}
        required
        min="0"
        step="any"
      />

      <label>
        <input
          type="checkbox"
          name="staff_needed"
          checked={formData.staff_needed}
          onChange={handleChange}
        />
        Do you need local staff?
      </label>

      <label>Support Needed</label>
      <select name="support_needed" value={formData.support_needed} onChange={handleChange} required>
        <option value="">Select</option>
        <option>Legal Registration</option>
        <option>Tax ID</option>
        <option>Licensing</option>
        <option>Recruitment</option>
      </select>

      <label>Timeline</label>
      <select name="timeline" value={formData.timeline} onChange={handleChange} required>
        <option value="">Select</option>
        <option>Immediate</option>
        <option>1–3 months</option>
        <option>6+ months</option>
      </select>


      <label>Additional Notes</label>
      <textarea
        name="additional_notes"
        value={formData.additional_notes}
        onChange={handleChange}
      />

      <button type="submit">Submit</button>

      {status && <p>{status}</p>}
    </form>
  );
}