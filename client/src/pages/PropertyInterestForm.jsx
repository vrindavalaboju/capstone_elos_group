import { useState } from 'react';
import { supabase } from '../supabaseClient';
import '../assets/PropertyInterestForm.css';

export default function PropertyInterestForm({ user }) {
  const [formData, setFormData] = useState({
    property_type: '',
    purpose: '',
    location_preferences: '',
    budget: '',
    financing_needs: false,
    financing_details: '',
    timeline: '',
    existing_property: false,
    existing_property_location: '',
    additional_requests: '',
  });

  const [status, setStatus] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      setStatus('You must be logged in to submit this form.');
      return;
    }

    const insertData = {
      ...formData,
      budget: formData.budget ? Number(formData.budget) : null,
      user_id: user.id,
    };

    const { error } = await supabase.from('property_interest_forms').insert([insertData]);

    if (error) {
      setStatus('Submission failed: ' + error.message);
    } else {
      setStatus('Submitted successfully!');
      setFormData({
        property_type: '',
        purpose: '',
        location_preferences: '',
        budget: '',
        financing_needs: false,
        financing_details: '',
        timeline: '',
        existing_property: false,
        existing_property_location: '',
        additional_requests: '',
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="property-form">
      <h2>Property Interest Form</h2>

      <label>Type of Property</label>
      <select name="property_type" value={formData.property_type} onChange={handleChange} required>
        <option value="">Select</option>
        <option>Land</option>
        <option>House</option>
        <option>Apartment</option>
        <option>Commercial</option>
      </select>

      <label>Purpose</label>
      <select name="purpose" value={formData.purpose} onChange={handleChange} required>
        <option value="">Select</option>
        <option>Buy</option>
        <option>Rent</option>
        <option>Manage Existing</option>
      </select>

      <label>Location Preferences</label>
      <input
        type="text"
        name="location_preferences"
        value={formData.location_preferences}
        onChange={handleChange}
        required
      />

      <label>Budget</label>
      <input
        type="number"
        name="budget"
        value={formData.budget}
        onChange={handleChange}
        required
        min="0"
        step="any"
      />

      <label>
        <input
          type="checkbox"
          name="financing_needs"
          checked={formData.financing_needs}
          onChange={handleChange}
        />
        Do you need financing?
      </label>

      {formData.financing_needs && (
        <>
          <label>Bank or Support Request</label>
          <input
            type="text"
            name="financing_details"
            value={formData.financing_details}
            onChange={handleChange}
          />
        </>
      )}

      <label>Timeline</label>
      <select name="timeline" value={formData.timeline} onChange={handleChange} required>
        <option value="">Select</option>
        <option>Immediate</option>
        <option>1–3 months</option>
        <option>6+ months</option>
      </select>

      <label>
        <input
          type="checkbox"
          name="existing_property"
          checked={formData.existing_property}
          onChange={handleChange}
        />
        Do you have an existing property to manage?
      </label>

      {formData.existing_property && (
        <>
          <label>Existing Property Location</label>
          <input
            type="text"
            name="existing_property_location"
            value={formData.existing_property_location}
            onChange={handleChange}
          />
        </>
      )}

      <label>Additional Requests / Comments</label>
      <textarea
        name="additional_requests"
        value={formData.additional_requests}
        onChange={handleChange}
      />

      <button type="submit">Submit</button>

      {status && <p>{status}</p>}
    </form>
  );
}
