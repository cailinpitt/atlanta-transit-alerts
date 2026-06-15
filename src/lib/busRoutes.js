// MARTA bus route display names, keyed by the public route_short_name used in alerts and realtime data.
// Generated from data/marta/gtfs/routes.txt.
export const BUS_ROUTE_NAMES = {
  1: 'Joseph E. Lowery Blvd / 17th St',
  2: 'Donald Lee Hollowell/Ponce de Leon',
  3: 'Martin Luther King Jr Drive',
  4: 'Moreland Avenue',
  5: 'Piedmont Rd / Sandy Springs',
  7: 'Boulevard / McDonough Boulevard',
  10: 'AUC / Hollywood Road',
  11: 'Defoor Avenue / Virginia Highland',
  12: 'Howell Mill Road',
  14: 'Blandtown / Hightower Road',
  15: 'Clifton Road / Candler Road',
  17: 'Clairmont Rd / North Druid Hills Rd',
  20: 'South DeKalb / Downtown Atlanta',
  21: 'Memorial Drive ITP',
  22: 'Glenwood',
  23: 'Peachtree Road / Buckhead',
  26: 'James Jackson Pkwy / Perry Blvd',
  32: 'Bouldercrest Road',
  34: '2nd Avenue / Clifton Springs Road',
  39: 'Buford Highway',
  42: 'McDaniel Street / Pryor Road',
  46: 'I-85 Access Road / Briarwood',
  48: 'I-85 Access Road / North Brookhaven',
  49: 'McDonough Boulevard / Hill Street',
  51: 'Joseph E. Boone / Ralph McGill',
  52: 'Marietta Road',
  55: 'Jonesboro Road',
  66: 'Brownlee Road / Harbin Road',
  67: 'Peyton Place',
  68: 'Donnelly Avenue / Beecher',
  71: 'Cascade Road',
  73: 'Fulton Industrial Boulevard',
  74: 'Flat Shoals Road',
  75: 'Lawrenceville Highway',
  78: 'Cleveland Avenue',
  79: 'Sylvan Road / Hapeville',
  80: 'Headland Drive / Sandtown',
  81: 'Venetian Hills',
  83: 'Campbellton Road',
  84: 'Washington/Camp Creek Marketplace',
  85: 'Roswell',
  87: 'Roswell Road / Dunwoody',
  88: 'Dunwoody Village / Georgetown',
  89: 'Old National Highway',
  95: 'Metropolitan Parkway',
  96: 'Dogwood Drive / Virginia Avenue',
  104: 'Winters Chapel Road',
  109: 'Peachcrest Road / Columbia Drive',
  111: 'South Hairston Rd/Wesley Chapel Rd',
  114: 'Columbia Dr / Snapfinger Woods Dr',
  115: 'Covington Highway',
  116: 'Redan Road',
  117: 'Stone Mountain / Panola Road',
  118: 'Rockbridge Road',
  119: 'Hairston Road',
  120: 'East Ponce De Leon Avenue',
  121: 'Memorial Drive OTP / Pleasantdale',
  125: 'Clarkston / Embry Hills',
  127: 'Winn Way',
  128: 'Valley Brook Road',
  132: 'Tilly Mill Road',
  140: 'North Point Parkway',
  162: 'Stanton Road / Alison Court',
  165: 'Fairburn Road / Camp Creek Parkway',
  178: 'Mount Zion Road',
  180: 'Roosevelt Highway',
  182: 'South Fulton Parkway',
  184: 'Buffington Road',
  185: 'Alpharetta',
  187: 'Godby Road / Sullivan Road',
  189: 'Scofield Road / Creel Road',
  191: 'Riverdale / ATL Intl Terminal',
  192: 'Old Dixie / Tara Blvd',
  193: 'Morrow / Jonesboro',
  194: 'Conley Road / Mount Zion',
  195: 'Forest Parkway',
  196: 'Upper Riverdale',
  197: 'Battle Creek Road',
  198: 'Southlake Parkway',
  800: 'Lovejoy',
  ATLSC: 'Atlanta Streetcar',
};

/**
 * Returns the display name for a bus route, or null if unknown.
 * @param {string|number} routeId
 * @returns {string|null}
 */
export function busRouteName(routeId) {
  return BUS_ROUTE_NAMES[routeId] ?? BUS_ROUTE_NAMES[String(routeId)] ?? null;
}

/**
 * Formats a bus route as `#121 Memorial Drive OTP / Pleasantdale` (or `#121` when unknown).
 * @param {string|number} routeId
 * @returns {string}
 */
export function formatBusRoute(routeId) {
  const name = busRouteName(routeId);
  const upper = String(routeId).toUpperCase();
  const prefix = upper === 'ATLSC' || upper === 'A' ? 'Streetcar' : `#${routeId}`;
  return name ? `${prefix} ${name}` : prefix;
}

export function compareBusRoutes(a, b) {
  const sa = String(a);
  const sb = String(b);
  if (sa.toUpperCase() === 'ATLSC' || sa.toUpperCase() === 'A') return 1;
  if (sb.toUpperCase() === 'ATLSC' || sb.toUpperCase() === 'A') return -1;
  const ma = sa.match(/\d+/);
  const mb = sb.match(/\d+/);
  const na = ma ? parseInt(ma[0], 10) : Number.NaN;
  const nb = mb ? parseInt(mb[0], 10) : Number.NaN;
  if (Number.isNaN(na) && Number.isNaN(nb)) return sa.localeCompare(sb);
  if (Number.isNaN(na)) return 1;
  if (Number.isNaN(nb)) return -1;
  return na - nb || sa.localeCompare(sb);
}
