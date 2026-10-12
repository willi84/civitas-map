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
