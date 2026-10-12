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
    metrics:       { tabName: 'Kennzahlen',           tabID: 445934490 }
  }
};
