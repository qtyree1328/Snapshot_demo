// Lightweight Snapshot SDK for browser ES module use.
// Centralizes API access, MapLibre helpers, and overlay configs.

const DEFAULT_OPTIONS = {
  debug: false,
  fetchTimeoutMs: 20000,
  maxConcurrent: 6,
  cacheTtlMs: 0,
  userAgentHeader: null
};

// MapRight wetlands source-layer ids (order matters for predictable layer ids).
const MAPRIGHT_WETLAND_SOURCE_LAYERS = [
  'Wetlands_HI_20231027_1698423063.5217037',
  'Wetlands_AK3_20231030_1698731010.392679',
  'Wetlands_3_20231030_1698768698.5538049',
  'Wetlands_AK1_20231030_1698701662.3827837',
  'Wetlands_AK2_20231030_1698730585.397208',
  'Wetlands_1_20231107_1699472081.0077796',
  'Wetlands_2_20231107_1699427262.9916897',
  'Wetlands_Rip_20231113_1699902696.01962'
];

const MAPRIGHT_WETLAND_LAYER_IDS = MAPRIGHT_WETLAND_SOURCE_LAYERS.map(
  (_, idx) => `wetlands_mapright_${idx}`
);

const NFDF_OVERLAY = {
  sourceId: 'nflood_tiles',
  layerId: 'nflood_floodzones',
  tiles: [
    'https://api.nationalflooddata.com/v3/specialized/floodtiles1/{z}/{x}/{y}.pbf?x-api-key=cdXEOPkdCoiYUPQ4JN9f6VcpoNi3qxl8cGZRUbBi'
  ],
  sourceLayer: 'default',
  style: {
    paint: { 'fill-color': '#f97316', 'fill-opacity': 0.35 },
    layout: { visibility: 'none' }
  }
};

const MAPRIGHT_WETLANDS_OVERLAY = {
  sourceId: 'wetlands_mapright',
  tiles: [
    'https://a.tiles.mapbox.com/v4/mapright2.Wetlands_HI_20231027_1698423129,mapright2.Wetlands_AK3_20231030_1698732312,mapright2.Wetlands_3_20231030_1698776568,mapright2.Wetlands_AK1_20231030_1698702921,mapright2.Wetlands_AK2_20231030_1698730908,mapright2.Wetlands_1_20231107_1699493429,mapright2.Wetlands_2_20231107_1699449165,mapright2.Wetlands_Rip_20231113_1699903114/{z}/{x}/{y}.vector.pbf?access_token=pk.eyJ1IjoibWFwcmlnaHQyIiwiYSI6IkpMTE8tT0EifQ.BVYqz1Tp-th28TXPgg3rrQ',
    'https://b.tiles.mapbox.com/v4/mapright2.Wetlands_HI_20231027_1698423129,mapright2.Wetlands_AK3_20231030_1698732312,mapright2.Wetlands_3_20231030_1698776568,mapright2.Wetlands_AK1_20231030_1698702921,mapright2.Wetlands_AK2_20231030_1698730908,mapright2.Wetlands_1_20231107_1699493429,mapright2.Wetlands_2_20231107_1699449165,mapright2.Wetlands_Rip_20231113_1699903114/{z}/{x}/{y}.vector.pbf?access_token=pk.eyJ1IjoibWFwcmlnaHQyIiwiYSI6IkpMTE8tT0EifQ.BVYqz1Tp-th28TXPgg3rrQ'
  ],
  minzoom: 12,
  maxzoom: 14,
  style: {
    paint: { 'fill-color': '#3b82f6', 'fill-opacity': 0.35 },
    layout: { visibility: 'none' }
  }
};

const NFHL_OVERLAY = {
  sourceId: 'nfhl_fema',
  layerId: 'nfhl_fema_fill',
  url: 'https://hazards.fema.gov/arcgis/rest/services/public/NFHL/MapServer/28/query',
  style: {
    paint: { 'fill-color': '#fb923c', 'fill-opacity': 0.4 },
    layout: { visibility: 'none' }
  }
};

const DATASETS = Object.freeze({
  wetlands: 'https://fwspublicservices.wim.usgs.gov/wetlandsmapservice/rest/services/Wetlands/MapServer/0/query',
  flood: 'https://services.arcgis.com/P3ePLMYs2RVChkJx/arcgis/rest/services/USA_Flood_Hazard_Reduced_Set_gdb/FeatureServer/0/query',
  protected: 'https://services.arcgis.com/v01gqwM5QqNysAAi/arcgis/rest/services/Manager_Name/FeatureServer/0/query',
  crithab_final_poly: 'https://services.arcgis.com/QVENGdaPbd4LUkLV/ArcGIS/rest/services/USFWS_Critical_Habitat/FeatureServer/0/query',
  crithab_final_line: 'https://services.arcgis.com/QVENGdaPbd4LUkLV/ArcGIS/rest/services/USFWS_Critical_Habitat/FeatureServer/1/query',
  crithab_proposed_poly: 'https://services.arcgis.com/QVENGdaPbd4LUkLV/ArcGIS/rest/services/USFWS_Critical_Habitat/FeatureServer/2/query',
  crithab_proposed_line: 'https://services.arcgis.com/QVENGdaPbd4LUkLV/ArcGIS/rest/services/USFWS_Critical_Habitat/FeatureServer/3/query',
  trans: 'https://services2.arcgis.com/FiaPA4ga0iQKduv3/arcgis/rest/services/US_Electric_Power_Transmission_Lines/FeatureServer/0/query',
  subs: 'https://services6.arcgis.com/OO2s4OoyCZkYJ6oE/arcgis/rest/services/Substations/FeatureServer/0/query',
  pipe: 'https://services2.arcgis.com/FiaPA4ga0iQKduv3/arcgis/rest/services/Natural_Gas_Interstate_and_Intrastate_Pipelines_1/FeatureServer/0/query',
  nri: 'https://services.arcgis.com/XG15cJAlne2vxtgt/arcgis/rest/services/National_Risk_Index_Census_Tracts/FeatureServer/0/query'
});

const ENDPOINTS = Object.freeze({
  nlcdIdentify: 'https://sampleserver6.arcgisonline.com/arcgis/rest/services/NLCDLandCover2001/ImageServer/identify',
  sdaTabular: 'https://sdmdataaccess.nrcs.usda.gov/Tabular/SDMTabularService/post.rest'
});

const cacheStore = new Map(); // key -> {data, expires}
let options = { ...DEFAULT_OPTIONS };
let activeCount = 0;
const queue = [];

function log(...args) {
  if (options.debug) console.log('[SnapshotSDK]', ...args);
}
function warn(...args) {
  if (options.debug) console.warn('[SnapshotSDK]', ...args);
}
function error(...args) {
  if (options.debug) console.error('[SnapshotSDK]', ...args);
}

function enqueue(task) {
  return new Promise((resolve, reject) => {
    queue.push(async () => {
      try {
        const result = await task();
        resolve(result);
      } catch (err) {
        reject(err);
      } finally {
        activeCount -= 1;
        runNext();
      }
    });
    runNext();
  });
}

function runNext() {
  if (activeCount >= options.maxConcurrent) return;
  const next = queue.shift();
  if (!next) return;
  activeCount += 1;
  next();
}

function serializeParams(params = {}) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, val]) => {
    if (val === undefined || val === null) return;
    if (Array.isArray(val)) {
      val.forEach(v => search.append(key, v));
    } else {
      search.set(key, String(val));
    }
  });
  return search.toString();
}

function cacheKey(url) {
  return url;
}

export const SnapshotSDK = {
  init(opts = {}) {
    options = { ...DEFAULT_OPTIONS, ...opts };
    log('SDK initialized', options);
    return this;
  },

  withTimeout(promiseOrFactory, ms = options.fetchTimeoutMs, label = 'request') {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), ms);
    const runPromise =
      typeof promiseOrFactory === 'function'
        ? promiseOrFactory(controller.signal)
        : promiseOrFactory;
    return Promise.resolve(runPromise)
      .catch(err => {
        if (err?.name === 'AbortError') {
          throw new Error(`${label} timed out after ${ms}ms`);
        }
        throw err;
      })
      .finally(() => clearTimeout(timeoutId));
  },

  async fetchJson(url, { params, headers } = {}) {
    const query = params ? serializeParams(params) : '';
    const finalUrl = query ? `${url}?${query}` : url;
    const key = cacheKey(finalUrl);

    if (options.cacheTtlMs > 0) {
      const cached = cacheStore.get(key);
      if (cached && cached.expires > Date.now()) {
        return cached.data;
      }
    }

    const headersObj = new Headers(headers || {});
    if (options.userAgentHeader) {
      try {
        headersObj.set('User-Agent', options.userAgentHeader);
      } catch (e) {
        warn('User-Agent header blocked by browser', e);
      }
    }

    const resp = await this.withTimeout(
      signal => fetch(finalUrl, { headers: headersObj, signal }),
      options.fetchTimeoutMs,
      `fetch ${finalUrl}`
    );
    if (!resp.ok) {
      throw new Error(`Request failed ${resp.status} for ${finalUrl}`);
    }
    const data = await resp.json();

    if (options.cacheTtlMs > 0) {
      cacheStore.set(key, { data, expires: Date.now() + options.cacheTtlMs });
    }

    return data;
  },

  async esriQueryGeoJSON(esriQueryUrl, bbox, opts = {}) {
    const {
      outFields = '*',
      spatialRel = 'esriSpatialRelIntersects',
      geometryType = 'esriGeometryEnvelope',
      wkid = 4326,
      resultRecordCount,
      additionalParams = {}
    } = opts;

    return enqueue(async () => {
      try {
        const params = {
          f: 'geojson',
          returnGeometry: 'true',
          outFields,
          spatialRel,
          geometry: JSON.stringify({
            xmin: bbox[0],
            ymin: bbox[1],
            xmax: bbox[2],
            ymax: bbox[3],
            spatialReference: { wkid }
          }),
          geometryType,
          ...additionalParams
        };
        if (resultRecordCount) params.resultRecordCount = resultRecordCount;

        const data = await this.fetchJson(esriQueryUrl, { params });
        return data?.features || [];
      } catch (err) {
        warn('ESRI query failed', esriQueryUrl, err);
        return [];
      }
    });
  },

  async fetchNFHL(bbox) {
    return this.esriQueryGeoJSON(NFHL_OVERLAY.url, bbox);
  },

  async sampleEsriImageServerIdentify(imageServerIdentifyUrl, lng, lat, opts = {}) {
    const params = {
      f: 'json',
      geometryType: 'esriGeometryPoint',
      returnGeometry: 'false',
      geometry: JSON.stringify({ x: lng, y: lat, spatialReference: { wkid: 4326 } }),
      ...opts
    };
    try {
      return await this.fetchJson(imageServerIdentifyUrl, { params });
    } catch (err) {
      warn('Identify request failed', imageServerIdentifyUrl, err);
      return null;
    }
  },

  classifyNLCD(value, mapping) {
    return mapping?.[value] || 'Unknown';
  },

  ensureGeoJSONSource(map, id, data = { type: 'FeatureCollection', features: [] }) {
    if (map.getSource(id)) return;
    map.addSource(id, { type: 'geojson', data });
  },

  ensureVectorTileSource(map, id, cfg) {
    if (map.getSource(id)) return;
    map.addSource(id, { type: 'vector', ...cfg });
  },

  ensureLayer(map, layerDef, beforeId) {
    if (map.getLayer(layerDef.id)) return;
    try {
      if (beforeId && map.getLayer(beforeId)) {
        map.addLayer(layerDef, beforeId);
      } else {
        map.addLayer(layerDef);
      }
    } catch (e) {
      warn('Failed to add layer', layerDef.id, e);
    }
  },

  setLayerVisibility(map, layerIdOrIds, visible) {
    const ids = Array.isArray(layerIdOrIds) ? layerIdOrIds : [layerIdOrIds];
    const vis = visible ? 'visible' : 'none';
    ids.forEach(id => {
      if (map.getLayer(id)) {
        try {
          map.setLayoutProperty(id, 'visibility', vis);
        } catch (e) {
          warn('Failed to set visibility', id, e);
        }
      }
    });
  },

  getNFDFOverlay() {
    return NFDF_OVERLAY;
  },

  getMapRightWetlandsOverlay() {
    return MAPRIGHT_WETLANDS_OVERLAY;
  },

  getMapRightWetlandLayerIds() {
    return [...MAPRIGHT_WETLAND_LAYER_IDS];
  },

  getMapRightWetlandLayerDefs() {
    return MAPRIGHT_WETLAND_SOURCE_LAYERS.map((srcLayerId, idx) => ({
      id: MAPRIGHT_WETLAND_LAYER_IDS[idx],
      type: 'fill',
      source: MAPRIGHT_WETLANDS_OVERLAY.sourceId,
      'source-layer': srcLayerId,
      paint: { ...MAPRIGHT_WETLANDS_OVERLAY.style.paint },
      layout: { ...MAPRIGHT_WETLANDS_OVERLAY.style.layout }
    }));
  },

  getNFHLOverlay() {
    return NFHL_OVERLAY;
  },

  datasets: DATASETS,
  endpoints: ENDPOINTS
};
