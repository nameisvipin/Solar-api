import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../assets/styles/Home.css';

// The base URL for your API. Replace if it's different.
const API_BASE_URL = 'https://test.bsesbrpl.co.in/solar_api';

const HomePage = () => {
  const navigate = useNavigate();
  
  // State to manage which API tab is currently active
  const [activeTab, setActiveTab] = useState('latLong');
  
  // State for loading indicators and API responses
  const [loading, setLoading] = useState(false);
  const [apiResponse, setApiResponse] = useState(null);
  const [apiError, setApiError] = useState('');
  const [showToast, setShowToast] = useState(false);

  // State for the input fields of each form
  const [latLongCa, setLatLongCa] = useState('');
  const [caDetailsCa, setCaDetailsCa] = useState('');
  const [solarEstCa, setSolarEstCa] = useState('');
  const [solarPlantCap, setSolarPlantCap] = useState('');

  const handleLogout = () => {
    sessionStorage.removeItem('token');
    navigate('/login');
  };

  // Generic API calling function
  const callApi = async (endpoint, data) => {
    setLoading(true);
    setApiResponse(null);
    setApiError('');

    const token = sessionStorage.getItem('token');
    if (!token) {
      setApiError('Authorization token not found. Please log in again.');
      setLoading(false);
      navigate('/login');
      return;
    }

    try {
      const response = await axios.post(`${API_BASE_URL}${endpoint}`, data, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      setApiResponse(response.data);
    } catch (error) {
      if (error.response) {
        setApiError(`Error ${error.response.status}: ${error.response.data.Message || 'An error occurred.'}`);
      } else if (error.request) {
        setApiError('Network Error: Could not connect to the API server.');
      } else {
        setApiError(`An unexpected error occurred: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGetLatLong = (e) => {
    e.preventDefault();
    callApi('/API/SOLARAPI/GET_LAT_LONG_BY_CA_AUTH', { CA_NO: latLongCa });
  };

  const handleGetCaDetails = (e) => {
    e.preventDefault();
    callApi('/API/SOLARAPI/Z_BAPI_DSS_ISU_CA_DETAILS_AUTH', { CA_NO: caDetailsCa });
  };

  const handleGetSolarEst = (e) => {
    e.preventDefault();
    callApi('/API/SOLARAPI/Z_BAPI_BI_SOLAR_EST_AUTH', { CA: solarEstCa, SOLAR_PLANT_CAP: solarPlantCap });
  };

  // Function to copy the API response to clipboard
  const handleCopyResponse = () => {
    if (apiResponse) {
      navigator.clipboard.writeText(JSON.stringify(apiResponse, null, 2))
        .then(() => {
          setShowToast(true);
          setTimeout(() => setShowToast(false), 3000); // Hide toast after 3 seconds
        })
        .catch((err) => console.error('Failed to copy: ', err));
    }
  };

  // Function to render the correct form based on the active tab
  const renderApiForm = () => {
    switch (activeTab) {
      case 'latLong':
        return (
          <form onSubmit={handleGetLatLong}>
            <h2>Get Latitude & Longitude by CA Number</h2>
            <p>Fetches the geographical coordinates for a given CA number.</p>
            <div className="input-group">
              <label htmlFor="latLongCa">CA Number</label>
              <input 
                id="latLongCa" 
                type="text" 
                value={latLongCa}
                onChange={(e) => setLatLongCa(e.target.value)}
                placeholder="e.g., 100003291"
              />
            </div>
            <button type="submit" disabled={loading}>Fetch Coordinates</button>
          </form>
        );
      case 'caDetails':
        return (
          <form onSubmit={handleGetCaDetails}>
            <h2>Get CA Details</h2>
            <p>Retrieves detailed information for a given CA number from SAP ISU.</p>
            <div className="input-group">
              <label htmlFor="caDetailsCa">CA Number</label>
              <input 
                id="caDetailsCa" 
                type="text" 
                value={caDetailsCa}
                onChange={(e) => setCaDetailsCa(e.target.value)}
                placeholder="e.g., 000100003291"
              />
            </div>
            <button type="submit" disabled={loading}>Fetch Details</button>
          </form>
        );
      case 'solarEst':
        return (
          <form onSubmit={handleGetSolarEst}>
            <h2>Get Solar Estimation</h2>
            <p>Gets solar plant estimation data based on a CA number and plant capacity.</p>
            <div className="input-group">
              <label htmlFor="solarEstCa">CA Number</label>
              <input 
                id="solarEstCa" 
                type="text" 
                value={solarEstCa}
                onChange={(e) => setSolarEstCa(e.target.value)}
                placeholder="e.g., 100000017"
              />
            </div>
            <div className="input-group">
              <label htmlFor="solarPlantCap">Solar Plant Capacity (kW)</label>
              <input 
                id="solarPlantCap" 
                type="text" 
                value={solarPlantCap}
                onChange={(e) => setSolarPlantCap(e.target.value)}
                placeholder="e.g., 3"
              />
            </div>
            <button type="submit" disabled={loading}>Fetch Estimation</button>
          </form>
        );
      default:
        return null;
    }
  };

  return (
    <div className="home-container">
      <nav className="navbar">
        <div className="navbar-logo">
          <img
              src="/solar.svg"
              alt="Solar API Logo"
              className="navbar-logo-icon"
            />
            <span>Solar API Portal</span>
        </div>
        <button onClick={handleLogout} className="logout-button">Logout</button>
      </nav>
      <main className="api-tester-main">
        <div className="api-controls">
          <div className="api-tabs">
            <button 
              className={activeTab === 'latLong' ? 'active' : ''} 
              onClick={() => setActiveTab('latLong')}>
              Lat/Long by CA
            </button>
            <button 
              className={activeTab === 'caDetails' ? 'active' : ''} 
              onClick={() => setActiveTab('caDetails')}>
              CA Details
            </button>
            <button 
              className={activeTab === 'solarEst' ? 'active' : ''} 
              onClick={() => setActiveTab('solarEst')}>
              Solar Estimation
            </button>
          </div>
          <div className="api-form-container">
            {renderApiForm()}
          </div>
        </div>
        <div className="api-response-area">
          <h2>API Response</h2>
          {loading && <div className="loader"></div>}
          {apiError && <div className="error-box">{apiError}</div>}
          {apiResponse && (
            <div className="response-wrapper">
              <pre className="response-box">
                {JSON.stringify(apiResponse, null, 2)}
              </pre>
              <button className="copy-button" onClick={handleCopyResponse} title="Copy to clipboard">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M4 1.5H3a2 2 0 0 0-2 2V14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3.5a2 2 0 0 0-2-2h-1v1h1a1 1 0 0 1 1 1V14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1h1v-1z"/>
                  <path d="M9.5 1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5h3zm-3-1A1.5 1.5 0 0 0 5 1.5v1A1.5 1.5 0 0 0 6.5 4h3A1.5 1.5 0 0 0 11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3z"/>
                </svg>
              </button>
            </div>
          )}
          {!loading && !apiError && !apiResponse && (
            <p className="placeholder-text">The API response will appear here once you make a request.</p>
          )}
          {showToast && (
            <div className="toast-notification">
              Copied to clipboard!
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default HomePage;