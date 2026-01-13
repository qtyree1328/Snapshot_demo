// Deregulated States Data for Energy Markets
// Used to determine Ideal Energy pathway eligibility

// Comprehensive state regulation data with custom tooltip blurbs
export const STATE_REGULATION_DATA = {
  'AL': { electricity: 'No', gas: 'No', tooltip: 'Alabama does not have energy choice.' },
  'AK': { electricity: 'No', gas: 'No', tooltip: 'Alaska does not have energy choice.' },
  'AZ': { electricity: 'No', gas: 'No', tooltip: 'Arizona does not have energy choice.' },
  'AR': { electricity: 'No', gas: 'No', tooltip: 'Arkansas does not have energy choice.' },
  'CA': { electricity: 'Limited', gas: 'Yes', tooltip: 'While both electricity and natural gas are deregulated in CA, electric choice is only available through a lottery system.' },
  'CO': { electricity: 'No', gas: 'Limited', tooltip: 'In Colorado, natural gas choice enacted by law, but there are no provider options as of 2025.' },
  'CT': { electricity: 'Yes', gas: 'Yes', tooltip: 'In Connecticut, both electricity and natural gas are deregulated and available to residential and commercial customers.' },
  'DE': { electricity: 'Yes', gas: 'Yes', tooltip: 'In Delaware, both electricity and natural gas are deregulated and available to residential and commercial customers.' },
  'DC': { electricity: 'Yes', gas: 'Yes', tooltip: 'In Washington DC, both electricity and natural gas are deregulated and available to residential and commercial customers.' },
  'FL': { electricity: 'No', gas: 'Limited', tooltip: 'In Florida, natural gas is deregulated statewide for commercial and industrial customers, but retail choice for residential customers is currently limited to the Central Florida Gas (CFG) service territory.' },
  'GA': { electricity: 'Limited', gas: 'Yes', tooltip: 'LIMITED OPTIONS: Not available to residential customers. Electric choice is only available for commercial and industrial users with a load of at least 900 kW, located outside of municipal limits. Electric choice also applies for new municipalities and areas annexed to a municipality after 1973.' },
  'HI': { electricity: 'No', gas: 'No', tooltip: 'Hawaii does not have energy choice.' },
  'ID': { electricity: 'No', gas: 'No', tooltip: 'Idaho does not have energy choice.' },
  'IL': { electricity: 'Yes', gas: 'Yes', tooltip: 'In Illinois, both electricity and natural gas are deregulated and available to residential and commercial customers.' },
  'IN': { electricity: 'No', gas: 'Limited', tooltip: 'In Indiana, natural gas choice is available to both commercial customers and residential customers in specific service territories, such as Northern Indiana Public Service Company (NIPSCO).' },
  'IA': { electricity: 'No', gas: 'No', tooltip: 'Iowa does not have energy choice.' },
  'KS': { electricity: 'No', gas: 'Limited', tooltip: 'In Kansas, natural gas choice is only available for large customers using 800-1500 MCF per year.' },
  'KY': { electricity: 'No', gas: 'Yes', tooltip: 'In Kentucky, natural gas is deregulated and available for residential and commercial customers.' },
  'LA': { electricity: 'No', gas: 'No', tooltip: 'Louisiana does not have energy choice.' },
  'ME': { electricity: 'Yes', gas: 'Yes', tooltip: 'In Maine, both electricity and natural gas are deregulated and available to residential and commercial customers.' },
  'MD': { electricity: 'Yes', gas: 'Yes', tooltip: 'In Maryland, both electricity and natural gas are deregulated and available to residential and commercial customers.' },
  'MA': { electricity: 'Yes', gas: 'Yes', tooltip: 'In Massachusetts, both electricity and natural gas are deregulated and available to residential and commercial customers.' },
  'MI': { electricity: 'Limited', gas: 'Yes', tooltip: 'In Michigan, electric choice is limited to 10% of a utility company\'s retail sales, and there is a long waiting list to switch your electric provider.' },
  'MN': { electricity: 'No', gas: 'No', tooltip: 'Minnesota does not have energy choice.' },
  'MS': { electricity: 'No', gas: 'No', tooltip: 'Mississippi does not have energy choice.' },
  'MO': { electricity: 'No', gas: 'No', tooltip: 'Missouri does not have energy choice.' },
  'MT': { electricity: 'No', gas: 'Yes', tooltip: 'In Montana, natural gas is deregulated and available for residential and small business customers.' },
  'NE': { electricity: 'No', gas: 'Limited', tooltip: 'In Nebraska, the ability to select an alternative natural gas supplier (retail choice) is restricted to an annual enrollment period, typically two weeks in April, for both residential and business customers.' },
  'NV': { electricity: 'No', gas: 'Limited', tooltip: 'In Nevada there is no choice of residential natural gas, but limited options available for commercial and industrial customers using more than 500 therms per day.' },
  'NH': { electricity: 'Yes', gas: 'Yes', tooltip: 'In New Hampshire, both electricity and natural gas are deregulated and available to residential and commercial customers.' },
  'NJ': { electricity: 'Yes', gas: 'Yes', tooltip: 'In New Jersey, both electricity and natural gas are deregulated and available to residential and commercial customers.' },
  'NM': { electricity: 'No', gas: 'Limited', tooltip: 'In New Mexico, Natural gas choice is enabled by law, but options are very limited.' },
  'NY': { electricity: 'Yes', gas: 'Yes', tooltip: 'In New York, both electricity and natural gas are deregulated and available to residential and commercial customers.' },
  'NC': { electricity: 'No', gas: 'No', tooltip: 'North Carolina does not have energy choice.' },
  'ND': { electricity: 'No', gas: 'No', tooltip: 'North Dakota does not have energy choice.' },
  'OH': { electricity: 'Yes', gas: 'Yes', tooltip: 'In Ohio, both electricity and natural gas are deregulated and available to residential and commercial customers.' },
  'OK': { electricity: 'No', gas: 'No', tooltip: 'Oklahoma does not have energy choice.' },
  'OR': { electricity: 'Limited', gas: 'No', tooltip: 'Oregon is the only US state where electricity is deregulated while gas remains regulated.' },
  'PA': { electricity: 'Yes', gas: 'Yes', tooltip: 'In Pennsylvania, both electricity and natural gas are deregulated and available to residential and commercial customers.' },
  'RI': { electricity: 'Yes', gas: 'Yes', tooltip: 'In Rhode Island, both electricity and natural gas are deregulated and available to residential and commercial customers.' },
  'SC': { electricity: 'No', gas: 'No', tooltip: 'South Carolina does not have energy choice.' },
  'SD': { electricity: 'No', gas: 'Limited', tooltip: 'In South Dakota, natural gas choice is enabled by law, but options are very limited for residential users.' },
  'TN': { electricity: 'No', gas: 'Limited', tooltip: 'In Tennessee, natural gas choice is only available to commercial and industrial users with an average consumption of more than 500 therms per day.' },
  'TX': { electricity: 'Yes', gas: 'No', tooltip: 'In Texas, electricity is deregulated and available to residential and commercial customers.' },
  'UT': { electricity: 'No', gas: 'No', tooltip: 'Utah does not have energy choice.' },
  'VT': { electricity: 'No', gas: 'No', tooltip: 'Vermont does not have energy choice.' },
  'VA': { electricity: 'Limited', gas: 'Limited', tooltip: 'In Virginia, electric choice is only available for commercial and industrial consumers. Residential customers only qualify if they are looking for a 100% renewable energy plan, and only when this option is not available from their local utility company.' },
  'WA': { electricity: 'No', gas: 'No', tooltip: 'Washington does not have energy choice.' },
  'WV': { electricity: 'No', gas: 'Limited', tooltip: 'West Virginia\'s energy market is primarily regulated for electricity, but it offers limited, partial deregulation for natural gas.' },
  'WI': { electricity: 'No', gas: 'Limited', tooltip: 'In Wisconsin, natural gas choice is available for commercial and industrial users with a consumption of more than 5,000 therms per year.' },
  'WY': { electricity: 'No', gas: 'Limited', tooltip: 'Wyoming has a partially deregulated natural gas market, which is very limited in scope.' }
};

// State full names
export const STATE_NAMES = {
  'AL': 'Alabama', 'AK': 'Alaska', 'AZ': 'Arizona', 'AR': 'Arkansas', 'CA': 'California',
  'CO': 'Colorado', 'CT': 'Connecticut', 'DE': 'Delaware', 'DC': 'Washington DC',
  'FL': 'Florida', 'GA': 'Georgia', 'HI': 'Hawaii', 'ID': 'Idaho', 'IL': 'Illinois',
  'IN': 'Indiana', 'IA': 'Iowa', 'KS': 'Kansas', 'KY': 'Kentucky', 'LA': 'Louisiana',
  'ME': 'Maine', 'MD': 'Maryland', 'MA': 'Massachusetts', 'MI': 'Michigan', 'MN': 'Minnesota',
  'MS': 'Mississippi', 'MO': 'Missouri', 'MT': 'Montana', 'NE': 'Nebraska', 'NV': 'Nevada',
  'NH': 'New Hampshire', 'NJ': 'New Jersey', 'NM': 'New Mexico', 'NY': 'New York',
  'NC': 'North Carolina', 'ND': 'North Dakota', 'OH': 'Ohio', 'OK': 'Oklahoma', 'OR': 'Oregon',
  'PA': 'Pennsylvania', 'RI': 'Rhode Island', 'SC': 'South Carolina', 'SD': 'South Dakota',
  'TN': 'Tennessee', 'TX': 'Texas', 'UT': 'Utah', 'VT': 'Vermont', 'VA': 'Virginia',
  'WA': 'Washington', 'WV': 'West Virginia', 'WI': 'Wisconsin', 'WY': 'Wyoming'
};

// Categorized lists for quick lookups
export const DEREGULATED_STATES = {
  electricity: {
    // Fully deregulated - "Yes" for electricity (not Limited)
    fullyDeregulated: ['CT', 'DE', 'DC', 'IL', 'ME', 'MD', 'MA', 'NH', 'NJ', 'NY', 'OH', 'PA', 'RI', 'TX'],
    // Partially deregulated - "Limited" for electricity
    partiallyDeregulated: ['CA', 'GA', 'MI', 'OR', 'VA']
  },
  gas: {
    // Fully deregulated - "Yes" for gas (not Limited)
    fullyDeregulated: ['CA', 'CT', 'DC', 'DE', 'GA', 'IL', 'KY', 'ME', 'MD', 'MA', 'MI', 'MT', 'NH', 'NJ', 'NY', 'OH', 'PA', 'RI'],
    // Limited gas choice
    limited: ['CO', 'FL', 'IN', 'KS', 'NE', 'NV', 'NM', 'SD', 'TN', 'VA', 'WV', 'WI', 'WY']
  }
};

// State name to abbreviation mapping (for address parsing)
export const STATE_ABBREVIATIONS = {
  'alabama': 'AL', 'alaska': 'AK', 'arizona': 'AZ', 'arkansas': 'AR', 'california': 'CA',
  'colorado': 'CO', 'connecticut': 'CT', 'delaware': 'DE', 'district of columbia': 'DC',
  'washington dc': 'DC', 'florida': 'FL', 'georgia': 'GA', 'hawaii': 'HI', 'idaho': 'ID',
  'illinois': 'IL', 'indiana': 'IN', 'iowa': 'IA', 'kansas': 'KS', 'kentucky': 'KY',
  'louisiana': 'LA', 'maine': 'ME', 'maryland': 'MD', 'massachusetts': 'MA', 'michigan': 'MI',
  'minnesota': 'MN', 'mississippi': 'MS', 'missouri': 'MO', 'montana': 'MT', 'nebraska': 'NE',
  'nevada': 'NV', 'new hampshire': 'NH', 'new jersey': 'NJ', 'new mexico': 'NM', 'new york': 'NY',
  'north carolina': 'NC', 'north dakota': 'ND', 'ohio': 'OH', 'oklahoma': 'OK', 'oregon': 'OR',
  'pennsylvania': 'PA', 'rhode island': 'RI', 'south carolina': 'SC', 'south dakota': 'SD',
  'tennessee': 'TN', 'texas': 'TX', 'utah': 'UT', 'vermont': 'VT', 'virginia': 'VA',
  'washington': 'WA', 'west virginia': 'WV', 'wisconsin': 'WI', 'wyoming': 'WY'
};

/**
 * Get comprehensive regulation info for a state
 * @param {string} stateAbbr - Two-letter state abbreviation
 * @returns {object|null} - State regulation data or null
 */
export function getStateRegulationInfo(stateAbbr) {
  const abbr = stateAbbr?.toUpperCase();
  const data = STATE_REGULATION_DATA[abbr];
  if (!data) return null;

  return {
    abbreviation: abbr,
    name: STATE_NAMES[abbr],
    electricity: data.electricity,
    gas: data.gas,
    tooltip: data.tooltip,
    hasElectricityChoice: data.electricity === 'Yes' || data.electricity === 'Limited',
    hasGasChoice: data.gas === 'Yes' || data.gas === 'Limited',
    isFullyDeregulated: data.electricity === 'Yes' && data.gas === 'Yes'
  };
}

/**
 * Check if a state has deregulated electricity market
 * @param {string} stateAbbr - Two-letter state abbreviation
 * @returns {object} - { isDeregulated: boolean, type: 'full'|'partial'|'none' }
 */
export function checkElectricityDeregulation(stateAbbr) {
  const abbr = stateAbbr?.toUpperCase();
  const data = STATE_REGULATION_DATA[abbr];
  if (!data) return { isDeregulated: false, type: 'none' };

  if (data.electricity === 'Yes') {
    return { isDeregulated: true, type: 'full' };
  }
  if (data.electricity === 'Limited') {
    return { isDeregulated: true, type: 'partial' };
  }
  return { isDeregulated: false, type: 'none' };
}

/**
 * Check if a state has deregulated natural gas market
 * @param {string} stateAbbr - Two-letter state abbreviation
 * @returns {object} - { isDeregulated: boolean, type: 'full'|'limited'|'none' }
 */
export function checkGasDeregulation(stateAbbr) {
  const abbr = stateAbbr?.toUpperCase();
  const data = STATE_REGULATION_DATA[abbr];
  if (!data) return { isDeregulated: false, type: 'none' };

  if (data.gas === 'Yes') {
    return { isDeregulated: true, type: 'full' };
  }
  if (data.gas === 'Limited') {
    return { isDeregulated: true, type: 'limited' };
  }
  return { isDeregulated: false, type: 'none' };
}

/**
 * Check overall deregulation status for Ideal Energy pathway
 * @param {string} stateAbbr - Two-letter state abbreviation
 * @returns {object} - Eligibility information
 */
export function checkIdealEligibility(stateAbbr) {
  const electricity = checkElectricityDeregulation(stateAbbr);
  const gas = checkGasDeregulation(stateAbbr);
  const info = getStateRegulationInfo(stateAbbr);

  return {
    eligible: electricity.isDeregulated || gas.isDeregulated,
    electricity,
    gas,
    tooltip: info?.tooltip || 'Unknown state'
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

/**
 * Get the deregulation category for map coloring
 * Categories:
 * - 'deregulated': Both electricity AND gas are 'Yes' (not Limited)
 * - 'electricity': Only electricity is 'Yes' (not Limited), gas is No or Limited
 * - 'gas': Only gas is 'Yes' (not Limited), electricity is No or Limited
 * - 'partial': Any 'Limited' status for either service
 * - 'none': No energy choice (both are 'No')
 *
 * @param {string} stateAbbr - Two-letter state abbreviation
 * @returns {string} - 'deregulated'|'electricity'|'gas'|'partial'|'none'
 */
export function getDeregulationCategory(stateAbbr) {
  const info = getStateRegulationInfo(stateAbbr);
  if (!info) return 'none';

  const elecYes = info.electricity === 'Yes';
  const gasYes = info.gas === 'Yes';
  const elecLimited = info.electricity === 'Limited';
  const gasLimited = info.gas === 'Limited';

  // Both fully deregulated (Yes, not Limited)
  if (elecYes && gasYes) return 'deregulated';

  // Any Limited status = partial (check before electricity/gas only)
  if (elecLimited || gasLimited) return 'partial';

  // Electricity only (Yes, not Limited)
  if (elecYes) return 'electricity';

  // Gas only (Yes, not Limited)
  if (gasYes) return 'gas';

  // No choice
  return 'none';
}
