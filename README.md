## Version 4 – Logo-Größen

Produktlogos werden in Filtern (32 × 32 px), Kartenmarkern (34 × 34 px) und Ergebnissen (40 × 40 px) proportional mit `object-fit: contain` eingepasst. Die Originalseitenverhältnisse bleiben erhalten; keine Logos werden abgeschnitten oder verzerrt.

# CIVITAS/CORE Atlas v11

## Start
```bash
npm install
npm run dev
```

## Google Sheets (ein Spreadsheet, getrennte Kategorie-Tabs)
1. Ein neues Google Spreadsheet erstellen.
2. Für jeden Tab aus `google-sheets-import/` einen gleichnamigen Tab erstellen und die CSV **in den jeweiligen Tab importieren** (Datei → Importieren → Tab ersetzen).
3. Das Spreadsheet als **Jeder mit dem Link: Betrachter** freigeben.
4. In `config.js` `googleSheetsId` aus der URL zwischen `/d/` und `/edit` eintragen. Bei abweichenden Blattnamen die Werte unter `tabs` anpassen (Schlüssel unverändert lassen).
5. Reload. Bei Fehlern greift `fallbackToLocal` auf lokale JSON-Daten zurück.

### Tabs
- `Mitglied`: nur **explizit belegte** Vereinsmitglieder. Darf leer sein; nicht aus CORE-Nutzung schließen.
- `IT-Dienstleister`: Organisationen mit Dienstleister- oder Entwicklungsbezug.
- `Kommune`: Städte, Kreise und Gemeinden.
- `Stadtwerke`: kommunale Betriebe.
- `Sonstige Nutzer*innen`: weitere Einrichtungen.
- `Projekte`: Beziehungen mit `customerNames` und `providerNames`.
- `Öffentliche Aufträge`: Vergabeverfahren.
- `International`: internationale Organisationen.
- `Versorgungsgebiete`: optionale GeoJSON-Flächen.
- `Kennzahlen`: Schlüssel/Wert-Metriken.

### Spalten
Organisations-Tabs besitzen dieselben Spalten: `id`, `name`, `website`, `logoUrl`, `logoSource`, `city`, `state`, `country`, `postalCodes`, `lat`, `lon`, `coreVersion`, `roles`, `evidence`, `source`, `notes`, `mock`.

**Mehrfachwerte mit `|` trennen**, z.B. `48143|48145` oder `Dienstleister|Entwicklung`. Die `source`-Spalte enthält den Link zur Quelle (Website, LinkedIn-Beitrag, Vergabeportal). `logoUrl` ist die Bildreferenz. PLZ als **Text** formatieren (führende Nullen!).

**Wichtig:** Das Tabellenblatt `Mitglied` ist absichtlich nur mit nachgewiesenen Mitgliedschaften befüllt. Eine CORE-Nutzung, ein LinkedIn-Follow oder ein Auftrag begründen keine Vereinsmitgliedschaft. Für die Kartenanzeige werden doppelte Organisations-IDs zusammengeführt.

Die lokalen JSON-Dateien bleiben für den Offline-/Fallback-Modus erhalten.

## Quellen und Transparenz
Die Bestandsdaten stammen aus der vorherigen Atlas-Version. Nicht verifizierte Inhalte nicht als bestätigte Nutzende zählen. Keine automatische Aktualisierung von LinkedIn oder Vergabeportalen.


## Google-Sheets-Zeilenreferenz

Jeder über Google Sheets geladene Datensatz erhält automatisch `sheetReference: { tab, row, url }`. Bei mehrfach zugeordneten Organisationen werden alle Referenzen in `sheetReferences` gesammelt. Der Link führt zum Spreadsheet und zur jeweiligen Tab-/Zeilenadresse (`#range='Tab'!A2`). Die Zeile wird beim CSV-Import ab Zeile 2 gezählt (Zeile 1 ist die Kopfzeile). Bei lokaler JSON-Nutzung gibt es keinen Sheet-Link. Die Spalten müssen dafür nicht erweitert werden.


## v13 – Datenherkunft und Trefferliste
- Google-Sheets-Einträge zeigen Tab und Zeile als Direktlink.
- Lokale JSON-Fallbacks zeigen ihre lokale Datei als Datenherkunft; es wird kein Sheet-Link erfunden.
- Öffentliche Vergaben erscheinen ausschließlich in den normalen Suchergebnissen.
- Hinweise, GitLab-Status und Projektinformationen stehen unter den Suchergebnissen.
- Bei nicht sichtbaren Sheet-Links `config.js` (ID) und die Browser-Konsole auf Fallback-Warnungen prüfen.


## v14 – Blatt-IDs und Quellen

`config.js` enthält neben `tabs` jetzt `tabGids`: Dort die numerische `gid` jedes Google-Sheets-Tabs aus dessen URL hinterlegen. Beispiel `providers: 209579919`. Die Einträge verlinken anschließend `edit?gid=209579919#gid=209579919&range=3:3`. Ohne konfigurierte `gid` wird nur Tab und Zeile angezeigt (kein falscher Link). Die `gid` ist nicht die Spreadsheet-ID.

Quellen sind in Trefferkarten ausklappbar. Mock-Einträge werden nur gezeigt, wenn keine realen Treffer für die aktuelle Suche/Filterkombination existieren.


## Konfiguration ab v15

`config.js` enthält die Spreadsheet-ID und pro Kategorie `tabs.<key>.tabName` und `tabs.<key>.tabID`. Die bisher getrennte `tabGids`-Struktur entfällt. Nur die vom Nutzer belegte gid `209579919` für IT-Dienstleister ist gesetzt. Alle anderen tabIDs sind `null` und müssen anhand der tatsächlichen Blatt-URLs ergänzt werden. Der CSV-Abruf nutzt den Blattnamen; die Direktlinks nutzen die gid.


## v17 – Bundesländer-Auswahl

Oberhalb der Karte sind 16 Bundesländer als auswählbare Kacheln mit Namen und Wikipedia-Vorschaubildern dargestellt. Ein Klick filtert Suchergebnisse und Marker; mehrere Länder können gleichzeitig gewählt werden. „Alle“ setzt die Auswahl zurück. Die Bilder werden zur Laufzeit von der deutschsprachigen Wikipedia geladen; ohne Zugriff erscheint ein neutrales Wappen-Symbol. Hinweis: Wikipedia-Seitenvorschaubilder sind nicht in jedem Fall amtliche Landeswappen.

Geändert: `index.html`, `app.js`, `README.md`.


## v18
- Bundesländer ohne belegte Datensätze sind ausgegraut und nicht auswählbar (Mock zählt nicht).
- Bundesland-Wappen erscheinen klein in Suchergebnissen, soweit Wikipedia ein Bild liefert.
- Getrennte, kompakte Ausklappfelder für Belegquellen und Google-Sheets-Zeilenreferenzen.

## Zweite Kartenansicht: Datenportal-Technologien

Die Schaltfläche **🧩 Datenportal-Technologien** zeigt die Einträge aus
`civitas_datenportal_technologien`. Die Icons sind klickbare Softwarefilter;
Bundeslandfilter und Freitextsuche funktionieren in beiden Ansichten.

**Datenquelle:** In `config.js` ist der Sheet-Tab unter `tabs.technologies`
konfigurierbar. `tabID: null` bedeutet, dass noch keine bestätigte `gid`
vorliegt; für Zeilen-Direktlinks muss diese ergänzt werden. Das Laden erfolgt
über den Tabnamen. Ist das Google Sheet nicht öffentlich lesbar, wird die
mitgelieferte Datei `data/civitas_datenportal_technologien.csv` verwendet.

**CSV-Spalten:** `Organisation,Typ,Software,Frontend,Backend,Portal_URL,Hersteller_Referenz,Nachweis,Status`.
Optional: `Bundesland,lat,lon`. Bei fehlenden Koordinaten werden für die
bekannten Orte ungefähre Orts-/Kreiszentren verwendet; Länder und Bund ohne
lokalen Ort werden nur in der Ergebnisliste angezeigt.

**Klassifizierung:** Nachgewiesenes CIVITAS-Backend hat Vorrang. Andernfalls
bleibt Masterportal als Masterportal klassifiziert. Doppelte Kommunen werden
für die Kartenansicht zusammengefasst; weitere Technologien werden im Status
benannt. Die mitgelieferte CSV ist eine Recherche-Arbeitsliste, keine
technisch verifizierte Vollerhebung. Softwarekürzel sind neutrale Icons,
keine Herstellerlogos.


### Version 2 – Produktlogos

Die Software-Kacheln, Suchergebnisse und Kartenmarker unterstützen echte Produktlogos.
In `config.js` unter `TECHNOLOGY_LOGOS` eine lokale `/assets/logo.svg`-Datei oder eine HTTPS-Bild-URL pro Produkt eintragen.
Fehlt ein Logo oder kann es nicht geladen werden, wird automatisch das Softwarekürzel angezeigt.
Produktlogos werden nicht mitgeliefert, da die Originaldateien und Nutzungsrechte nicht verifiziert werden konnten.


## Version 3 – Produktlogos

Die Technologieansicht lädt Produkt-/Projektlogos über `TECHNOLOGY_LOGOS` in `config.js`. Für Masterportal und CKAN sind Bilddateipfade aus den Projekt-Repositories eingetragen; für die anderen Anbieter werden deren Website-Icons verwendet. Da die externen Dateien nicht lokal gespiegelt sind, können einzelne Logos je nach Erreichbarkeit oder geändertem Dateipfad fehlen. In diesem Fall wird das Kürzel angezeigt. Für einen stabilen Offlinebetrieb sollten die Logos nach Prüfung der Nutzungsrechte lokal unter `assets/` abgelegt und die URLs ersetzt werden.


## Version 5 – farbliche Technologie-Karte

- Eigene Farben für CIVITAS/CORE (Blau), Masterportal (Orange), Piveau (Violett), CKAN (Rot), DKAN (Türkis), OpenDataSoft (Gelb), ArcGIS (Grün), Andere (Grau).
- Technologie-Buttons, Marker und Ergebnislisten übernehmen dieselbe Farbe; Produktlogos bleiben erhalten.
- Bundesländer werden wie in der Netzwerkansicht eingefärbt, nach der häufigsten Technologie unter den aktuell gefilterten Treffern. Die Färbung ist eine **visuelle Aggregation**, keine flächendeckende Aussage über die Landesnutzung.
- Mehrfachfilter bleiben aktiv; Bundesländer ohne Treffer sind zurückgenommen. Die Hervorhebung kann mit „Bundesländer mit Treffern hervorheben“ ausgeschaltet werden.
