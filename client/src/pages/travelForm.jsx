import { useState } from 'react';
import { supabase } from '../supabaseClient';
import '../assets/PropertyInterestForm.css';

export default function TravelForm({ user }) {
  const [formData, setFormData] = useState({
    purpose: '',
    dates: '',
    num_travelers: '',
    airport_pickup: false,
    accommodation: '',
    car_rental: false,
    document_support: false,
    phone_banking_setup: false,
    city_orientation: false,
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      setStatus('You must be logged in to submit this form.');
      return;
    }

    const insertData = {
      ...formData,
      num_travelers: formData.num_travelers ? Number(formData.num_travelers) : null,
      user_id: user.id,
    };

    const { error } = await supabase.from('travel_forms').insert([insertData]);

    if (error) {
      setStatus('Submission failed: ' + error.message);
    } else {
      setStatus('Submitted successfully!');
      setFormData({
        purpose: '',
        dates: '',
        num_travelers: '',
        airport_pickup: false,
        accommodation: '',
        car_rental: false,
        document_support: false,
        phone_banking_setup: false,
        city_orientation: false,
        additional_notes: '',
      });
    }
  };

  const [estimate, setEstimate] = useState('');
  const [loadingEstimate, setLoadingEstimate] = useState(false);

  const fetchEstimate = async () => {
    if (!formData.accommodation || !formData.num_travelers || !formData.dates) {
      setEstimate("Please fill in accommodation, number of travelers, and dates to get an estimate.");
      return;
    }

    const season = formData.dates.toLowerCase().includes("july") || formData.dates.toLowerCase().includes("august")
      ? "summer"
      : "other";

    setLoadingEstimate(true);
    setEstimate('');

    try {
      const res = await fetch("http://localhost:8000/api/estimate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          location: "Ethiopia", // You can make this dynamic later
          accommodation: formData.accommodation,
          people: formData.num_travelers,
          season: season
        })
      });

      const data = await res.json();
      if (data.estimate) {
        setEstimate(data.estimate);
      } else {
        setEstimate("Failed to fetch estimate.");
      }
    } catch (err) {
      setEstimate("Error contacting the travel estimator.");
    }

    setLoadingEstimate(false);
  };


  return (
    <div className="form-container">
      <form onSubmit={handleSubmit} className="property-form">
        <h2>Travel & Relocation Form</h2>

        <label>Purpose of Travel</label>
        <select name="purpose" value={formData.purpose} onChange={handleChange} required>
          <option value="">Select</option>
          <option>Visit</option>
          <option>Move</option>
          <option>Vacation</option>
          <option>Work</option>
        </select>

        <label>Dates of Travel</label>
        <input
          type="text"
          name="dates"
          value={formData.dates}
          onChange={handleChange}
          placeholder="e.g. July 10 - July 20"
          required
        />

        <label>Number of Travelers</label>
        <input
          type="number"
          name="num_travelers"
          value={formData.num_travelers}
          onChange={handleChange}
          required
          min="1"
        />

        <label>
          <input
            type="checkbox"
            name="airport_pickup"
            checked={formData.airport_pickup}
            onChange={handleChange}
          />
          Airport Pickup?
        </label>

        <label>Accommodation Needed</label>
        <select
          name="accommodation"
          value={formData.accommodation}
          onChange={handleChange}
          required
        >
          <option value="">Select</option>
          <option>Hotel</option>
          <option>Guesthouse</option>
          <option>Long-Term</option>
        </select>

        <label>
          <input
            type="checkbox"
            name="car_rental"
            checked={formData.car_rental}
            onChange={handleChange}
          />
          Car Rental?
        </label>

        <label>
          <input
            type="checkbox"
            name="document_support"
            checked={formData.document_support}
            onChange={handleChange}
          />
          Document Support? (Visa, ID, etc.)
        </label>

        <label>
          <input
            type="checkbox"
            name="phone_banking_setup"
            checked={formData.phone_banking_setup}
            onChange={handleChange}
          />
          Phone & Banking Setup?
        </label>

        <label>
          <input
            type="checkbox"
            name="city_orientation"
            checked={formData.city_orientation}
            onChange={handleChange}
          />
          City Orientation Needed?
        </label>

        <label>Additional Services or Notes</label>
        <textarea
          name="additional_notes"
          value={formData.additional_notes}
          onChange={handleChange}
        />

        <button type="button" onClick={fetchEstimate}>
          {loadingEstimate ? "Estimating..." : "Get Travel Estimate"}
        </button>

        <button type="submit">Submit</button>

        {status && <p>{status}</p>}
      </form>

      {estimate && (
        <div className="travel-estimate">
          <h3>Estimated Travel Cost</h3>
          <p>{estimate}</p>
        </div>
      )}
    </div>
  );

}
