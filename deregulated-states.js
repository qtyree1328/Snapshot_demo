// Deregulated States Data for Energy Markets
// Used to determine Ideal Energy pathway eligibility

export const DEREGULATED_STATES = {
  // Electricity Deregulation Status
  electricity: {
    // Fully deregulated - all customers can choose supplier
    fullyDeregulated: ['TX', 'PA', 'OH', 'IL', 'NY', 'NJ', 'CT', 'MA', 'MD', 'ME', 'NH', 'DE', 'DC'],
    // Partially deregulated - some customer classes or regions only
    partiallyDeregulated: ['CA', 'MI', 'VA', 'GA', 'NV', 'OR', 'MT']
  },

  // Natural Gas Deregulation Status
  gas: {
    deregulated: ['TX', 'PA', 'OH', 'IL', 'NY', 'NJ', 'CT', 'MA', 'MD', 'ME', 'NH', 'GA', 'VA', 'FL']
  }
};

// State name to abbreviation mapping
export const STATE_ABBREVIATIONS = {
  'alabama': 'AL', 'alaska': 'AK', 'arizona': 'AZ', 'arkansas': 'AR', 'california': 'CA',
  'colorado': 'CO', 'connecticut': 'CT', 'delaware': 'DE', 'district of columbia': 'DC',
  'florida': 'FL', 'georgia': 'GA', 'hawaii': 'HI', 'idaho': 'ID', 'illinois': 'IL',
  'indiana': 'IN', 'iowa': 'IA', 'kansas': 'KS', 'kentucky': 'KY', 'louisiana': 'LA',
  'maine': 'ME', 'maryland': 'MD', 'massachusetts': 'MA', 'michigan': 'MI', 'minnesota': 'MN',
  'mississippi': 'MS', 'missouri': 'MO', 'montana': 'MT', 'nebraska': 'NE', 'nevada': 'NV',
  'new hampshire': 'NH', 'new jersey': 'NJ', 'new mexico': 'NM', 'new york': 'NY',
  'north carolina': 'NC', 'north dakota': 'ND', 'ohio': 'OH', 'oklahoma': 'OK', 'oregon': 'OR',
  'pennsylvania': 'PA', 'rhode island': 'RI', 'south carolina': 'SC', 'south dakota': 'SD',
  'tennessee': 'TN', 'texas': 'TX', 'utah': 'UT', 'vermont': 'VT', 'virginia': 'VA',
  'washington': 'WA', 'west virginia': 'WV', 'wisconsin': 'WI', 'wyoming': 'WY'
};

/**
 * Check if a state has deregulated electricity market
 * @param {string} stateAbbr - Two-letter state abbreviation
 * @returns {object} - { isDeregulated: boolean, type: 'full'|'partial'|'none' }
 */
export function checkElectricityDeregulation(stateAbbr) {
  const abbr = stateAbbr?.toUpperCase();
  if (DEREGULATED_STATES.electricity.fullyDeregulated.includes(abbr)) {
    return { isDeregulated: true, type: 'full' };
  }
  if (DEREGULATED_STATES.electricity.partiallyDeregulated.includes(abbr)) {
    return { isDeregulated: true, type: 'partial' };
  }
  return { isDeregulated: false, type: 'none' };
}

/**
 * Check if a state has deregulated natural gas market
 * @param {string} stateAbbr - Two-letter state abbreviation
 * @returns {boolean}
 */
export function checkGasDeregulation(stateAbbr) {
  const abbr = stateAbbr?.toUpperCase();
  return DEREGULATED_STATES.gas.deregulated.includes(abbr);
}

/**
 * Check overall deregulation status for Ideal Energy pathway
 * @param {string} stateAbbr - Two-letter state abbreviation
 * @returns {object} - { eligible: boolean, electricity: object, gas: boolean }
 */
export function checkIdealEligibility(stateAbbr) {
  const electricity = checkElectricityDeregulation(stateAbbr);
  const gas = checkGasDeregulation(stateAbbr);

  return {
    eligible: electricity.isDeregulated || gas,
    electricity,
    gas
  };
}

/**
 * Get state abbreviation from full state name
 * @param {string} stateName - Full state name (case insensitive)
 * @returns {string|null} - Two-letter abbreviation or null
 */
export function getStateAbbreviation(stateName) {
  if (!stateName) return null;

  // If already an abbreviation
  if (stateName.length === 2) {
    return stateName.toUpperCase();
  }

  return STATE_ABBREVIATIONS[stateName.toLowerCase()] || null;
}
