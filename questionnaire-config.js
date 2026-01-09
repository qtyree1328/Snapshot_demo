// Questionnaire Configuration
// Defines all steps, questions, and conditional logic

export const STEPS = {
  PURPOSE: 'purpose',
  REALTOR: 'realtor',
  OWNERSHIP: 'ownership',
  INTERESTS: 'interests',
  LOCATION: 'location',
  PROPERTY_DETAILS: 'property_details',
  INTEREST_CONFIRM: 'interest_confirm',
  ENERGY_BILLS: 'energy_bills',
  DOCUMENTS: 'documents',
  ANALYSIS: 'analysis',
  EMAIL: 'email'
};

export const STEP_ORDER = [
  STEPS.PURPOSE,
  STEPS.REALTOR,
  STEPS.OWNERSHIP,
  STEPS.INTERESTS,
  STEPS.LOCATION,
  STEPS.PROPERTY_DETAILS,
  STEPS.INTEREST_CONFIRM,
  STEPS.ENERGY_BILLS,
  STEPS.DOCUMENTS,
  STEPS.ANALYSIS,
  STEPS.EMAIL
];

// Question definitions for each step
export const QUESTIONS = {
  [STEPS.PURPOSE]: {
    id: 'purpose',
    title: 'What brings you here today?',
    subtitle: 'Select all that apply - you can explore multiple options.',
    type: 'checkbox',
    required: true,
    options: [
      {
        value: 'sell_land',
        label: 'Valuate my property',
        description: 'Discover my property\'s full potential value using geospatial technology and comprehensive market research'
      },
      {
        value: 'invest_infrastructure',
        label: 'Invest in infrastructure',
        description: 'Explore opportunities in energy projects, data centers, battery storage, or utility-scale development'
      },
      {
        value: 'upgrade_building',
        label: 'Upgrade my building & systems',
        description: 'Reduce costs through solar, HVAC upgrades, LED retrofits, energy procurement, and sustainable appliance improvements'
      }
    ]
  },

  [STEPS.REALTOR]: {
    id: 'realtor',
    title: 'Are you actively working with a realtor?',
    subtitle: 'This helps us provide the most relevant recommendations.',
    type: 'radio',
    required: true,
    conditional: 'showRealtorQuestion',
    options: [
      {
        value: 'yes_have_realtor',
        label: 'Yes, I have a realtor',
        description: 'I\'m currently working with a real estate agent'
      },
      {
        value: 'actively_trying',
        label: 'Actively looking for one',
        description: 'I\'m searching for the right realtor to work with'
      },
      {
        value: 'not_yet',
        label: 'Not yet, but interested',
        description: 'I\'d like to learn about my options first'
      }
    ]
  },

  [STEPS.OWNERSHIP]: {
    id: 'ownership',
    title: 'What type of property do you own?',
    subtitle: 'This helps us understand your situation and connect you with the right partners.',
    type: 'radio',
    required: true,
    options: [
      {
        value: 'building',
        label: 'I own a building',
        description: 'Commercial, industrial, or residential property with structures'
      },
      {
        value: 'land',
        label: 'I own land',
        description: 'Vacant land or property available for development'
      }
    ]
  },

  [STEPS.INTERESTS]: {
    id: 'interests',
    title: 'What are you interested in?',
    subtitle: 'Select all that apply. We\'ll match you with partners who can help.',
    type: 'checkbox',
    required: true,
    conditional: 'showInterestsQuestion',
    options: [
      {
        value: 'home_energy',
        label: 'Building home energy',
        description: 'Solar panels, battery storage, backup generators',
        popup: {
          title: 'Building Home Energy',
          content: 'Install renewable energy systems on your property to reduce utility costs and gain energy independence. Options include rooftop or ground-mount solar panels, battery storage systems for backup power, and generators for emergency use. These systems can significantly reduce or eliminate your electricity bills while increasing property value.'
        }
      },
      {
        value: 'home_systems',
        label: 'Improving home systems',
        description: 'HVAC upgrades, LED retrofit, efficiency improvements',
        popup: {
          title: 'Improving Home Systems',
          content: 'Upgrade your building\'s systems to reduce energy consumption and improve comfort. This includes high-efficiency HVAC systems, LED lighting retrofits, building automation, and insulation improvements. Many of these upgrades pay for themselves through energy savings and may qualify for incentives and rebates.'
        }
      },
      {
        value: 'infrastructure',
        label: 'Contribute to energy infrastructure',
        description: 'Data center development, solar farm, utility-scale projects',
        popup: {
          title: 'Energy Infrastructure Development',
          content: 'Lease or develop your land for utility-scale energy projects. This can include data center campuses, solar farms, battery storage facilities, or grid infrastructure. These projects typically require larger parcels (10+ acres) and can provide significant long-term income through lease payments or energy sales.'
        }
      },
      {
        value: 'unsure',
        label: 'I\'m not sure yet',
        description: 'Help me explore my options',
        popup: {
          title: 'Explore Your Options',
          content: 'Not sure which path is right for you? That\'s okay! We\'ll analyze your property and provide recommendations based on your location, property characteristics, and local market conditions. Our report will help you understand all the opportunities available to you.'
        }
      }
    ]
  },

  [STEPS.LOCATION]: {
    id: 'location',
    title: 'Where is your property located?',
    subtitle: 'Enter your address and confirm the location on the map.',
    type: 'address',
    required: true
  },

  [STEPS.PROPERTY_DETAILS]: {
    id: 'property_details',
    title: 'Tell us about your property',
    subtitle: 'Fill in as much as you know - you don\'t need to complete every field.',
    type: 'form',
    required: false,
    fields: [
      // Basic property info - reordered for ease of answering
      {
        id: 'type',
        label: 'Property type',
        type: 'select',
        options: [
          { value: '', label: 'N/A' },
          { value: 'residential', label: 'Residential' },
          { value: 'commercial', label: 'Commercial' },
          { value: 'industrial', label: 'Industrial' },
          { value: 'agricultural', label: 'Agricultural' },
          { value: 'mixed', label: 'Mixed Use' }
        ]
      },
      {
        id: 'zoning',
        label: 'Zoning',
        type: 'select',
        options: [
          { value: '', label: 'N/A' },
          { value: 'residential', label: 'Residential' },
          { value: 'commercial', label: 'Commercial' },
          { value: 'industrial', label: 'Industrial' },
          { value: 'agricultural', label: 'Agricultural' },
          { value: 'mixed', label: 'Mixed Use' },
          { value: 'unknown', label: 'Unknown' }
        ]
      },
      {
        id: 'energySource',
        label: 'Current primary energy source',
        type: 'select',
        options: [
          { value: '', label: 'N/A' },
          { value: 'grid', label: 'Grid electricity' },
          { value: 'solar', label: 'Solar' },
          { value: 'gas', label: 'Natural gas' },
          { value: 'propane', label: 'Propane' },
          { value: 'oil', label: 'Oil' },
          { value: 'mixed', label: 'Mixed sources' }
        ]
      },
      {
        id: 'acres',
        label: 'Acres of land',
        type: 'slider',
        min: 0,
        max: 500,
        step: 1,
        default: 5,
        format: (v) => v.toString() + ' acres'
      },
      {
        id: 'sqft',
        label: 'Total building square footage',
        type: 'slider',
        min: 500,
        max: 100000,
        step: 500,
        default: 5000,
        format: (v) => v.toLocaleString() + ' sq ft'
      },
      {
        id: 'buildings',
        label: 'Number of buildings on property',
        type: 'slider',
        min: 1,
        max: 20,
        step: 1,
        default: 1,
        format: (v) => v.toString()
      },
      {
        id: 'yearBuilt',
        label: 'Year built (if applicable)',
        type: 'slider',
        min: 1950,
        max: 2025,
        step: 1,
        default: 2000,
        format: (v) => v.toString()
      }
    ],
    additionalFields: {
      header: 'Additional Details',
      subtitle: 'These help our partners prepare better recommendations',
      fields: [
        // Easy questions - likely know off top of head
        {
          id: 'ownsProperty',
          label: 'Do you currently own this property?',
          type: 'select',
          options: [
            { value: '', label: 'N/A' },
            { value: 'yes', label: 'Yes' },
            { value: 'no', label: 'No' },
            { value: 'pending', label: 'Purchase pending' }
          ]
        },
        {
          id: 'buildingUse',
          label: 'What is the building currently used for?',
          type: 'select',
          options: [
            { value: '', label: 'N/A' },
            { value: 'retail', label: 'Retail' },
            { value: 'office', label: 'Office' },
            { value: 'industrial', label: 'Industrial/Warehouse' },
            { value: 'multifamily', label: 'Multi-family residential' },
            { value: 'flex', label: 'Flex space' },
            { value: 'vacant', label: 'Vacant' },
            { value: 'other', label: 'Other' }
          ]
        },
        {
          id: 'stories',
          label: 'Number of stories',
          type: 'slider',
          min: 1,
          max: 50,
          step: 1,
          default: 2,
          format: (v) => v.toString()
        },
        {
          id: 'flatAcres',
          label: 'Acres of flat land around the property',
          type: 'slider',
          min: 0,
          max: 500,
          step: 1,
          default: 0,
          format: (v) => v.toString() + ' acres'
        },
        {
          id: 'voltage',
          label: 'Voltage currently on property',
          type: 'select',
          options: [
            { value: '', label: 'N/A' },
            { value: '120v', label: '120V' },
            { value: '208v', label: '208V' },
            { value: '240v', label: '240V' },
            { value: '277v', label: '277V' },
            { value: '480v', label: '480V' },
            { value: 'unknown', label: 'Unknown' }
          ]
        },
        // Medium questions - might need to look up
        {
          id: 'electricUtility',
          label: 'Name of Electric Utility',
          type: 'text',
          placeholder: 'e.g., Pacific Gas & Electric'
        },
        {
          id: 'retailEnergyProvider',
          label: 'Retail Energy Provider (if different than Utility)',
          type: 'text',
          placeholder: 'N/A if same as utility'
        },
        {
          id: 'utilityMeters',
          label: 'Number of Utility Meters',
          type: 'slider',
          min: 1,
          max: 20,
          step: 1,
          default: 1,
          format: (v) => v.toString()
        },
        {
          id: 'monthlyElectricSpend',
          label: 'Current monthly electric utility spend',
          type: 'slider',
          min: 0,
          max: 10000,
          step: 50,
          default: 500,
          format: (v) => '$' + v.toLocaleString()
        },
        {
          id: 'taxLots',
          label: 'How many tax lots?',
          type: 'slider',
          min: 1,
          max: 10,
          step: 1,
          default: 1,
          format: (v) => v.toString()
        },
        {
          id: 'hasDebt',
          label: 'Is there debt on the property?',
          type: 'select',
          options: [
            { value: '', label: 'N/A' },
            { value: 'yes', label: 'Yes' },
            { value: 'no', label: 'No' },
            { value: 'unknown', label: 'Prefer not to say' }
          ]
        },
        // Harder questions - may need research
        {
          id: 'utilityTariff',
          label: 'Utility Tariff',
          type: 'text',
          placeholder: 'e.g., TOU-GS-3'
        },
        {
          id: 'energyCharges',
          label: 'Energy Charges (per kWh)',
          type: 'slider',
          min: 0.01,
          max: 0.50,
          step: 0.01,
          default: 0.12,
          format: (v) => '$' + v.toFixed(2) + '/kWh'
        },
        {
          id: 'demandCharges',
          label: 'Demand Charges (per kW)',
          type: 'slider',
          min: 0,
          max: 50,
          step: 1,
          default: 15,
          format: (v) => '$' + v + '/kW'
        },
        {
          id: 'loadGrowth',
          label: 'Anticipated Load Growth/Reduction',
          type: 'select',
          options: [
            { value: '', label: 'N/A' },
            { value: 'significant_growth', label: 'Significant growth expected' },
            { value: 'moderate_growth', label: 'Moderate growth expected' },
            { value: 'stable', label: 'Stable - no change expected' },
            { value: 'moderate_reduction', label: 'Moderate reduction expected' },
            { value: 'significant_reduction', label: 'Significant reduction expected' }
          ]
        },
        {
          id: 'roofRights',
          label: 'Do you have roof rights on all portions of the roof?',
          type: 'select',
          options: [
            { value: '', label: 'N/A' },
            { value: 'yes', label: 'Yes - full rights' },
            { value: 'partial', label: 'Partial rights' },
            { value: 'no', label: 'No' },
            { value: 'unknown', label: 'Unknown' }
          ]
        },
        {
          id: 'roofMaterial',
          label: 'What roofing material is on the roof?',
          type: 'select',
          options: [
            { value: '', label: 'N/A' },
            { value: 'tpo', label: 'TPO' },
            { value: 'epdm', label: 'EPDM' },
            { value: 'metal', label: 'Metal' },
            { value: 'shingle', label: 'Asphalt Shingle' },
            { value: 'tile', label: 'Tile' },
            { value: 'builtup', label: 'Built-up (BUR)' },
            { value: 'pvc', label: 'PVC' },
            { value: 'other', label: 'Other' },
            { value: 'unknown', label: 'Unknown' }
          ]
        },
        {
          id: 'roofLastReplaced',
          label: 'Year roof was last replaced/repaired',
          type: 'slider',
          min: 1980,
          max: 2025,
          step: 1,
          default: 2015,
          format: (v) => v.toString()
        },
        {
          id: 'roofWarranty',
          label: 'Roof warranty expiration year',
          type: 'slider',
          min: 2024,
          max: 2050,
          step: 1,
          default: 2030,
          format: (v) => v.toString()
        },
        {
          id: 'plannedRenovations',
          label: 'Are there current renovations or building changes planned?',
          type: 'select',
          options: [
            { value: '', label: 'N/A' },
            { value: 'yes_major', label: 'Yes - major renovations' },
            { value: 'yes_minor', label: 'Yes - minor changes' },
            { value: 'considering', label: 'Considering options' },
            { value: 'no', label: 'No' }
          ]
        }
      ]
    }
  },

  [STEPS.INTEREST_CONFIRM]: {
    id: 'interest_confirm',
    title: 'What would you like to learn more about?',
    subtitle: 'Select the options you want to explore further.',
    type: 'interest_confirm',
    required: true,
    conditional: 'showInterestConfirm'
  },

  [STEPS.ENERGY_BILLS]: {
    id: 'energy_bills',
    title: 'What are your current energy costs?',
    subtitle: 'This helps us estimate potential savings through energy procurement.',
    type: 'form',
    required: false,
    skippable: true,
    conditional: 'showIdealQuestions', // Only show if in deregulated state with energy interest
    fields: [
      {
        id: 'electricity',
        label: 'Average monthly electricity bill',
        type: 'slider',
        min: 50,
        max: 3000,
        step: 10,
        default: 200,
        format: (v) => '$' + v.toLocaleString()
      },
      {
        id: 'gas',
        label: 'Average monthly gas bill',
        type: 'slider',
        min: 0,
        max: 1500,
        step: 10,
        default: 100,
        format: (v) => '$' + v.toLocaleString()
      }
    ]
  },

  [STEPS.DOCUMENTS]: {
    id: 'documents',
    title: 'Can you provide more information?',
    subtitle: 'Upload documents to help our partners prepare your quote. You can skip this step and provide later.',
    type: 'upload',
    required: false,
    skippable: true,
    conditional: 'showIdealQuestions',
    fields: [
      {
        id: 'loa',
        label: 'Letter of Authorization (LOA)',
        description: 'Authorizes us to request information from your utility on your behalf',
        accept: '.pdf,.doc,.docx,.jpg,.png'
      },
      {
        id: 'loe',
        label: 'Letter of Exclusivity (LOE)',
        description: 'Ensures you receive the best competitive rates',
        accept: '.pdf,.doc,.docx,.jpg,.png'
      },
      {
        id: 'bill',
        label: 'Copy of last utility bill',
        description: 'Helps us understand your current rates and usage',
        accept: '.pdf,.jpg,.png'
      },
      {
        id: 'contract',
        label: 'Current energy contract (if available)',
        description: 'Optional - helps us understand your current agreement',
        accept: '.pdf,.doc,.docx',
        optional: true
      }
    ]
  },

  [STEPS.ANALYSIS]: {
    id: 'analysis',
    title: 'Your Property Analysis',
    subtitle: 'Based on your location and property details, here\'s what we found.',
    type: 'report'
  },

  [STEPS.EMAIL]: {
    id: 'email',
    title: 'Connect with our partners',
    subtitle: 'Select the companies you\'d like to learn more about, then enter your email to receive personalized information.',
    type: 'partner_selection',
    required: true
  }
};

/**
 * Check if realtor question should be shown
 * Only show if user selected 'sell_land' as a purpose
 * @param {object} userData - User data
 * @returns {boolean}
 */
export function showRealtorQuestion(userData) {
  const purposes = userData?.purpose || [];
  return purposes.includes('sell_land');
}

/**
 * Check if interests question should be shown
 * Only show if user selected infrastructure investment or building upgrades
 * Skip if they only want property valuation
 * @param {object} userData - User data
 * @returns {boolean}
 */
export function showInterestsQuestion(userData) {
  const purposes = userData?.purpose || [];
  // Show if they selected anything other than just valuation
  const hasInfrastructure = purposes.includes('invest_infrastructure');
  const hasUpgrades = purposes.includes('upgrade_building');
  return hasInfrastructure || hasUpgrades;
}

/**
 * Check if interest confirmation step should be shown
 * Only show when there are multiple options to choose from
 * @param {object} userData - User data
 * @returns {boolean}
 */
export function showInterestConfirm(userData) {
  const interests = userData?.interests || [];

  // Count how many confirmable options the user has
  const hasHomeEnergy = interests.includes('home_energy');
  const hasHomeSystems = interests.includes('home_systems');
  const hasUnsure = interests.includes('unsure');

  // Show if user selected 'unsure' (which implies both options)
  // OR if user selected both home_energy AND home_systems
  if (hasUnsure) return true;
  if (hasHomeEnergy && hasHomeSystems) return true;

  // If only one option was selected, auto-confirm that interest
  // and skip the confirmation step
  return false;
}

/**
 * Get the visible steps based on user data
 * @param {object} userData - Current user data
 * @param {function} showIdealQuestions - Function to check Ideal pathway eligibility
 * @returns {string[]} - Array of visible step IDs
 */
export function getVisibleSteps(userData, showIdealQuestions) {
  return STEP_ORDER.filter(stepId => {
    const question = QUESTIONS[stepId];
    if (!question.conditional) return true;

    if (question.conditional === 'showIdealQuestions') {
      return showIdealQuestions(userData);
    }

    if (question.conditional === 'showInterestConfirm') {
      return showInterestConfirm(userData);
    }

    if (question.conditional === 'showRealtorQuestion') {
      return showRealtorQuestion(userData);
    }

    if (question.conditional === 'showInterestsQuestion') {
      return showInterestsQuestion(userData);
    }

    return true;
  });
}

/**
 * Get total step count for progress indicator
 * @param {object} userData - Current user data
 * @param {function} showIdealQuestions - Function to check Ideal pathway eligibility
 * @returns {number}
 */
export function getTotalSteps(userData, showIdealQuestions) {
  return getVisibleSteps(userData, showIdealQuestions).length;
}

/**
 * Get current step index (1-based for display)
 * @param {string} currentStep - Current step ID
 * @param {object} userData - Current user data
 * @param {function} showIdealQuestions - Function to check Ideal pathway eligibility
 * @returns {number}
 */
export function getCurrentStepIndex(currentStep, userData, showIdealQuestions) {
  const visibleSteps = getVisibleSteps(userData, showIdealQuestions);
  return visibleSteps.indexOf(currentStep) + 1;
}
