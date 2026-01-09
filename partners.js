// Partner Definitions and Routing Logic
import { checkIdealEligibility } from './deregulated-states.js';

export const PARTNERS = {
  landvolt: {
    name: 'Landvolt',
    description: 'Specialized real estate experts who provide comprehensive property valuations using energy infrastructure analysis and geospatial technology. Understand your property\'s true worth with data-driven insights.',
    services: ['Property Valuation', 'Energy Infrastructure Assessment', 'Market Analysis', 'Strategic Advisory'],
    color: '#ef4444',
    selectionText: 'I want expert property valuation and strategic insights'
  },
  ideal: {
    name: 'Ideal Energy',
    description: 'Energy procurement specialists helping you auction your electricity and gas contracts to get the best rates in deregulated markets.',
    services: ['Electricity Bill Auction', 'Natural Gas Bill Auction', 'Energy Contract Optimization'],
    color: '#2563eb',
    selectionText: 'I want to reduce my energy costs through competitive procurement'
  },
  chipmunk_solar: {
    name: 'Chipmunk Solar',
    description: 'Expert solar installation for residential and commercial properties. Maximize your solar potential with custom-designed systems.',
    services: ['Rooftop Solar Installation', 'Ground-Mount Solar Systems', 'Battery Storage', 'Solar + EV Charging'],
    color: '#f59e0b',
    selectionText: 'I want to install solar panels on my property'
  },
  redaptive: {
    name: 'Redaptive Inc',
    description: 'Leading provider of efficiency-as-a-service for commercial and industrial facilities. Reduce energy consumption through building upgrades.',
    services: ['HVAC Optimization', 'LED Retrofit', 'Building Automation', 'Energy Efficiency Audits'],
    color: '#10b981',
    selectionText: 'I want to upgrade my building systems for energy efficiency'
  },
  infrastructure: {
    name: 'Infrastructure Development Partners',
    description: 'Connect your land to utility-scale energy projects including data centers and solar farms.',
    services: ['Data Center Site Development', 'Utility-Scale Solar', 'Energy Storage Projects', 'Grid Infrastructure'],
    color: '#8b5cf6',
    selectionText: 'I want to explore large-scale energy infrastructure development'
  }
};

// Minimum thresholds
export const THRESHOLDS = {
  minCombinedBill: 100, // $100/month combined for Ideal pathway
  minSolarGHI: 4.5, // Minimum GHI for Chipmunk Solar recommendation
  minInfraAcres: 10 // Minimum acres for infrastructure development
};

/**
 * Determine which partner pathways a user qualifies for
 * Uses confirmedInterests if available (from interest confirmation step),
 * otherwise falls back to initial interests
 * @param {object} userData - User questionnaire data
 * @returns {string[]} - Array of partner keys user qualifies for
 */
export function determinePathways(userData) {
  const pathways = [];
  const { purpose, interests, confirmedInterests, location, bills, analysisResults } = userData;

  // Check Landvolt pathway (property valuation interest)
  const interestedInValuation = purpose?.includes('sell_land');
  if (interestedInValuation) {
    pathways.push('landvolt');
  }

  // Check for building upgrade interest from PURPOSE
  const interestedInUpgrades = purpose?.includes('upgrade_building');

  // Use confirmed interests if available, otherwise fall back to initial interests
  const activeInterests = confirmedInterests?.length > 0 ? confirmedInterests : interests;

  // Check for building home energy interest
  const interestedInEnergy = activeInterests?.includes('home_energy') ||
                             activeInterests?.includes('unsure') ||
                             interests?.includes('unsure') ||
                             interestedInUpgrades;

  // Check for improving home systems interest
  const interestedInSystems = activeInterests?.includes('home_systems') || interestedInUpgrades;

  // Check Ideal Energy pathway (deregulated state + energy interest + sufficient bills)
  if ((interestedInEnergy || interestedInUpgrades) && location?.state) {
    const idealEligibility = checkIdealEligibility(location.state);
    const combinedBill = (bills?.electricity || 0) + (bills?.gas || 0);

    if (idealEligibility.eligible && combinedBill >= THRESHOLDS.minCombinedBill) {
      pathways.push('ideal');
    }
  }

  // Check Chipmunk Solar pathway
  // Suggest if interested in energy AND has good solar potential
  // (regardless of deregulation status - solar is always an option)
  if (interestedInEnergy || interestedInUpgrades) {
    const goodSolarScore = analysisResults?.solarGHI >= THRESHOLDS.minSolarGHI;
    if (goodSolarScore) {
      pathways.push('chipmunk_solar');
    }
  }

  // Check Redaptive pathway (improving home systems)
  if (interestedInSystems || interestedInUpgrades) {
    pathways.push('redaptive');
  }

  // Check Infrastructure Development pathway
  const interestedInInfra = purpose?.includes('invest_infrastructure') || interests?.includes('infrastructure');
  if (interestedInInfra) {
    pathways.push('infrastructure');
  }

  // Default to general if no specific pathways matched
  if (pathways.length === 0) {
    pathways.push('general');
  }

  return pathways;
}

/**
 * Check if user should see the Ideal Energy specific questions
 * @param {object} userData - User questionnaire data
 * @returns {boolean}
 */
export function shouldShowIdealQuestions(userData) {
  const { interests, location } = userData;

  if (!location?.state) return false;

  const idealEligibility = checkIdealEligibility(location.state);
  const interestedInEnergy = interests?.includes('home_energy') || interests?.includes('unsure');

  return idealEligibility.eligible && interestedInEnergy;
}

/**
 * Get partner recommendations with priority ordering
 * @param {string[]} pathways - Array of pathway keys
 * @param {object} userData - User questionnaire data
 * @returns {object[]} - Sorted array of partner recommendations
 */
export function getPartnerRecommendations(pathways, userData) {
  const recommendations = [];

  pathways.forEach(pathway => {
    if (PARTNERS[pathway]) {
      const partner = { ...PARTNERS[pathway], key: pathway };

      // Add qualification notes
      if (pathway === 'landvolt') {
        if (userData.realtor === 'not_yet' || userData.realtor === 'actively_trying') {
          partner.note = 'Comprehensive property valuation using geospatial technology and energy infrastructure analysis';
        } else if (userData.realtor === 'yes_have_realtor') {
          partner.note = 'Get a data-driven valuation to understand your property\'s full potential value';
        } else {
          partner.note = 'Expert property valuation with energy infrastructure insights';
        }
      }

      if (pathway === 'chipmunk_solar' && userData.analysisResults?.solarGHI) {
        partner.note = `Your location has ${getSolarRating(userData.analysisResults.solarGHI)} solar potential (GHI: ${userData.analysisResults.solarGHI.toFixed(1)} kWh/m2/day)`;
      }

      if (pathway === 'infrastructure' && userData.propertyDetails?.acres) {
        if (userData.propertyDetails.acres >= THRESHOLDS.minInfraAcres) {
          partner.note = `Your ${userData.propertyDetails.acres} acres qualifies for utility-scale projects`;
        } else {
          partner.note = `Smaller projects may be available for your ${userData.propertyDetails.acres} acre property`;
        }
      }

      if (pathway === 'ideal') {
        partner.note = 'Your state allows competitive energy procurement';
      }

      recommendations.push(partner);
    }
  });

  // Sort by relevance (could add scoring logic here)
  return recommendations;
}

/**
 * Get solar rating text based on GHI value
 * @param {number} ghi - Global Horizontal Irradiance value
 * @returns {string}
 */
function getSolarRating(ghi) {
  if (ghi >= 5.5) return 'excellent';
  if (ghi >= 5.0) return 'very good';
  if (ghi >= 4.5) return 'good';
  if (ghi >= 4.0) return 'fair';
  return 'moderate';
}
