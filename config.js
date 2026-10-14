// CIVITAS/CORE Atlas – Google Sheets
// tabName = sichtbarer Blattname; tabID = numerische gid aus der Blatt-URL.
// Nur bestätigte tabIDs eintragen. Andere Tabs bleiben null, bis ihre gid bekannt ist.
export const CONFIG = {
  googleSheetsId: '1NDaw2ISOVn1VafGfnvVPx26FNZYxbrFMt4oMfqQ3TYY',
  fallbackToLocal: true,
  tabs: {
    members:       { tabName: 'Mitglied',              tabID: 209579919 },
    providers:     { tabName: 'IT-Dienstleister',      tabID: 1405389341 },
    municipalities:{ tabName: 'Kommune',              tabID: 1570808215 },
    utilities:     { tabName: 'Stadtwerke',           tabID: 2046985857 },
    others:        { tabName: 'Sonstige Nutzer_innen',tabID: 845507938 },
    projects:      { tabName: 'Projekte',             tabID: 133289270 },
    procurements:  { tabName: 'Öffentliche Aufträge', tabID: 208432178 },
    international: { tabName: 'International',        tabID: 953372847 },
    areas:         { tabName: 'Versorgungsgebiete',   tabID: 855637359 },
    metrics:       { tabName: 'Kennzahlen',           tabID: 445934490 },
    technologies:  { tabName: 'civitas_datenportal_technologien', tabID: null }
  }
};

// V3: Produkt-Logos von den jeweiligen Projekt-/Produktseiten.
// Externe Bilddateien werden direkt vom Anbieter geladen; bei Fehlern erscheint das Kürzel.
// Optional können die URLs durch lokal gespeicherte /assets/*.svg ersetzt werden.
export const TECHNOLOGY_LOGOS = {
  'CIVITAS/CORE': 'https://civitasconnect.digital/favicon.ico',
  'Masterportal': 'https://raw.githubusercontent.com/Dataport/masterportal/master/src/assets/img/Logo_Masterportal.svg',
  'Piveau': 'https://doc.piveau.io/favicon.ico',
  'CKAN': 'https://raw.githubusercontent.com/ckan/ckan/master/ckan/public/base/images/ckan-logo.png',
  'DKAN': 'https://getdkan.org/favicon.ico',
  'OpenDataSoft': 'https://www.opendatasoft.com/favicon.ico',
  'ArcGIS': 'https://www.arcgis.com/favicon.ico',
};
