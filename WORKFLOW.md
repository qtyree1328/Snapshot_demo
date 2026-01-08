# Snapshot Questionnaire - User Flow & Pathway Diagram

## Overview
This document outlines all user pathways through the Snapshot questionnaire system that connects property owners to energy infrastructure partners.

---

## Visual Flow Diagram

```
                                    ┌─────────────────────┐
                                    │      START          │
                                    │   (Landing Page)    │
                                    └──────────┬──────────┘
                                               │
                                               ▼
                            ┌──────────────────────────────────┐
                            │     STEP 1: Property Type        │
                            │  "What type of property do you   │
                            │          own?"                   │
                            └──────────┬───────────────────────┘
                                       │
                       ┌───────────────┴───────────────┐
                       │                               │
                       ▼                               ▼
              ┌────────────────┐              ┌────────────────┐
              │  "I own a      │              │  "I own        │
              │   building"    │              │   land"        │
              └───────┬────────┘              └───────┬────────┘
                      │                               │
                      └───────────────┬───────────────┘
                                      │
                                      ▼
                     ┌────────────────────────────────────┐
                     │     STEP 2: Interests (Multi-      │
                     │            Select)                 │
                     │  Same options for both paths:      │
                     │  □ Building home energy (solar,    │
                     │    batteries, backup generator)    │
                     │  □ Improving home systems (HVAC,   │
                     │    LED retrofit)                   │
                     │  □ Contribute to energy infra-     │
                     │    structure (data center, solar)  │
                     │  □ Unsure                          │
                     │                                    │
                     │  [i] Info popups for each option   │
                     └───────────────┬────────────────────┘
                                     │
                                     ▼
                     ┌────────────────────────────────────┐
                     │     STEP 3: Location Input         │
                     │  - Address search with autocomplete│
                     │  - Interactive map with pin        │
                     │  - "Modify Pin" for precision      │
                     │  - "Confirm Location" button       │
                     │                                    │
                     │  [System checks state for          │
                     │   deregulation status]             │
                     └───────────────┬────────────────────┘
                                     │
                                     ▼
                     ┌────────────────────────────────────┐
                     │     STEP 4: Property Details       │
                     │         (Skippable)                │
                     │  - Building square footage         │
                     │  - Number of buildings             │
                     │  - Acres of land                   │
                     │  - Property type                   │
                     │  - Zoning                          │
                     │  - Year built                      │
                     │  - Current energy source           │
                     └───────────────┬────────────────────┘
                                     │
            ┌────────────────────────┴────────────────────────┐
            │                                                 │
            │         CONDITIONAL CHECK:                      │
            │         Is state deregulated (electricity       │
            │         OR gas) AND user selected "Building     │
            │         home energy" OR "Unsure"?               │
            │                                                 │
            └────────────────┬────────────────────────────────┘
                             │
             ┌───────────────┴───────────────┐
             │                               │
             ▼                               ▼
    ┌─────────────────┐             ┌─────────────────┐
    │      YES        │             │       NO        │
    │ Show Ideal Path │             │  Skip to Step 7 │
    └────────┬────────┘             └────────┬────────┘
             │                               │
             ▼                               │
┌────────────────────────────┐               │
│   STEP 5: Energy Bills     │               │
│      (Skippable)           │               │
│  - Monthly electricity     │               │
│    bill slider ($50-$3000) │               │
│  - Monthly gas bill        │               │
│    slider ($0-$1500)       │               │
└───────────┬────────────────┘               │
            │                                │
            ▼                                │
┌────────────────────────────┐               │
│   STEP 6: Document Upload  │               │
│      (Skippable)           │               │
│  "Can you provide more     │               │
│   information?"            │               │
│  - LOA upload              │               │
│  - LOE upload              │               │
│  - Bill copy upload        │               │
│  - Energy contract upload  │               │
│                            │               │
│  Ideal Energy Contact:     │               │
│  📧 partners@idealenergy.. │               │
│  📞 (555) 123-4567         │               │
└───────────┬────────────────┘               │
            │                                │
            └───────────────┬────────────────┘
                            │
                            ▼
            ┌────────────────────────────────────┐
            │     STEP 7: Analysis & Report      │
            │  [Loading: Analyzing property...]  │
            │                                    │
            │  - Queries SnapshotSDK APIs:       │
            │    • Transmission lines            │
            │    • Substations                   │
            │    • Pipelines                     │
            │    • Wetlands (NWI)                │
            │    • Flood zones (FEMA)            │
            │    • Protected areas               │
            │    • Critical habitat              │
            │    • Solar resource (NREL)         │
            │    • Risk index (NRI)              │
            │                                    │
            │  - Calculates Solar Score (0-100)  │
            │  - Calculates DC Score (0-100)     │
            │  - Identifies fatal flaws/warnings │
            │  - Determines partner pathways     │
            └───────────────┬────────────────────┘
                            │
                            ▼
            ┌────────────────────────────────────┐
            │       Report Card Display          │
            │  ┌─────────────┬─────────────┐     │
            │  │ Solar Score │  DC Score   │     │
            │  │     ##      │     ##      │     │
            │  │  [Rating]   │  [Rating]   │     │
            │  └─────────────┴─────────────┘     │
            │                                    │
            │  ⚠️ Fatal Flaws (if any)           │
            │  ⚡ Infrastructure Summary          │
            │  🌿 Environmental Summary          │
            │  ☀️ Solar Resource                 │
            │  🤝 Partner Recommendations        │
            └───────────────┬────────────────────┘
                            │
                            ▼
            ┌────────────────────────────────────┐
            │     STEP 8: Email Capture          │
            │  "Get your detailed report"        │
            │                                    │
            │  [email input field]               │
            │                                    │
            │  "We'll send your complete         │
            │   property analysis..."            │
            │                                    │
            │        [Submit Button]             │
            └───────────────┬────────────────────┘
                            │
                            ▼
            ┌────────────────────────────────────┐
            │        SUCCESS SCREEN              │
            │  🎉                                │
            │  "Thank You!"                      │
            │  Your report will be sent to...   │
            │                                    │
            │  Matched Partners:                 │
            │  - [Partner cards based on         │
            │     pathway matching]              │
            │                                    │
            │  [Start New Analysis]              │
            └────────────────────────────────────┘
```

---

## Partner Pathway Logic

### 1. Ideal Energy Path
**Triggers when ALL conditions are met:**
- State is deregulated for electricity OR gas
- User selected "Building home energy" OR "Unsure"
- Combined monthly bill >= $100

**Services:** Energy bill auctions, contract optimization

---

### 2. Chipmunk Solar Path
**Triggers when ALL conditions are met:**
- User selected "Building home energy"
- Solar Score GHI >= 4.5 kWh/m²/day (Good or better)

**Services:** Rooftop/ground-mount solar, battery storage, EV charging

---

### 3. Redaptive Path
**Triggers when:**
- User selected "Improving home systems"

**Preferred for:** Commercial/industrial properties

**Services:** HVAC optimization, LED retrofit, building automation

---

### 4. Infrastructure Development Path
**Triggers when:**
- User selected "Contribute to energy infrastructure"

**Preferred for:** Properties with 10+ acres

**Services:** Data center sites, utility-scale solar, grid infrastructure

---

## Deregulated States Reference

### Electricity - Fully Deregulated
TX, PA, OH, IL, NY, NJ, CT, MA, MD, ME, NH, DE, DC

### Electricity - Partially Deregulated
CA, MI, VA, GA, NV, OR, MT

### Natural Gas - Deregulated
TX, PA, OH, IL, NY, NJ, CT, MA, MD, ME, NH, GA, VA, FL

---

## Scoring Criteria

### Solar Score (0-100)
| Factor | Impact |
|--------|--------|
| GHI >= 5.5 | No deduction |
| GHI 5.0-5.5 | -5 points |
| GHI 4.5-5.0 | -10 points |
| GHI 4.0-4.5 | -20 points |
| GHI < 4.0 | -30 points |
| Unknown GHI | -15 points |
| High-risk flood zone | -40 points |
| Moderate flood zone | -10 points |
| Wetlands nearby | -10 points |
| Protected area | -50 points |
| Critical habitat | -40 points |

### Data Center Score (0-100)
| Factor | Impact |
|--------|--------|
| No transmission lines within 2mi | -25 points |
| No substations within 2mi | -20 points |
| High-risk flood zone | -50 points |
| Moderate flood zone | -15 points |
| Wetlands nearby | -15 points |
| Protected area | -50 points |
| Critical habitat | -40 points |
| Very high NRI risk | -15 points |
| Relatively high NRI risk | -10 points |

---

## Data Persistence

### Session Storage (localStorage)
- `snapshot_questionnaire`: Current progress and user data
- `snapshot_submissions`: Array of completed submissions

### Saved Data Structure
```javascript
{
  ownershipType: 'building' | 'land',
  interests: string[],
  location: { lat, lng, address, state, confirmed },
  propertyDetails: { sqft, buildings, acres, type, zoning, yearBuilt },
  bills: { electricity, gas },
  documents: { loa, loe, bill, contract },
  email: string,
  pathways: string[],
  analysisResults: { solarScore, dcScore, ... },
  submittedAt: ISO timestamp,
  id: unique identifier
}
```

---

## File Structure

```
/Snapshot
├── index.html              # Main questionnaire page
├── styles.css              # Light theme styling
├── app.js                  # Core application logic
├── questionnaire-config.js # Question definitions
├── partners.js             # Partner routing logic
├── deregulated-states.js   # State lookup data
├── WORKFLOW.md             # This file
└── Reference_files/
    ├── index.html          # Original analysis tool
    └── snapshot-sdk.js     # SDK for spatial queries
```
