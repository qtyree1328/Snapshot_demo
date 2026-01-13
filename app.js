// Snapshot Questionnaire Application
// Main application logic with state management and SnapshotSDK integration

import { STEPS, STEP_ORDER, QUESTIONS, getVisibleSteps, getCurrentStepIndex, getTotalSteps } from './questionnaire-config.js';
import { checkIdealEligibility, getStateAbbreviation, STATE_REGULATION_DATA, STATE_NAMES, getDeregulationCategory } from './deregulated-states.js';
import { shouldShowIdealQuestions, determinePathways, getPartnerRecommendations, PARTNERS, THRESHOLDS } from './partners.js';
import { SnapshotSDK } from './Reference_files/snapshot-sdk.js';

// Initialize SDK
SnapshotSDK.init({ debug: false });

// ============================================
// STATE MANAGEMENT
// ============================================
class AppState {
  constructor() {
    this.currentStep = STEPS.PURPOSE;
    this.data = {
      purpose: [],
      realtor: null,
      ownershipType: null,
      interests: [],
      location: {
        lat: null,
        lng: null,
        address: null,
        state: null,
        confirmed: false
      },
      propertyDetails: {
        // Basic fields
        type: '',
        zoning: '',
        energySource: '',
        acres: 5,
        sqft: 5000,
        buildings: 1,
        yearBuilt: 2000,
        // Additional fields
        ownsProperty: '',
        buildingUse: '',
        stories: 2,
        flatAcres: 0,
        voltage: '',
        electricUtility: '',
        retailEnergyProvider: '',
        utilityMeters: 1,
        monthlyElectricSpend: 500,
        taxLots: 1,
        hasDebt: '',
        utilityTariff: '',
        energyCharges: 0.12,
        demandCharges: 15,
        loadGrowth: '',
        roofRights: '',
        roofMaterial: '',
        roofLastReplaced: 2015,
        roofWarranty: 2030,
        plannedRenovations: ''
      },
      bills: {
        electricity: 200,
        gas: 100
      },
      documents: {
        loa: null,
        loe: null,
        bill: null,
        contract: null
      },
      confirmedInterests: [],
      selectedPartners: [],
      email: '',
      pathways: [],
      analysisResults: null
    };
    this.deregulationStatus = null;
    this.loadFromStorage();
  }

  loadFromStorage() {
    try {
      const saved = localStorage.getItem('snapshot_questionnaire');
      if (saved) {
        const parsed = JSON.parse(saved);
        this.data = { ...this.data, ...parsed.data };
        this.currentStep = parsed.currentStep || STEPS.PURPOSE;
        this.deregulationStatus = parsed.deregulationStatus || null;
      }
    } catch (e) {
      console.warn('Could not load from storage', e);
    }
  }

  saveToStorage() {
    try {
      localStorage.setItem('snapshot_questionnaire', JSON.stringify({
        data: this.data,
        currentStep: this.currentStep,
        deregulationStatus: this.deregulationStatus
      }));
    } catch (e) {
      console.warn('Could not save to storage', e);
    }
  }

  update(key, value) {
    if (key.includes('.')) {
      const keys = key.split('.');
      let obj = this.data;
      for (let i = 0; i < keys.length - 1; i++) {
        obj = obj[keys[i]];
      }
      obj[keys[keys.length - 1]] = value;
    } else {
      this.data[key] = value;
    }
    this.saveToStorage();
  }

  get(key) {
    if (key.includes('.')) {
      const keys = key.split('.');
      let obj = this.data;
      for (const k of keys) {
        obj = obj?.[k];
      }
      return obj;
    }
    return this.data[key];
  }
}

// Global state instance
const state = new AppState();

// ============================================
// MAP MANAGEMENT
// ============================================
let map = null;
let marker = null;
let markerDraggable = false;

function initMap() {
  if (map) return;

  map = new maplibregl.Map({
    container: 'map',
    style: {
      version: 8,
      sources: {
        'esri-sat': {
          type: 'raster',
          tiles: ['https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'],
          tileSize: 256,
          attribution: 'Esri, Maxar, Earthstar Geographics'
        }
      },
      layers: [{
        id: 'esri-sat',
        type: 'raster',
        source: 'esri-sat'
      }]
    },
    center: [-98.5, 39.5],
    zoom: 4
  });

  map.addControl(new maplibregl.NavigationControl(), 'top-right');
}

function setMapLocation(lng, lat, zoom = 15) {
  if (!map) return;

  map.flyTo({ center: [lng, lat], zoom });

  if (marker) {
    marker.remove();
  }

  // Create vertical pin marker
  const el = document.createElement('div');
  el.className = 'map-marker';
  el.innerHTML = `
    <svg width="32" height="48" viewBox="0 0 32 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M16 0C7.16 0 0 7.16 0 16C0 28 16 48 16 48C16 48 32 28 32 16C32 7.16 24.84 0 16 0Z" fill="#f97316"/>
      <circle cx="16" cy="16" r="8" fill="white"/>
    </svg>
  `;
  el.style.cssText = `
    cursor: ${markerDraggable ? 'grab' : 'default'};
    transform: translate(-50%, -100%);
  `;

  marker = new maplibregl.Marker({ element: el, draggable: markerDraggable, anchor: 'bottom' })
    .setLngLat([lng, lat])
    .addTo(map);

  if (markerDraggable) {
    marker.on('dragend', () => {
      const lngLat = marker.getLngLat();
      state.update('location.lat', lngLat.lat);
      state.update('location.lng', lngLat.lng);
      state.update('location.confirmed', false);
      reverseGeocode(lngLat.lng, lngLat.lat);
      updateLocationInfo();
    });
  }
}

function setMarkerDraggable(draggable) {
  markerDraggable = draggable;
  if (marker) {
    marker.setDraggable(draggable);
    marker.getElement().style.cursor = draggable ? 'grab' : 'default';
  }
}

async function searchAddress(query) {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1&countrycodes=us`
    );
    const results = await response.json();

    if (results.length === 0) {
      showToast('Location not found. Please try a different address.', 'error');
      return false;
    }

    const result = results[0];
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);

    state.update('location.lat', lat);
    state.update('location.lng', lng);
    state.update('location.address', result.display_name);
    state.update('location.confirmed', false);

    // Extract state from address
    await reverseGeocode(lng, lat);

    setMapLocation(lng, lat);
    updateLocationInfo();

    return true;
  } catch (error) {
    console.error('Search error:', error);
    showToast('Search failed. Please try again.', 'error');
    return false;
  }
}

async function reverseGeocode(lng, lat) {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10`
    );
    const result = await response.json();

    if (result.address) {
      state.update('location.address', result.display_name);

      // Get state abbreviation
      const stateName = result.address.state;
      const stateAbbr = getStateAbbreviation(stateName);
      state.update('location.state', stateAbbr);

      // Check deregulation status
      if (stateAbbr) {
        state.deregulationStatus = checkIdealEligibility(stateAbbr);
        state.saveToStorage();
      }
    }
  } catch (error) {
    console.error('Reverse geocode error:', error);
  }
}

function updateLocationInfo() {
  const infoEl = document.getElementById('location-info');
  if (!infoEl) return;

  const { lat, lng, address, state: stateAbbr, confirmed } = state.data.location;

  if (lat && lng) {
    let html = `
      <strong>Address:</strong> ${address || 'Unknown'}<br>
      <strong>Coordinates:</strong> ${lat.toFixed(5)}, ${lng.toFixed(5)}<br>
      <strong>State:</strong> ${stateAbbr || 'Unknown'}
    `;

    if (stateAbbr && state.deregulationStatus) {
      const eligible = state.deregulationStatus.eligible;
      html += `
        <div class="deregulated-badge ${eligible ? 'eligible' : 'not-eligible'}">
          ${eligible ? 'Deregulated energy market' : 'Regulated energy market'}
        </div>
      `;
    }

    infoEl.innerHTML = html;
    infoEl.style.display = 'block';
  } else {
    infoEl.style.display = 'none';
  }

  // Update confirm button state
  const confirmBtn = document.getElementById('confirm-location-btn');
  if (confirmBtn) {
    if (confirmed) {
      confirmBtn.textContent = 'Location Confirmed';
      confirmBtn.classList.add('confirmed');
    } else {
      confirmBtn.textContent = 'Confirm Location';
      confirmBtn.classList.remove('confirmed');
    }
  }

  validateCurrentStep();
}

// ============================================
// RENDERING
// ============================================
function renderStep() {
  const container = document.getElementById('question-container');
  const question = QUESTIONS[state.currentStep];

  if (!question) {
    console.error('Unknown step:', state.currentStep);
    return;
  }

  let html = '';

  switch (question.type) {
    case 'radio':
      html = renderRadioQuestion(question);
      break;
    case 'checkbox':
      html = renderCheckboxQuestion(question);
      break;
    case 'address':
      html = renderAddressQuestion(question);
      break;
    case 'form':
      html = renderFormQuestion(question);
      break;
    case 'upload':
      html = renderUploadQuestion(question);
      break;
    case 'report':
      html = renderReportCard();
      break;
    case 'interest_confirm':
      html = renderInterestConfirmQuestion(question);
      break;
    case 'partner_selection':
      html = renderPartnerSelectionQuestion(question);
      break;
    case 'email':
      html = renderEmailQuestion(question);
      break;
    default:
      html = `<p>Unknown question type: ${question.type}</p>`;
  }

  container.innerHTML = html;
  container.classList.add('fade-in');

  // Initialize map if needed
  if (question.type === 'address') {
    setTimeout(() => {
      initMap();
      if (state.data.location.lat && state.data.location.lng) {
        setMapLocation(state.data.location.lng, state.data.location.lat);
        updateLocationInfo();
      }
    }, 100);
  }

  // Attach event listeners
  attachEventListeners();
  updateProgress();
  updateNavigation();
  validateCurrentStep();
}

function renderRadioQuestion(question) {
  const selectedValue = state.data[question.id];

  return `
    <div class="question-header">
      <h1 class="question-title">${question.title}</h1>
      <p class="question-subtitle">${question.subtitle}</p>
    </div>
    <div class="options-grid">
      ${question.options.map(opt => `
        <label class="option-card ${selectedValue === opt.value ? 'selected' : ''}" data-value="${opt.value}">
          <input type="radio" name="${question.id}" value="${opt.value}" ${selectedValue === opt.value ? 'checked' : ''}>
          <div class="option-content">
            <div class="option-label">${opt.label}</div>
            <div class="option-description">${opt.description}</div>
          </div>
          <span class="option-indicator"></span>
        </label>
      `).join('')}
    </div>
  `;
}

function renderCheckboxQuestion(question) {
  const selectedValues = state.data[question.id] || [];

  return `
    <div class="question-header">
      <h1 class="question-title">${question.title}</h1>
      <p class="question-subtitle">${question.subtitle}</p>
    </div>
    <div class="options-grid">
      ${question.options.map(opt => `
        <label class="option-card checkbox ${selectedValues.includes(opt.value) ? 'selected' : ''}" data-value="${opt.value}">
          <input type="checkbox" name="${question.id}" value="${opt.value}" ${selectedValues.includes(opt.value) ? 'checked' : ''}>
          <div class="option-content">
            <div class="option-label">
              ${opt.label}
              ${opt.popup ? `<button class="info-button" data-popup='${JSON.stringify(opt.popup)}'>?</button>` : ''}
            </div>
            <div class="option-description">${opt.description}</div>
          </div>
          <span class="option-indicator"></span>
        </label>
      `).join('')}
    </div>
  `;
}

function renderAddressQuestion(question) {
  const { address, confirmed } = state.data.location;

  return `
    <div class="question-header">
      <h1 class="question-title">${question.title}</h1>
      <p class="question-subtitle">${question.subtitle}</p>
    </div>
    <div class="address-section">
      <div class="address-input-wrapper">
        <input type="text" class="address-input" id="address-input" placeholder="Enter address, city, or coordinates" value="${address || ''}">
        <button class="search-button" id="search-address-btn">Search</button>
      </div>
    </div>
    <div class="map-container">
      <div id="map"></div>
    </div>
    <div class="map-controls">
      <button class="map-button" id="modify-pin-btn">Modify Pin</button>
      <button class="map-button primary ${confirmed ? 'confirmed' : ''}" id="confirm-location-btn">
        ${confirmed ? 'Location Confirmed' : 'Confirm Location'}
      </button>
    </div>
    <div class="location-info" id="location-info" style="display: none;"></div>
  `;
}

function renderFormQuestion(question) {
  let html = `
    <div class="question-header">
      <h1 class="question-title">${question.title}</h1>
      <p class="question-subtitle">${question.subtitle}</p>
    </div>
    <div class="form-grid">
      ${question.fields.map(field => renderFormField(field, question.id)).join('')}
    </div>
  `;

  // Render additional fields section if present
  if (question.additionalFields) {
    html += `
      <div class="additional-fields-section">
        <div class="additional-fields-header">
          <h2 class="additional-fields-title">${question.additionalFields.header}</h2>
          <p class="additional-fields-subtitle">${question.additionalFields.subtitle}</p>
        </div>
        <div class="form-grid">
          ${question.additionalFields.fields.map(field => renderFormField(field, question.id)).join('')}
        </div>
      </div>
    `;
  }

  return html;
}

function renderFormField(field, questionId) {
  const dataKey = questionId === 'energy_bills' ? 'bills' : 'propertyDetails';
  const value = state.data[dataKey][field.id];

  if (field.type === 'slider') {
    const displayValue = value !== null ? value : field.default;
    return `
      <div class="form-field">
        <div class="slider-container">
          <div class="slider-header">
            <label class="form-label">${field.label}</label>
            <span class="slider-value" id="${field.id}-value">${field.format(displayValue)}</span>
          </div>
          <input type="range" class="slider-input" id="${field.id}"
            min="${field.min}" max="${field.max}" step="${field.step}" value="${displayValue}"
            data-format="${field.id}">
          <div class="slider-range">
            <span>${field.format(field.min)}</span>
            <span>${field.format(field.max)}</span>
          </div>
        </div>
      </div>
    `;
  }

  if (field.type === 'slider_input') {
    const hasValue = value !== null && value !== undefined;
    const displayValue = hasValue ? value : '';
    const sliderValue = hasValue ? value : field.min;
    return `
      <div class="form-field">
        <div class="slider-input-container">
          <label class="form-label">${field.label}</label>
          <div class="slider-with-input">
            <input type="range" class="slider-range-input" id="${field.id}-slider"
              min="${field.min}" max="${field.max}" step="${field.step}" value="${sliderValue}"
              data-field="${field.id}" ${!hasValue ? 'disabled' : ''}>
            <div class="slider-text-input-wrapper">
              ${field.prefix ? `<span class="input-prefix">${field.prefix}</span>` : ''}
              <input type="text" class="slider-text-input" id="${field.id}"
                value="${displayValue}" placeholder="${field.placeholder || ''}"
                data-min="${field.min}" data-max="${field.max}" data-step="${field.step}">
            </div>
          </div>
        </div>
      </div>
    `;
  }

  if (field.type === 'select') {
    return `
      <div class="form-field">
        <label class="form-label">${field.label}</label>
        <select class="form-select" id="${field.id}">
          ${field.options.map(opt => `
            <option value="${opt.value}" ${value === opt.value ? 'selected' : ''}>${opt.label}</option>
          `).join('')}
        </select>
      </div>
    `;
  }

  if (field.type === 'text') {
    return `
      <div class="form-field">
        <label class="form-label">${field.label}</label>
        <input type="text" class="form-text-input" id="${field.id}"
          value="${value || ''}" placeholder="${field.placeholder || ''}">
      </div>
    `;
  }

  return '';
}

function renderUploadQuestion(question) {
  return `
    <div class="question-header">
      <h1 class="question-title">${question.title}</h1>
      <p class="question-subtitle">${question.subtitle}</p>
    </div>
    <div class="upload-grid">
      ${question.fields.map(field => {
        const file = state.data.documents[field.id];
        return `
          <div class="upload-field ${file ? 'has-file' : ''}" data-field="${field.id}">
            <input type="file" id="${field.id}" accept="${field.accept}">
            <div class="upload-icon">${file ? 'Uploaded' : 'Upload'}</div>
            <div class="upload-label">${field.label}${field.optional ? ' (Optional)' : ''}</div>
            <div class="upload-description">${field.description}</div>
            ${file ? `<div class="upload-filename">${file.name}</div>` : ''}
          </div>
        `;
      }).join('')}
    </div>
    ${question.contactInfo ? `
      <div class="contact-card">
        <div class="contact-title">${question.contactInfo.title}</div>
        <div class="contact-info">
          <div>Email: <a href="mailto:${question.contactInfo.email}">${question.contactInfo.email}</a></div>
          <div>Phone: ${question.contactInfo.phone}</div>
        </div>
      </div>
    ` : ''}
  `;
}

function renderReportCard() {
  const results = state.data.analysisResults;
  const pathways = state.data.pathways;
  const recommendations = getPartnerRecommendations(pathways, state.data);

  if (!results) {
    return `
      <div class="question-header">
        <h1 class="question-title">Analyzing Your Property</h1>
        <p class="question-subtitle">Please wait while we analyze your location...</p>
      </div>
    `;
  }

  const solarScore = results.solarScore || 0;
  const dcScore = results.dcScore || 0;
  const solarRating = getSolarRating(solarScore);
  const dcRating = getDCRating(dcScore);

  return `
    <div class="report-container">
      <div class="report-header">
        <h2>Your Property Analysis Report</h2>
        <p>${state.data.location.address || 'Location analyzed'}</p>
      </div>

      ${results.fatalFlaws?.length ? `
        <div class="report-section">
          <div class="fatal-flaw-alert">
            <div class="fatal-flaw-title">Fatal Flaws Detected</div>
            <div class="fatal-flaw-list">
              ${results.fatalFlaws.map(f => `<div>&bull; ${f}</div>`).join('')}
            </div>
          </div>
        </div>
      ` : ''}

      ${results.warnings?.length ? `
        <div class="report-section">
          <div class="warning-alert">
            <div class="warning-title">Concerns Identified</div>
            <div class="warning-list">
              ${results.warnings.map(w => `<div>&bull; ${w}</div>`).join('')}
            </div>
          </div>
        </div>
      ` : ''}

      <div class="scores-grid">
        <div class="score-card">
          <div class="score-label">Solar Score</div>
          <div class="score-value ${solarRating.class}">${solarScore}</div>
          <div class="score-rating ${solarRating.class}">${solarRating.label}</div>
        </div>
        <div class="score-card">
          <div class="score-label">Data Center Score</div>
          <div class="score-value ${dcRating.class}">${dcScore}</div>
          <div class="score-rating ${dcRating.class}">${dcRating.label}</div>
        </div>
      </div>

      <div class="report-section">
        <div class="report-section-title">Infrastructure Summary</div>
        <div class="report-grid">
          <div class="report-item">
            <span class="report-item-label">Nearest Transmission</span>
            <span class="report-item-value">${results.nearestTransmission || 'N/A'}</span>
          </div>
          <div class="report-item">
            <span class="report-item-label">Highest Voltage</span>
            <span class="report-item-value">${results.highestVoltage || 'N/A'}</span>
          </div>
          <div class="report-item">
            <span class="report-item-label">Nearest Substation</span>
            <span class="report-item-value">${results.nearestSubstation || 'N/A'}</span>
          </div>
          <div class="report-item">
            <span class="report-item-label">Pipeline Access</span>
            <span class="report-item-value">${results.pipelineCount || 0} segments</span>
          </div>
        </div>
      </div>

      <div class="report-section">
        <div class="report-section-title">Environmental Summary</div>
        <div class="report-grid">
          <div class="report-item">
            <span class="report-item-label">Flood Zone</span>
            <span class="report-item-value">${results.floodZone || 'None detected'}</span>
          </div>
          <div class="report-item">
            <span class="report-item-label">Wetlands</span>
            <span class="report-item-value">${results.wetlandsCount || 0} areas</span>
          </div>
          <div class="report-item">
            <span class="report-item-label">Protected Areas</span>
            <span class="report-item-value">${results.protectedCount || 0} areas</span>
          </div>
          <div class="report-item">
            <span class="report-item-label">Critical Habitat</span>
            <span class="report-item-value">${results.critHabCount || 0} areas</span>
          </div>
        </div>
      </div>

      <div class="report-section">
        <div class="report-section-title">Solar Resource</div>
        <div class="report-grid">
          <div class="report-item">
            <span class="report-item-label">Solar GHI</span>
            <span class="report-item-value">${results.solarGHI?.toFixed(2) || 'N/A'} kWh/m&#178;/day</span>
          </div>
          <div class="report-item">
            <span class="report-item-label">Solar Rating</span>
            <span class="report-item-value">${getSolarResourceRating(results.solarGHI)}</span>
          </div>
        </div>
      </div>

      ${recommendations.length ? `
        <div class="report-section">
          <div class="report-section-title">Recommended Partners</div>
          <div class="partner-recommendations">
            ${recommendations.map(partner => `
              <div class="partner-card" style="border-color: ${partner.color}">
                <div class="partner-info">
                  <h4>${partner.name}</h4>
                  <p>${partner.description}</p>
                  ${partner.note ? `<p class="partner-note">${partner.note}</p>` : ''}
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}
    </div>
  `;
}

function renderEmailQuestion(question) {
  return `
    <div class="question-header">
      <h1 class="question-title">${question.title}</h1>
      <p class="question-subtitle">${question.subtitle}</p>
    </div>
    <div class="email-section">
      <div class="email-input-wrapper">
        <input type="email" class="email-input" id="email-input" placeholder="your@email.com" value="${state.data.email || ''}">
      </div>
      <p class="email-note">We'll send your complete property analysis and personalized partner recommendations to this address.</p>
    </div>
  `;
}

function renderInterestConfirmQuestion(question) {
  const interests = state.data.interests || [];
  const confirmedInterests = state.data.confirmedInterests || [];

  // Build options based on initial interests
  const options = [];

  if (interests.includes('home_energy') || interests.includes('unsure')) {
    options.push({
      value: 'home_energy',
      label: 'Building home energy',
      description: 'Solar panels, battery storage, energy procurement'
    });
  }

  if (interests.includes('home_systems') || interests.includes('unsure')) {
    options.push({
      value: 'home_systems',
      label: 'Improving home systems',
      description: 'HVAC upgrades, LED retrofit, efficiency improvements'
    });
  }

  // If both options are available, add a "both" option
  if (options.length >= 2) {
    options.push({
      value: 'both',
      label: 'Both options',
      description: 'I want to explore all available solutions'
    });
  }

  return `
    <div class="question-header">
      <h1 class="question-title">${question.title}</h1>
      <p class="question-subtitle">${question.subtitle}</p>
    </div>
    <div class="options-grid">
      ${options.map(opt => {
        const isSelected = confirmedInterests.includes(opt.value) ||
          (opt.value === 'both' && confirmedInterests.includes('home_energy') && confirmedInterests.includes('home_systems'));
        return `
          <label class="option-card interest-confirm ${isSelected ? 'selected' : ''}" data-value="${opt.value}">
            <input type="radio" name="interest_confirm" value="${opt.value}" ${isSelected ? 'checked' : ''}>
            <div class="option-content">
              <div class="option-label">${opt.label}</div>
              <div class="option-description">${opt.description}</div>
            </div>
            <span class="option-indicator"></span>
          </label>
        `;
      }).join('')}
    </div>
  `;
}

function renderPartnerSelectionQuestion(question) {
  const pathways = state.data.pathways || [];
  const selectedPartners = state.data.selectedPartners || [];
  const recommendations = getPartnerRecommendations(pathways, state.data);

  return `
    <div class="question-header">
      <h1 class="question-title">${question.title}</h1>
      <p class="question-subtitle">${question.subtitle}</p>
    </div>

    <div class="partner-selection-grid">
      ${recommendations.map(partner => `
        <div class="partner-selection-card ${selectedPartners.includes(partner.key) ? 'selected' : ''}" data-partner="${partner.key}">
          <div class="partner-selection-header" style="border-left: 4px solid ${partner.color}">
            <div class="partner-selection-checkbox">
              <input type="checkbox" id="partner-${partner.key}" ${selectedPartners.includes(partner.key) ? 'checked' : ''}>
              <span class="checkmark"></span>
            </div>
            <h3 class="partner-selection-name">${partner.name}</h3>
          </div>
          <div class="partner-selection-body">
            <p class="partner-selection-description">${partner.description}</p>
            ${partner.note ? `<p class="partner-selection-note">${partner.note}</p>` : ''}
            <div class="partner-selection-services">
              ${partner.services.slice(0, 3).map(s => `<span class="service-tag">${s}</span>`).join('')}
            </div>
          </div>
        </div>
      `).join('')}
    </div>

    <div class="email-section" style="margin-top: 32px;">
      <label class="form-label" style="display: block; margin-bottom: 8px;">Your email address</label>
      <div class="email-input-wrapper">
        <input type="email" class="email-input" id="email-input" placeholder="your@email.com" value="${state.data.email || ''}">
      </div>
      <p class="email-note">We'll connect you with your selected partners and send your property analysis report.</p>
    </div>
  `;
}

// ============================================
// EVENT HANDLERS
// ============================================
function attachEventListeners() {
  // Radio buttons
  document.querySelectorAll('.option-card:not(.checkbox)').forEach(card => {
    card.addEventListener('click', () => {
      const value = card.dataset.value;
      const input = card.querySelector('input');
      const questionId = input.name;

      document.querySelectorAll(`.option-card[data-value]`).forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');

      if (questionId === 'ownership') {
        state.update('ownershipType', value);
      } else {
        state.update(questionId, value);
      }

      validateCurrentStep();
    });
  });

  // Checkboxes
  document.querySelectorAll('.option-card.checkbox').forEach(card => {
    card.addEventListener('click', (e) => {
      // Prevent default label behavior (auto-toggling the checkbox)
      e.preventDefault();

      if (e.target.classList.contains('info-button')) return;

      const value = card.dataset.value;
      const input = card.querySelector('input');
      const questionId = input.name;

      // Toggle state
      const newCheckedState = !input.checked;
      input.checked = newCheckedState;
      card.classList.toggle('selected', newCheckedState);

      // Update state
      const currentValues = [...(state.data[questionId] || [])];
      if (newCheckedState) {
        if (!currentValues.includes(value)) {
          currentValues.push(value);
        }
      } else {
        const idx = currentValues.indexOf(value);
        if (idx > -1) currentValues.splice(idx, 1);
      }

      state.update(questionId, currentValues);
      validateCurrentStep();
    });
  });

  // Info popup buttons
  document.querySelectorAll('.info-button').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const popup = JSON.parse(btn.dataset.popup);
      showPopup(popup.title, popup.content);
    });
  });

  // Address search
  const searchBtn = document.getElementById('search-address-btn');
  const addressInput = document.getElementById('address-input');

  if (searchBtn) {
    searchBtn.addEventListener('click', async () => {
      const query = addressInput.value.trim();
      if (query) {
        searchBtn.disabled = true;
        searchBtn.textContent = 'Searching...';
        await searchAddress(query);
        searchBtn.disabled = false;
        searchBtn.textContent = 'Search';
      }
    });
  }

  if (addressInput) {
    addressInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        searchBtn?.click();
      }
    });
  }

  // Map controls
  const modifyBtn = document.getElementById('modify-pin-btn');
  const confirmBtn = document.getElementById('confirm-location-btn');

  if (modifyBtn) {
    modifyBtn.addEventListener('click', () => {
      setMarkerDraggable(true);
      state.update('location.confirmed', false);
      showToast('Drag the pin to adjust location');
      updateLocationInfo();
    });
  }

  if (confirmBtn) {
    confirmBtn.addEventListener('click', () => {
      if (state.data.location.lat && state.data.location.lng) {
        setMarkerDraggable(false);
        state.update('location.confirmed', true);
        showToast('Location confirmed!', 'success');
        updateLocationInfo();
        validateCurrentStep();
      }
    });
  }

  // Sliders (original type)
  document.querySelectorAll('.slider-input').forEach(slider => {
    slider.addEventListener('input', () => {
      const id = slider.id;
      const value = parseFloat(slider.value);
      const valueEl = document.getElementById(`${id}-value`);

      // Determine which data object to update
      const dataKey = state.currentStep === STEPS.ENERGY_BILLS ? 'bills' : 'propertyDetails';
      state.update(`${dataKey}.${id}`, value);

      // Update display
      if (valueEl) {
        const field = QUESTIONS[state.currentStep].fields.find(f => f.id === id);
        if (field) {
          valueEl.textContent = field.format(value);
        }
      }
    });
  });

  // Slider with text input (new type)
  document.querySelectorAll('.slider-text-input').forEach(textInput => {
    const id = textInput.id;
    const slider = document.getElementById(`${id}-slider`);

    // Text input handler
    textInput.addEventListener('input', () => {
      const rawValue = textInput.value.trim();
      const min = parseFloat(textInput.dataset.min);
      const max = parseFloat(textInput.dataset.max);

      // If empty, set to null
      if (rawValue === '' || rawValue.toLowerCase() === 'n/a') {
        state.update(`propertyDetails.${id}`, null);
        if (slider) {
          slider.value = min;
          slider.disabled = true;
        }
        return;
      }

      // Parse numeric value
      const numValue = parseFloat(rawValue.replace(/[,$]/g, ''));
      if (!isNaN(numValue)) {
        const clampedValue = Math.min(max, Math.max(min, numValue));
        state.update(`propertyDetails.${id}`, clampedValue);
        if (slider) {
          slider.value = clampedValue;
          slider.disabled = false;
        }
      }
    });

    // On blur, format the value properly
    textInput.addEventListener('blur', () => {
      const value = state.data.propertyDetails[id];
      if (value !== null && value !== undefined) {
        textInput.value = value;
      }
    });
  });

  // Slider range input (paired with text input)
  document.querySelectorAll('.slider-range-input').forEach(slider => {
    slider.addEventListener('input', () => {
      const fieldId = slider.dataset.field;
      const value = parseFloat(slider.value);
      const textInput = document.getElementById(fieldId);

      state.update(`propertyDetails.${fieldId}`, value);
      if (textInput) {
        textInput.value = value;
      }
    });
  });

  // Text inputs
  document.querySelectorAll('.form-text-input').forEach(input => {
    input.addEventListener('input', () => {
      const id = input.id;
      state.update(`propertyDetails.${id}`, input.value);
    });
  });

  // Selects
  document.querySelectorAll('.form-select').forEach(select => {
    select.addEventListener('change', () => {
      const id = select.id;
      const value = select.value;
      state.update(`propertyDetails.${id}`, value);
    });
  });

  // File uploads
  document.querySelectorAll('.upload-field').forEach(field => {
    const input = field.querySelector('input[type="file"]');

    field.addEventListener('click', () => {
      input.click();
    });

    input.addEventListener('change', () => {
      const file = input.files[0];
      const fieldId = field.dataset.field;

      if (file) {
        state.update(`documents.${fieldId}`, { name: file.name, size: file.size });

        // Update UI
        field.classList.add('has-file');
        field.querySelector('.upload-icon').textContent = 'Uploaded';

        let filenameEl = field.querySelector('.upload-filename');
        if (!filenameEl) {
          filenameEl = document.createElement('div');
          filenameEl.className = 'upload-filename';
          field.appendChild(filenameEl);
        }
        filenameEl.textContent = file.name;
      }
    });

    input.addEventListener('click', (e) => {
      e.stopPropagation();
    });
  });

  // Email input
  const emailInput = document.getElementById('email-input');
  if (emailInput) {
    emailInput.addEventListener('input', () => {
      state.update('email', emailInput.value);
      validateCurrentStep();
    });
  }

  // Interest confirmation options
  document.querySelectorAll('.option-card.interest-confirm').forEach(card => {
    card.addEventListener('click', () => {
      const value = card.dataset.value;

      // Deselect all and select clicked
      document.querySelectorAll('.option-card.interest-confirm').forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');

      // Update confirmed interests based on selection
      let confirmedInterests = [];
      if (value === 'both') {
        confirmedInterests = ['home_energy', 'home_systems'];
      } else {
        confirmedInterests = [value];
      }

      state.update('confirmedInterests', confirmedInterests);
      validateCurrentStep();
    });
  });

  // Partner selection cards
  document.querySelectorAll('.partner-selection-card').forEach(card => {
    card.addEventListener('click', (e) => {
      // Don't toggle if clicking the checkbox directly (it handles itself)
      if (e.target.type === 'checkbox') return;

      const partnerKey = card.dataset.partner;
      const checkbox = card.querySelector('input[type="checkbox"]');
      const currentPartners = state.data.selectedPartners || [];

      card.classList.toggle('selected');
      checkbox.checked = !checkbox.checked;

      if (checkbox.checked) {
        if (!currentPartners.includes(partnerKey)) {
          currentPartners.push(partnerKey);
        }
      } else {
        const idx = currentPartners.indexOf(partnerKey);
        if (idx > -1) currentPartners.splice(idx, 1);
      }

      state.update('selectedPartners', currentPartners);
      validateCurrentStep();
    });

    // Handle checkbox click directly
    const checkbox = card.querySelector('input[type="checkbox"]');
    if (checkbox) {
      checkbox.addEventListener('change', () => {
        const partnerKey = card.dataset.partner;
        const currentPartners = state.data.selectedPartners || [];

        if (checkbox.checked) {
          card.classList.add('selected');
          if (!currentPartners.includes(partnerKey)) {
            currentPartners.push(partnerKey);
          }
        } else {
          card.classList.remove('selected');
          const idx = currentPartners.indexOf(partnerKey);
          if (idx > -1) currentPartners.splice(idx, 1);
        }

        state.update('selectedPartners', currentPartners);
        validateCurrentStep();
      });
    }
  });
}

// ============================================
// NAVIGATION
// ============================================
function updateProgress() {
  const visibleSteps = getVisibleSteps(state.data, shouldShowIdealQuestions);
  const currentIndex = getCurrentStepIndex(state.currentStep, state.data, shouldShowIdealQuestions);
  const total = visibleSteps.length;

  document.getElementById('step-indicator').textContent = `${currentIndex}/${total}`;
  document.getElementById('progress-fill').style.width = `${(currentIndex / total) * 100}%`;
}

function updateNavigation() {
  const backBtn = document.getElementById('back-btn');
  const footerContent = document.getElementById('footer-buttons');
  const question = QUESTIONS[state.currentStep];
  const visibleSteps = getVisibleSteps(state.data, shouldShowIdealQuestions);
  const currentIndex = visibleSteps.indexOf(state.currentStep);

  // Back button
  backBtn.disabled = currentIndex === 0;

  // Footer buttons
  let buttonsHtml = '';

  // Show Submit button on final step (partner_selection or email)
  if (state.currentStep === STEPS.EMAIL || question.type === 'partner_selection') {
    buttonsHtml += '<button class="nav-button submit" id="next-btn">Submit</button>';
  } else {
    buttonsHtml += '<button class="nav-button next" id="next-btn" disabled>Next</button>';
  }

  footerContent.innerHTML = buttonsHtml;

  // Attach navigation handlers
  document.getElementById('next-btn').addEventListener('click', goNext);

  backBtn.addEventListener('click', goBack);
}

function validateCurrentStep() {
  const question = QUESTIONS[state.currentStep];
  const nextBtn = document.getElementById('next-btn');
  if (!nextBtn) return;

  let isValid = false;

  switch (question.type) {
    case 'radio':
      isValid = !!state.data[question.id] || !!state.data.ownershipType;
      break;
    case 'checkbox':
      isValid = (state.data[question.id]?.length || 0) > 0;
      break;
    case 'address':
      isValid = state.data.location.confirmed && state.data.location.lat && state.data.location.lng;
      break;
    case 'form':
    case 'upload':
      isValid = true; // Optional forms are always valid
      break;
    case 'report':
      isValid = !!state.data.analysisResults;
      break;
    case 'interest_confirm':
      isValid = (state.data.confirmedInterests?.length || 0) > 0;
      break;
    case 'partner_selection':
      isValid = (state.data.selectedPartners?.length || 0) > 0 && isValidEmail(state.data.email);
      break;
    case 'email':
      isValid = isValidEmail(state.data.email);
      break;
    default:
      isValid = true;
  }

  nextBtn.disabled = !isValid;
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email || '');
}

async function goNext() {
  const visibleSteps = getVisibleSteps(state.data, shouldShowIdealQuestions);
  const currentIndex = visibleSteps.indexOf(state.currentStep);
  const question = QUESTIONS[state.currentStep];

  // If we're about to go to the analysis step, run the analysis
  if (visibleSteps[currentIndex + 1] === STEPS.ANALYSIS) {
    await runAnalysis();
  }

  // If this is the final step (email or partner_selection), submit
  if (state.currentStep === STEPS.EMAIL || question.type === 'partner_selection') {
    await submitForm();
    return;
  }

  // Move to next step
  if (currentIndex < visibleSteps.length - 1) {
    state.currentStep = visibleSteps[currentIndex + 1];
    state.saveToStorage();
    renderStep();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

function goBack() {
  const visibleSteps = getVisibleSteps(state.data, shouldShowIdealQuestions);
  const currentIndex = visibleSteps.indexOf(state.currentStep);

  if (currentIndex > 0) {
    state.currentStep = visibleSteps[currentIndex - 1];
    state.saveToStorage();
    renderStep();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

// ============================================
// ANALYSIS INTEGRATION
// ============================================
async function runAnalysis() {
  showLoading(true);

  try {
    const { lat, lng } = state.data.location;
    const pt = turf.point([lng, lat]);

    // Define buffer distances
    const radInfra = 2.0; // miles
    const radEnv = 0.25; // miles

    const buffInfra = turf.circle(pt, radInfra, { units: 'miles' });
    const buffEnv = turf.circle(pt, radEnv, { units: 'miles' });
    const bboxInf = turf.bbox(buffInfra);
    const bboxEnv = turf.bbox(buffEnv);

    // Run parallel queries using SnapshotSDK
    const [trans, subs, pipe, wet, flood, prot, crithabFinal, crithabProposed, solarData, nriData] = await Promise.all([
      SnapshotSDK.esriQueryGeoJSON(SnapshotSDK.datasets.trans, bboxInf),
      SnapshotSDK.esriQueryGeoJSON(SnapshotSDK.datasets.subs, bboxInf),
      SnapshotSDK.esriQueryGeoJSON(SnapshotSDK.datasets.pipe, bboxInf),
      SnapshotSDK.esriQueryGeoJSON(SnapshotSDK.datasets.wetlands, bboxEnv),
      SnapshotSDK.esriQueryGeoJSON(SnapshotSDK.datasets.flood, bboxEnv),
      SnapshotSDK.esriQueryGeoJSON(SnapshotSDK.datasets.protected, bboxEnv),
      SnapshotSDK.esriQueryGeoJSON(SnapshotSDK.datasets.crithab_final_poly, bboxEnv),
      SnapshotSDK.esriQueryGeoJSON(SnapshotSDK.datasets.crithab_proposed_poly, bboxEnv),
      querySolarResource(lng, lat),
      queryNRI(lng, lat)
    ]);

    // Process results
    const safeIntersects = (f, geom) => {
      if (!f || !f.geometry) return false;
      try { return turf.booleanIntersects(f, geom); } catch (e) { return false; }
    };

    const filteredTrans = trans.filter(f => safeIntersects(f, buffInfra));
    const filteredSubs = subs.filter(f => safeIntersects(f, buffInfra));
    const filteredPipe = pipe.filter(f => safeIntersects(f, buffInfra));
    const filteredWet = wet.filter(f => safeIntersects(f, buffEnv));
    const filteredFlood = flood.filter(f => safeIntersects(f, buffEnv));
    const filteredProt = prot.filter(f => safeIntersects(f, buffEnv));
    const filteredCritFinal = crithabFinal.filter(f => safeIntersects(f, buffEnv));
    const filteredCritProposed = crithabProposed.filter(f => safeIntersects(f, buffEnv));

    // Calculate distances
    let nearestTransDist = Infinity;
    let highestVoltage = null;
    let highestVoltageRank = 0;

    filteredTrans.forEach(f => {
      try {
        const n = turf.nearestPointOnLine(f, pt, { units: 'miles' });
        if (n.properties.dist < nearestTransDist) {
          nearestTransDist = n.properties.dist;
        }
        const voltage = f.properties?.VOLTAGE || f.properties?.VOLT_CLASS;
        const rank = getVoltageRank(voltage);
        if (rank > highestVoltageRank) {
          highestVoltageRank = rank;
          highestVoltage = getVoltageCategory(voltage);
        }
      } catch (e) { }
    });

    let nearestSubDist = Infinity;
    let nearestSubName = null;
    filteredSubs.forEach(f => {
      try {
        const dist = turf.distance(pt, f, { units: 'miles' });
        if (dist < nearestSubDist) {
          nearestSubDist = dist;
          nearestSubName = f.properties?.NAME || f.properties?.SUBSTATION;
        }
      } catch (e) { }
    });

    // Calculate scores
    const { solarScore, dcScore, fatalFlaws, warnings } = calculateScores({
      trans: filteredTrans,
      subs: filteredSubs,
      pipe: filteredPipe,
      wet: filteredWet,
      flood: filteredFlood,
      prot: filteredProt,
      crithabFinal: filteredCritFinal,
      crithabProposed: filteredCritProposed,
      solarData,
      nriData,
      pt
    });

    // Get flood zone
    let floodZone = null;
    filteredFlood.forEach(f => {
      try {
        if (turf.booleanPointInPolygon(pt, f)) {
          floodZone = f.properties?.FLD_ZONE || 'Unknown';
        }
      } catch (e) { }
    });

    // Store results
    state.data.analysisResults = {
      solarScore,
      dcScore,
      solarGHI: solarData?.ghi,
      nearestTransmission: nearestTransDist < Infinity ? `${nearestTransDist.toFixed(1)} mi` : 'None nearby',
      highestVoltage: highestVoltage || 'N/A',
      nearestSubstation: nearestSubDist < Infinity ? `${nearestSubDist.toFixed(1)} mi` : 'None nearby',
      pipelineCount: filteredPipe.length,
      floodZone,
      wetlandsCount: filteredWet.length,
      protectedCount: filteredProt.length,
      critHabCount: filteredCritFinal.length + filteredCritProposed.length,
      fatalFlaws,
      warnings,
      nri: nriData
    };

    // Determine pathways
    state.data.pathways = determinePathways(state.data);
    state.saveToStorage();

  } catch (error) {
    console.error('Analysis failed:', error);
    showToast('Analysis failed. Please try again.', 'error');
  } finally {
    showLoading(false);
  }
}

async function querySolarResource(lng, lat) {
  try {
    const NREL_API_KEY = 'zXdbmYJ49pr7aQkN1WktVYVPASCDQRQZykTFa3pd';
    const url = `https://developer.nrel.gov/api/solar/solar_resource/v1.json?api_key=${NREL_API_KEY}&lat=${lat}&lon=${lng}`;
    const r = await fetch(url);
    const d = await r.json();
    if (d.outputs) {
      return {
        ghi: d.outputs.avg_ghi?.annual || null,
        dni: d.outputs.avg_dni?.annual || null,
        tilt: d.outputs.avg_lat_tilt?.annual || null
      };
    }
    return { ghi: null, dni: null, tilt: null };
  } catch (e) {
    console.error('Solar resource query failed:', e);
    return { ghi: null, dni: null, tilt: null };
  }
}

async function queryNRI(lng, lat) {
  try {
    const params = new URLSearchParams({
      where: '1=1',
      geometry: JSON.stringify({ x: lng, y: lat, spatialReference: { wkid: 4326 } }),
      geometryType: 'esriGeometryPoint',
      spatialRel: 'esriSpatialRelIntersects',
      outFields: '*',
      returnGeometry: 'false',
      f: 'json'
    });

    const r = await fetch(`${SnapshotSDK.datasets.nri}?${params}`);
    const d = await r.json();

    if (d.features && d.features.length > 0) {
      const props = d.features[0].attributes;
      return {
        riskScore: props.RISK_SCORE,
        riskRating: props.RISK_RATNG
      };
    }
    return null;
  } catch (e) {
    console.error('NRI query failed:', e);
    return null;
  }
}

function calculateScores(data) {
  let solarScore = 100;
  let dcScore = 100;
  const fatalFlaws = [];
  const warnings = [];

  const { trans, subs, pipe, wet, flood, prot, crithabFinal, solarData, nriData, pt } = data;

  // Solar scoring based on GHI
  if (solarData?.ghi) {
    if (solarData.ghi >= 5.5) {
      // Excellent - no deduction
    } else if (solarData.ghi >= 5.0) {
      solarScore -= 5;
    } else if (solarData.ghi >= 4.5) {
      solarScore -= 10;
    } else if (solarData.ghi >= 4.0) {
      solarScore -= 20;
    } else {
      solarScore -= 30;
    }
  } else {
    solarScore -= 15; // Unknown solar resource
  }

  // Infrastructure scoring for DC
  if (trans.length === 0) {
    dcScore -= 25;
    warnings.push('No transmission lines within 2 miles');
  }

  if (subs.length === 0) {
    dcScore -= 20;
    warnings.push('No substations within 2 miles');
  }

  // Environmental constraints
  const FATAL_FLOOD_ZONES = ['A', 'AE', 'AH', 'AO', 'V', 'VE'];

  flood.forEach(f => {
    try {
      if (turf.booleanPointInPolygon(pt, f)) {
        const zone = f.properties?.FLD_ZONE;
        if (FATAL_FLOOD_ZONES.includes(zone)) {
          fatalFlaws.push(`Site in ${zone} Flood Zone (high risk)`);
          solarScore -= 40;
          dcScore -= 50;
        } else {
          warnings.push(`Site in ${zone} Flood Zone`);
          solarScore -= 10;
          dcScore -= 15;
        }
      }
    } catch (e) { }
  });

  // Wetlands
  if (wet.length > 0) {
    solarScore -= 10;
    dcScore -= 15;
    warnings.push(`${wet.length} wetland area(s) nearby`);
  }

  // Protected areas
  prot.forEach(f => {
    try {
      if (turf.booleanPointInPolygon(pt, f)) {
        const manager = f.properties?.Mang_Name || 'Unknown';
        fatalFlaws.push(`Site in protected area managed by ${manager}`);
        solarScore -= 50;
        dcScore -= 50;
      }
    } catch (e) { }
  });

  // Critical habitat
  crithabFinal.forEach(f => {
    try {
      if (turf.booleanPointInPolygon(pt, f)) {
        const species = f.properties?.comname || 'protected species';
        fatalFlaws.push(`Site in Critical Habitat for ${species}`);
        solarScore -= 40;
        dcScore -= 40;
      }
    } catch (e) { }
  });

  // NRI risk
  if (nriData?.riskRating) {
    const rating = nriData.riskRating.toLowerCase();
    if (rating.includes('very high')) {
      dcScore -= 15;
      warnings.push('Very high natural hazard risk area');
    } else if (rating.includes('relatively high')) {
      dcScore -= 10;
    }
  }

  // Clamp scores
  solarScore = Math.max(0, Math.min(100, solarScore));
  dcScore = Math.max(0, Math.min(100, dcScore));

  return { solarScore, dcScore, fatalFlaws, warnings };
}

function getVoltageRank(vc) {
  if (!vc) return 1;
  const v = String(vc).toUpperCase();
  if (v.includes('DC')) return 7;
  if (v.includes('735') || v.includes('765') || v.includes('1000')) return 6;
  if (v.includes('500')) return 5;
  if (v.includes('345')) return 4;
  if (v.includes('220') || v.includes('230') || v.includes('287')) return 3;
  if (v.includes('100') || v.includes('115') || v.includes('138') || v.includes('161')) return 2;
  return 1;
}

function getVoltageCategory(vc) {
  if (!vc) return 'Unknown';
  const v = String(vc).toUpperCase();
  if (v.includes('DC')) return 'DC';
  if (v.includes('735') || v.includes('765') || v.includes('1000')) return '735+ kV';
  if (v.includes('500')) return '500 kV';
  if (v.includes('345')) return '345 kV';
  if (v.includes('220') || v.includes('230') || v.includes('287')) return '220-287 kV';
  if (v.includes('100') || v.includes('115') || v.includes('138') || v.includes('161')) return '100-161 kV';
  return '<100 kV';
}

function getSolarRating(score) {
  if (score >= 90) return { label: 'Excellent', class: 'score-excellent' };
  if (score >= 70) return { label: 'Good', class: 'score-good' };
  if (score >= 50) return { label: 'Fair', class: 'score-fair' };
  if (score >= 30) return { label: 'Poor', class: 'score-poor' };
  return { label: 'Fatal Flaws', class: 'score-fatal' };
}

function getDCRating(score) {
  if (score >= 90) return { label: 'Excellent', class: 'score-excellent' };
  if (score >= 70) return { label: 'Good', class: 'score-good' };
  if (score >= 50) return { label: 'Fair', class: 'score-fair' };
  if (score >= 30) return { label: 'Poor', class: 'score-poor' };
  return { label: 'Fatal Flaws', class: 'score-fatal' };
}

function getSolarResourceRating(ghi) {
  if (!ghi) return 'Unknown';
  if (ghi >= 5.5) return 'Excellent';
  if (ghi >= 5.0) return 'Very Good';
  if (ghi >= 4.5) return 'Good';
  if (ghi >= 4.0) return 'Fair';
  return 'Poor';
}

// ============================================
// FORM SUBMISSION
// ============================================
async function submitForm() {
  showLoading(true);

  try {
    // Save final submission to localStorage
    const submission = {
      ...state.data,
      submittedAt: new Date().toISOString(),
      id: generateId()
    };

    // Get existing submissions or create new array
    const existingSubmissions = JSON.parse(localStorage.getItem('snapshot_submissions') || '[]');
    existingSubmissions.push(submission);
    localStorage.setItem('snapshot_submissions', JSON.stringify(existingSubmissions));

    // Clear questionnaire state
    localStorage.removeItem('snapshot_questionnaire');

    showLoading(false);
    showSuccessScreen();

  } catch (error) {
    console.error('Submission failed:', error);
    showToast('Submission failed. Please try again.', 'error');
    showLoading(false);
  }
}

function showSuccessScreen() {
  const container = document.getElementById('question-container');
  const selectedPartners = state.data.selectedPartners || [];

  // Get only the partners the user selected
  const selectedPartnerDetails = selectedPartners.map(key => {
    if (PARTNERS[key]) {
      return { ...PARTNERS[key], key };
    }
    return null;
  }).filter(Boolean);

  container.innerHTML = `
    <div class="question-header" style="margin-bottom: 40px;">
      <h1 class="question-title">Thank You!</h1>
      <p class="question-subtitle">Your property analysis has been submitted successfully. We'll send your detailed report to ${state.data.email} shortly.</p>
    </div>

    ${selectedPartnerDetails.length ? `
      <div style="margin-top: 32px;">
        <h3 style="font-size: 18px; font-weight: 600; color: var(--primary-navy); margin-bottom: 16px; text-align: center;">Your Selected Partners</h3>
        <p style="text-align: center; color: var(--text-secondary); margin-bottom: 24px;">These partners will reach out to you soon with personalized information.</p>
        <div class="partner-recommendations">
          ${selectedPartnerDetails.map(partner => `
            <div class="partner-card" style="border-color: ${partner.color}">
              <div class="partner-info">
                <h4>${partner.name}</h4>
                <p>${partner.description}</p>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    ` : ''}

    <div style="text-align: center; margin-top: 40px; display: flex; gap: 16px; justify-content: center; flex-wrap: wrap;">
      <button class="download-btn" id="download-report-btn">
        <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
          <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z"/>
          <path d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708l3 3z"/>
        </svg>
        Download Report
      </button>
      <button class="nav-button next" onclick="location.reload()" style="width: auto; padding: 16px 32px;">
        Start New Analysis
      </button>
    </div>
  `;

  // Attach download handler
  document.getElementById('download-report-btn').addEventListener('click', downloadUserReport);

  // Hide footer
  document.querySelector('.footer-nav').style.display = 'none';
  document.getElementById('back-btn').disabled = true;
}

function downloadUserReport() {
  // Aggregate all user data
  const reportData = {
    submittedAt: new Date().toISOString(),

    // Purpose and initial responses
    purpose: state.data.purpose,
    realtor: state.data.realtor,
    ownershipType: state.data.ownershipType,
    interests: state.data.interests,
    confirmedInterests: state.data.confirmedInterests,

    // Location data
    location: state.data.location,

    // Property details
    propertyDetails: state.data.propertyDetails,

    // Energy bills
    bills: state.data.bills,

    // Analysis results
    analysisResults: state.data.analysisResults,
    pathways: state.data.pathways,

    // Selected partners
    selectedPartners: state.data.selectedPartners,

    // Contact
    email: state.data.email,

    // Documents (file names only for privacy)
    documents: state.data.documents
  };

  // Convert to JSON and download
  const dataStr = JSON.stringify(reportData, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });

  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `snapshot-report-${Date.now()}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  showToast('Report downloaded successfully!', 'success');
}

function generateId() {
  return 'snap_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// ============================================
// UI HELPERS
// ============================================
function showPopup(title, content) {
  document.getElementById('popup-title').textContent = title;
  document.getElementById('popup-content').textContent = content;
  document.getElementById('popup-overlay').classList.add('active');
}

function hidePopup() {
  document.getElementById('popup-overlay').classList.remove('active');
}

function showLoading(show) {
  document.getElementById('loading-overlay').classList.toggle('active', show);
}

function showToast(message, type = '') {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.className = 'toast';
  if (type) toast.classList.add(type);
  toast.classList.add('show');

  setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}

// ============================================
// INITIALIZATION
// ============================================
function startOver() {
  if (confirm('Are you sure you want to start over? All your progress will be lost.')) {
    localStorage.removeItem('snapshot_questionnaire');
    location.reload();
  }
}

function init() {
  // Close popup on click
  document.getElementById('popup-close').addEventListener('click', hidePopup);
  document.getElementById('popup-overlay').addEventListener('click', (e) => {
    if (e.target.id === 'popup-overlay') hidePopup();
  });

  // Start over button
  document.getElementById('start-over-btn').addEventListener('click', startOver);

  // Check if we should show landing page or app
  const hasStarted = localStorage.getItem('snapshot_questionnaire');

  if (!hasStarted) {
    // Show landing page
    showLandingPage();
  } else {
    // Show app directly
    hideLandingPage();
    renderStep();
  }
}

function showLandingPage() {
  const landingPage = document.getElementById('landing-page');
  const appContainer = document.getElementById('app-container');

  if (landingPage && appContainer) {
    landingPage.style.display = 'block';
    appContainer.style.display = 'none';

    // Tab switching functionality
    const navTabs = document.querySelectorAll('.nav-tab');
    const tabContents = document.querySelectorAll('.tab-content');

    function switchTab(tabName) {
      // Remove active class from all tabs and contents
      navTabs.forEach(t => t.classList.remove('active'));
      tabContents.forEach(content => content.classList.remove('active'));

      // Add active class to selected tab and corresponding content
      const selectedTab = document.querySelector(`.nav-tab[data-tab="${tabName}"]`);
      if (selectedTab) {
        selectedTab.classList.add('active');
      }
      const selectedContent = document.getElementById(`${tabName}-tab`);
      if (selectedContent) {
        selectedContent.classList.add('active');
      }

      // Show/hide fixed background based on active tab
      const fixedBg = document.querySelector('.fixed-background');
      if (fixedBg) {
        if (tabName === 'home') {
          fixedBg.style.opacity = '1';
          fixedBg.style.pointerEvents = 'auto';
        } else {
          fixedBg.style.opacity = '0';
          fixedBg.style.pointerEvents = 'none';
        }
      }

      // Scroll to top when switching tabs
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    navTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const tabName = tab.getAttribute('data-tab');
        switchTab(tabName);
      });
    });

    // Make logo clickable
    const logo = document.querySelector('.landing-logo');
    if (logo) {
      logo.addEventListener('click', (e) => {
        e.preventDefault();
        switchTab('home');
      });
    }

    // Footer links functionality
    const footerLinks = document.querySelectorAll('.footer-link');
    footerLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const tabName = link.getAttribute('data-tab');
        switchTab(tabName);
      });
    });

    // Get started button handler
    const getStartedBtn = document.getElementById('get-started-btn');
    const getStartedBtnSticky = document.getElementById('get-started-btn-sticky');

    if (getStartedBtn) {
      getStartedBtn.addEventListener('click', () => {
        hideLandingPage();
        renderStep();
      });
    }

    if (getStartedBtnSticky) {
      getStartedBtnSticky.addEventListener('click', () => {
        hideLandingPage();
        renderStep();
      });
    }

    // Scroll handler for sticky button
    let ticking = false;
    window.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    });

    function handleScroll() {
      const scrollPosition = window.scrollY;
      const stickyBtn = document.getElementById('get-started-btn-sticky');
      const heroBtn = document.getElementById('get-started-btn');

      if (!stickyBtn || !heroBtn) return;

      // Calculate if hero button is out of view
      const heroBtnRect = heroBtn.getBoundingClientRect();
      const heroButtonBottom = heroBtnRect.bottom;

      // Show sticky button only when hero button is completely scrolled past the nav (72px)
      // Add some buffer (50px) to avoid overlap
      if (heroButtonBottom < 0) {
        stickyBtn.classList.add('visible');
      } else {
        stickyBtn.classList.remove('visible');
      }
    }

    // Partner application form handler
    const partnerForm = document.getElementById('partner-application-form');
    if (partnerForm) {
      partnerForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const formData = {
          companyName: document.getElementById('company-name').value,
          contactName: document.getElementById('contact-name').value,
          email: document.getElementById('contact-email').value,
          phone: document.getElementById('contact-phone').value,
          serviceCategory: document.getElementById('service-category').value,
          description: document.getElementById('company-description').value,
          coverageArea: document.getElementById('coverage-area').value,
          submittedAt: new Date().toISOString()
        };

        // Log the application data (in production, this would be sent to a server)
        console.log('Partner Application Submitted:', formData);

        // Show success message
        showToast('Application submitted successfully! We\'ll be in touch soon.', 'success');

        // Reset form
        partnerForm.reset();

        // Optionally download the application as JSON
        const dataStr = JSON.stringify(formData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `partner-application-${Date.now()}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      });
    }

    // Initialize Deregulation Map
    initDeregulationMap();
  }
}

// Initialize the US Deregulation Map with colors and hover tooltips
async function initDeregulationMap() {
  const container = document.getElementById('us-map-container');
  const tooltip = document.getElementById('state-tooltip');

  if (!container || !tooltip) return;

  // Load the SVG file
  try {
    const response = await fetch('assets/us-map-final.svg');
    const svgText = await response.text();
    container.innerHTML = svgText;
  } catch (e) {
    console.error('Failed to load US map SVG:', e);
    return;
  }

  const mapSvg = container.querySelector('svg');
  if (!mapSvg) return;

  mapSvg.id = 'us-deregulation-map';

  const states = mapSvg.querySelectorAll('.state');

  states.forEach(stateEl => {
    const stateAbbr = stateEl.getAttribute('data-state');
    if (!stateAbbr) return;

    // Set the correct CSS class based on deregulation status
    const category = getDeregulationCategory(stateAbbr);

    // Remove default class and add the correct one
    stateEl.classList.remove('regulated', 'deregulated', 'electricity-only', 'gas-only', 'partial');

    switch (category) {
      case 'deregulated':
        stateEl.classList.add('deregulated');
        break;
      case 'electricity':
        stateEl.classList.add('electricity-only');
        break;
      case 'gas':
        stateEl.classList.add('gas-only');
        break;
      case 'partial':
        stateEl.classList.add('partial');
        break;
      default:
        stateEl.classList.add('regulated');
    }

    // Add hover event listeners
    stateEl.addEventListener('mouseenter', (e) => {
      showStateTooltip(stateAbbr, e, tooltip);
    });

    stateEl.addEventListener('mousemove', (e) => {
      positionTooltip(e, tooltip);
    });

    stateEl.addEventListener('mouseleave', () => {
      hideTooltip(tooltip);
    });
  });
}

function showStateTooltip(stateAbbr, event, tooltip) {
  const data = STATE_REGULATION_DATA[stateAbbr];
  const stateName = STATE_NAMES[stateAbbr];

  if (!data || !stateName) return;

  // Build tooltip HTML
  const electricityClass = data.electricity === 'Yes' ? 'yes' : (data.electricity === 'Limited' ? 'limited' : 'no');
  const gasClass = data.gas === 'Yes' ? 'yes' : (data.gas === 'Limited' ? 'limited' : 'no');

  tooltip.innerHTML = `
    <div class="tooltip-title">${stateName}</div>
    <div class="tooltip-status">
      <div class="tooltip-item">
        <span class="tooltip-label">Electricity:</span>
        <span class="tooltip-value ${electricityClass}">${data.electricity}</span>
      </div>
      <div class="tooltip-item">
        <span class="tooltip-label">Gas:</span>
        <span class="tooltip-value ${gasClass}">${data.gas}</span>
      </div>
    </div>
    <div class="tooltip-description">${data.tooltip}</div>
  `;

  positionTooltip(event, tooltip);
  tooltip.classList.add('visible');
}

function positionTooltip(event, tooltip) {
  const mapWrapper = document.querySelector('.us-map-wrapper');
  if (!mapWrapper) return;

  const rect = mapWrapper.getBoundingClientRect();
  const tooltipRect = tooltip.getBoundingClientRect();

  let x = event.clientX - rect.left + 15;
  let y = event.clientY - rect.top + 15;

  // Prevent tooltip from going off the right edge
  if (x + tooltipRect.width > rect.width) {
    x = event.clientX - rect.left - tooltipRect.width - 15;
  }

  // Prevent tooltip from going off the bottom edge
  if (y + tooltipRect.height > rect.height) {
    y = event.clientY - rect.top - tooltipRect.height - 15;
  }

  tooltip.style.left = `${x}px`;
  tooltip.style.top = `${y}px`;
}

function hideTooltip(tooltip) {
  tooltip.classList.remove('visible');
}

function hideLandingPage() {
  const landingPage = document.getElementById('landing-page');
  const appContainer = document.getElementById('app-container');

  if (landingPage && appContainer) {
    landingPage.style.display = 'none';
    appContainer.style.display = 'flex';
  }
}

// Start the application
init();
