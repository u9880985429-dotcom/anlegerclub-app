/**
 * Lange Cockpit-Texte für die PDF-Downloads.
 * Phase 2: aus Datenbank/Admin-Editor; Phase 3: KI-generiert via Gamma-AI.
 */

export interface CockpitDocument {
  id: string;
  kind: "perspektiven" | "tagesblick" | "wochenblick" | "monatsblick" | "calendar";
  title: string;
  subtitle: string;
  date: string;
  /** Vollständiger Text für die PDF, leichte Markdown-Untermenge (## Überschrift, **fett**, • Bullet, leere Zeile = Absatz). */
  bodyMd: string;
}

const PERSPEKTIVEN_24_04_2026: CockpitDocument = {
  id: "doc_perspektiven_2026_04_24",
  kind: "perspektiven",
  title: "Perspektiven des Chefredakteurs",
  subtitle: "Fed, Dollar und China: Warum sich die amerikanische Strategie gerade scharf stellt",
  date: "2026-04-24",
  bodyMd: `## Fed, Dollar und China: Warum sich die amerikanische Strategie gerade scharf stellt

Mit Kevin Warsh rückt nicht nur ein anderer Stil an der Spitze der Fed näher. Sichtbar wird ein größerer Rahmen: eine kleinere Fed-Bilanz, mehr Koordination zwischen Notenbank und Regierung außerhalb der reinen Zinssteuerung und eine Geldordnung, die enger mit Industrie- und Sicherheitspolitik verknüpft wird.

Die harte These lautet deshalb: weniger monetäre Schonung im Inland, mehr Marktdisziplin für Staatsfinanzen und mehr strategischer Einsatz des Dollars nach außen. Vollzogen ist dieser Wechsel noch nicht, aber seine Bausteine liegen inzwischen offen auf dem Tisch.

## Die Fed soll wieder kleiner und enger werden

Warsh hat die Grenze der Fed-Unabhängigkeit in seinem schriftlichen Statement ungewöhnlich eng gezogen. Maximale Unabhängigkeit reklamierte er für die operative Geldpolitik; bei internationalen Finanzfragen und anderen nicht-monetären Aufgaben soll die Fed dagegen enger mit Regierung und Kongress arbeiten. In der mündlichen Eröffnung blieb genau diese explizite Nennung internationaler Finanzfragen aus, die Grundidee der engeren Zusammenarbeit außerhalb der Geldpolitik aber blieb stehen.

Gleichzeitig stellte er klar, dass die Bilanz der Fed wieder kleiner werden soll. Die Debatte in und um die Fed geht inzwischen offen dahin, dass geringere Bestände und veränderte Regulierungsregeln irgendwann sogar Raum für niedrigere Kurzfristzinsen schaffen könnten.

Nur: Die aktuelle Fed ist zuletzt den Gegenweg gegangen. Sie beendete den Bilanzabbau zum 1. Dezember, startete technische Bill-Käufe zunächst mit rund 40 Milliarden Dollar im Monat und dürfte diese laut Marktstrategen nach dem April-Steuertermin eher auf etwa 20 Milliarden zurückführen. In den H.4.1-Daten stieg die Bilanz von 6,54 Billionen Dollar am 10. Dezember auf 6,71 Billionen am 22. April; die Bestände an Treasury Bills kletterten von rund 195 auf 425 Milliarden Dollar.

Der Regimekonflikt ist damit klar sichtbar. Was Powell als technisches Reserve-Management behandelt, liest Warsh als institutionelle Überdehnung und als Schritt zu nah an die stillschweigende Staatsfinanzierung.

## Marktdisziplin statt monetärer Schonung

Wenn diese Sicht sich durchsetzt, übernimmt der Markt wieder mehr Disziplin über die Fiskalpolitik. Offiziell wäre das keine Sparpolitik der Notenbank, sondern eine Rückkehr zu klareren Zuständigkeiten. Der Markt liest es eher so: weniger stiller Schutz für Defizite, mehr Bedeutung von Laufzeitprämien und Refinanzierungskosten.

Die Mechanik ist entscheidend. Weniger Fed-Bestände würden tendenziell lange Renditen nach oben drücken, selbst wenn am kurzen Ende irgendwann niedrigere Leitzinsen möglich wären. Genau deshalb ist Warshs Projekt weder simpel dovish noch simpel hawkish; es wäre ein Umbau der Übertragungskanäle.

Dazu kommt die Gegenkraft. Warshs KI-These, wonach Produktivität die Inflation dämpfen und so niedrigere Zinsen erlauben könnte, wird innerhalb der Fed und unter Ökonomen keineswegs einhellig geteilt. Viele sehen zunächst eher investitionsgetriebene Preisschübe und Unsicherheit am Arbeitsmarkt, und in der jüngsten Reuters-Umfrage wurden Zinssenkungen wegen des kriegsbedingten Inflationsrisikos sogar weiter nach hinten geschoben.

## Europa gerät doppelt unter Druck

Für Europa kommt dieser mögliche Fed-Wechsel zur ungünstigsten Zeit. Der Flash-PMI für die Eurozone fiel im April auf 48,6, der Dienstleistungsindex auf 47,4, während Inputkosten und Energiepreise kräftig zulegten. Das ist genau das Umfeld, in dem die EZB zugleich Wachstum stützen und Inflation bekämpfen soll.

Offiziell läuft das Dollar-Sicherheitsnetz weiter normal. Luis de Guindos sprach im Januar von „business as usual" in der Kooperation mit der Fed. Doch parallel prüfte die EZB, wie sie eigene Euro-Linien für andere Zentralbanken ausweiten kann, und in Europa wurde bereits darüber nachgedacht, Dollarreserven zu bündeln, um im Ernstfall weniger abhängig von Washington zu sein.

Das eigentliche Problem Europas liegt tiefer. Der Kontinent muss gleichzeitig Energie- und Netzinfrastruktur finanzieren, Verteidigung hochfahren und bei KI-Rechenzentren aufholen. Genau deshalb versucht die EU, mehr privates Kapital in Stromnetze und Energieprojekte zu ziehen; zugleich warnen Industrievertreter, dass Europa beim Ausbau der KI-Infrastruktur hinter die USA und China zurückzufallen droht.

## Der Dollar wird vom Sicherheitsnetz zum Hebel

Swap-Linien sind dabei kein Nebenthema, sondern die monetäre Hauptleitung des Systems. Die Fed verfügt seit 2013 über stehende Liquiditätslinien mit EZB, Bank of England, Bank of Japan, Bank of Canada und Schweizerischer Nationalbank. In Stressphasen sind sie der schnellste Weg, Dollar-Funding außerhalb der USA zu stabilisieren.

Neu ist, wie offen Washington darüber spricht. Bessent sagte im Senat, dass Verbündete aus dem Golfraum und aus Asien neue Swap-Linien angefragt haben und begründete solche Fazilitäten ausdrücklich damit, Ordnung in den Dollar-Funding-Märkten zu sichern und ungeordnete Verkäufe von US-Anlagen zu verhindern.

Darum wäre die schärfere Lesart nicht, dass Europa morgen von Dollar-Liquidität abgeschnitten wird. Plausibler ist etwas anderes: Neue Linien, Sonderfazilitäten und Krisenhilfen werden sichtbarer Teil amerikanischer Ordnungspolitik. Warshs engeres Verständnis von Fed-Unabhängigkeit passt genau in dieses Muster.

## China bleibt das eigentliche Ziel

China bleibt in diesem Bild der eigentliche Gegenpol. Das Weiße Haus warf chinesischen Akteuren gerade eine industrielle Kampagne zum Abschöpfen amerikanischer KI-Modelle vor. Einen Tag zuvor schob der Auswärtige Ausschuss des Repräsentantenhauses ein Paket von Exportkontrollgesetzen weiter, das Halbleitertechnik, Chip-Schmuggel und den Diebstahl von KI-Modellen adressiert.

Dazu kommt die militärisch-industrielle Ebene. Das angeforderte US-Verteidigungsbudget für 2027 liegt bei 1,5 Billionen Dollar und soll nach offizieller Lesart sowohl China im Indopazifik abschrecken als auch Bestände auffüllen, die durch die Konflikte um Israel, Iran und die Ukraine geleert wurden.

Dass diese Belastung real ist, zeigt sich bereits in der Lieferkette. Reuters berichtete über mögliche Verzögerungen bei Waffenlieferungen an einige europäische Staaten wegen des Iran-Kriegs. Gleichzeitig versicherte Washington schon im März, Taiwan bleibe bei Rüstungsprioritäten ganz oben. Genau hier liegt die Spannung: Nahost frisst Munition, China bleibt trotzdem der maßgebliche Referenzgegner.

## Die Märkte spielen den Umbau schon an

Die Märkte lesen diesen Umbau bislang eher bullisch. Der S&P 500 hat wieder Rekordstände erreicht, und die großen Banken meldeten starke Handels- und Investmentbanking-Erträge. Das passt zu einem Regime, in dem Kapital häufiger umgeschichtet, abgesichert und für neue Staats- und Industrieprojekte mobilisiert wird.

Gerade Banken und Investmenthäuser sind dafür ein guter Frühindikator. Sie verdienen zuerst an Volatilität, Emissionen, Absicherung und Deal-Making, lange bevor ein möglicher industrieller Umbau voll in den harten Konjunkturdaten ankommt.

Der wunde Punkt bleibt Öl, Inflation und Europas Schwäche. Solange der Euroraum in die Stagflation rutscht und die Fed wegen Energiepreisen vorsichtig bleiben muss, ist die Rally verwundbar. Das erklärt, warum die These eines neuen US-geführten Booms plausibel ist, aber noch keinen automatischen Durchmarsch garantiert.

## Zusammengefasst

Die plausiblere Lesart ist daher nicht bloß „Trump will niedrigere Zinsen". Sichtbar wird vielmehr der Versuch, die Fed wieder enger auf Geldpolitik zu beschränken, die Disziplin des Treasury-Markts zurückzuholen und den Dollar außenpolitisch bewusster einzusetzen.

Für Europa ist das unbequem, für China bedrohlich und für Märkte zunächst bullisch. Doch ob daraus eine stabile neue Ordnung wird, entscheidet sich nicht an einem Hearing, sondern an drei Dingen zugleich: Treasury-Nachfrage, Energiepreisen und der Frage, ob Amerikas Industrie- und Rüstungsbasis mit der geopolitischen Agenda tatsächlich Schritt hält.

## Trader-Ecke

**Wichtige Begriffe kurz erklärt**

• Fed-Bilanz: Die Summe der von der Notenbank gehaltenen Wertpapiere und Kredite. Wächst sie, steigt meist auch die Liquidität im Finanzsystem.
• Swap-Linie: Eine Vereinbarung zwischen Zentralbanken, über die im Stressfall schnell Dollar oder andere Währungen bereitgestellt werden können.
• Treasury Bill: Eine sehr kurzlaufende US-Staatsanleihe, die sich besonders gut für technisches Liquiditätsmanagement eignet.
• Fiskalische Dominanz: Ein Zustand, in dem Geldpolitik faktisch Rücksicht auf Staatsfinanzierung nehmen muss, weil Defizite und Schulden den Rahmen setzen.
• Exportkontrolle: Staatliche Beschränkung beim Verkauf oder Transfer sensibler Technologien ins Ausland.

**Was man jetzt beobachten sollte**

• Ob die Fed ihre Bill-Käufe nach dem April-Steuertermin wirklich in Richtung 20 Milliarden Dollar pro Monat zurücknimmt oder wieder anziehen muss.
• Ob die Diskussion über eine kleinere Fed-Bilanz an den langen Treasury-Renditen sichtbar wird und damit die Marktdisziplin für Defizite schärfer zurückkehrt.
• Ob die Eurozone bei schwachen PMIs, hohen Inputkosten und wachsender Dollar-Sensibilität geldpolitisch noch manövrierfähig bleibt.
• Ob Washington die China-Linie weiter verschärft: über Exportkontrollen, KI-Schutz, höhere Rüstungsbudgets und den Wiederaufbau leerer Bestände.

## Merksatz

Der kommende Streit dreht sich weniger um den nächsten Viertelpunkt bei den Zinsen als um die Frage, wer im Dollar-System die Regeln und die Rettungsleitungen kontrolliert.

Herzlichst

Marco Ahnert`,
};

const TAGESBLICK_24_04_2026: CockpitDocument = {
  id: "doc_tagesblick_2026_04_24",
  kind: "tagesblick",
  title: "Marktupdate Tagesblick",
  subtitle: "Elyrion-Market-Intelligence-System EMIS Daily Outlook · KW 17/2026",
  date: "2026-04-24",
  bodyMd: `## Marktupdate 24.04.2026

**Elyrion-Market-Intelligence-System EMIS Daily Outlook – 24.04.2026**
Kalenderwoche 17 / 2026 · Bezug Chartdatum 23.04.2026 (KW 17)

Die Indizes stehen wieder an ihren Allzeithochs, und die Rally hat Substanz. Aber die Breite schwächt sich, das Öl zieht an, und die Berichtssaison strafen ab heute jede Jahresprognose, die nur bestätigt.

## Unsere Einschätzung

Ende März stand der Markt noch in einer klassischen Washout-Konstellation mit elf von elf aktiven Oversold-Signalen bei gleichzeitig roten Trendfiltern. Der taktische Bounce am 1. April fand über fallendes Öl, einen weicheren Dollar und sinkende Spot-Volatilität seine Makro-Entlastung. Mitte April drehte das Bild in eine bullische Transition, danach in Rekordkurse mit schmaler Führung. Seit dem 20. April ist diese Verengung sichtbar. Small Caps zeigen die robustere Innenstruktur, der Nasdaq die schwächste kurzfristige Verfassung.

In der gestrigen Analyse haben wir festgehalten, dass der Markt das Iran-Risiko zu eng auspreist. Der gestrige Handel bestätigt diese Warnung in drei Punkten. IBM verlor rund acht Prozent, weil die Jahresprognose unverändert blieb. ServiceNow brach fast achtzehn Prozent ein, weil das Abonnement-Wachstum unter dem Nahost-Konflikt litt. Und das Öl kletterte intraday um knapp vier Prozent über 96 Dollar, nachdem Irans Parlamentssprecher sich aus dem Verhandlungsteam zurückzog. Widerlegt wurde zugleich die klassische Safe-Haven-Rolle von Gold. Der Preis verlor in fünf Tagen 3,5 Prozent, obwohl ein realer Krieg tobt.

Neu ist die Rotation unter der Oberfläche. Am Donnerstag führten Versorger, Basiskonsum und Industrie mit Aufschlägen zwischen 1,6 und 2,7 Prozent. Technologie und Nicht-Basiskonsum gaben gleichzeitig deutlich nach. Das ist nicht die Rotation eines stabilen Aufwärtstrends. Das ist eine defensive Einfärbung unter einem noch stabilen Index.

Das Regime für heute lautet überhitzte V-Recovery mit defensivem Unterboden. Der S&P 500 schloss bei 7.108,40 Punkten, nur 0,55 Prozent unter dem Rekordhoch. Der Nasdaq-100 steht bei 26.782,63 und ist 0,83 Prozent vom Allzeithoch entfernt. Der Dow Jones Industrial Average schloss bei 49.310,32, der Russell 2000 bei 2.775,10. Alle vier Leitindizes notieren über ihrer 200-Tage-Linie und über ihrem 10-Tage-Durchschnitt. Der Cutler-RSI über 14 Perioden liegt bei allen vier zwischen 80 und 90. Das ist extrem überkauftes Niveau und historisch selten.

Die operative Zone heute ist eng. Die erste Auffangzone im S&P liegt bei 7.030 bis 7.050 Punkten. Dort verläuft der 10-Tage-Durchschnitt, die kurzfristige Gleichgewichtslinie eines laufenden Trends. Hält diese Zone, bleibt der Pullback technisch gesund. Fällt sie sauber, wird aus bloßem Atemholen eine Mean-Reversion Richtung mittleres Trendniveau. Ein bullisches Upgrade setzt erst oberhalb von 7.160 mit besserer Breite und einem VIX unter 17 ein. Strukturell problematisch wird es erst, wenn mehrere Bedingungen zugleich kippen.

Die Kernthese für heute: Die Rally ist nicht kaputt, aber sie ist erschöpft. Wer long ist, hat jetzt mehr zu verlieren als zu gewinnen, wenn er nicht absichert. Wer neu kaufen will, jagt ATHs in einen Markt, dessen Breite Müdigkeit zeigt.

## Der Öl-Kanal und die Straße, die nicht wieder aufgeht

West Texas Intermediate schloss am Donnerstag nahe 96 Dollar. Im asiatischen Handel am Freitag stieg der Kontrakt bis 96,56 Dollar. Brent notierte über 105 Dollar, im Freitagshandel bei 106,06 Dollar. Auf Wochensicht entspricht das einem Plus von 15,1 Prozent bei WTI und 17,1 Prozent bei Brent. Benzin-Futures legten im gleichen Zeitraum elf Prozent zu. Erdgas stieg knapp zwei Prozent. Der gesamte Energie-Komplex zeigt Stress in eine Richtung.

Auslöser ist keine spekulative Übertreibung, sondern die Physik des Transports. Die Straße von Hormus ist faktisch geschlossen. Rund ein Fünftel der globalen Öl- und Flüssiggas-Flüsse laufen über diese Route. Iran hat am Mittwoch drei Frachter angegriffen und zwei gekapert. Das US-Militär beschlagnahmte einen weiteren Tanker im Indischen Ozean. Die Verhandlungsseite ist am Mittwoch zusammengebrochen, als der iranische Parlamentssprecher austrat.

Entscheidend ist nicht der Spotpreis allein, sondern die Struktur dahinter. Die Rückwärtung am Front-Ende bleibt aktiv. Rückwärtung heißt: Der Markt bezahlt für sofortige Lieferung mehr als für spätere. Das ist die Terminmarkt-Signatur akuter physischer Knappheit. Genau diese Struktur blieb seit Anfang April der dominanteste Makrokanal.

## Elyrion-Konklusion

• Alle vier US-Leitindizes über 200-Tage-Linie und 10-Tage-Durchschnitt, aber Cutler-RSI zwischen 80 und 90 in allen vier Fällen.
• CNN-Fear-&-Greed-Index bei 66,3, vor einem Monat 18,2 — historisch einer der größten Sentiment-Swings binnen vier Wochen.
• Breadth-Warnung: Markt-Momentum in extremer Gier bei 94,2, Stock-Price-Strength in der Furcht-Zone bei 41,2.
• WTI plus 15,1 Prozent in fünf Tagen, Brent plus 17,1 Prozent, Straße von Hormus faktisch geschlossen.
• Makro-Unterbau Late-Cycle: PMIs über 50, aber Output-Prices 59,9, Input-Prices 62,6 — schärfste Preisdynamik seit 2022.
• Earnings-Strafe für reine Bestätigungs-Jahresprognosen. IBM minus 8, ServiceNow minus 18 Prozent trotz Gewinnschlägen.
• Kipppunkt der Woche: Mittwoch 29. April bringt Durable Goods, Fed-Zinsentscheidung und Hyperscaler-Berichte an einem Tag.

## Strategische Positionierung

**Bevorzugt:** Rücksetzer in Small Caps und selektives Qualitäts-Wachstum bleiben die saubersten Long-Ausdrücke.

**Defensiv:** Basiskonsum als Hedge gegen Konsum-Narrativ-Bruch. Kurzlaufende US-Staatsanleihen als Liquiditäts-Parkplatz vor der Fed-Sitzung.

**Opportunistisch:** Long-Volatilität über VIX-Futures bei Rücksetzern unter 17.

**Zurückhaltend:** Mega-Cap-Technologie für Neu-Positionen direkt an den Hochs.

Ein Markt, der an seinen Hochs steht und gleichzeitig defensiv rotiert, belohnt Disziplin — und straft Ungeduld zweimal.

Elyrion Research – Daily Outlook, 24.04.2026
Basierend auf EMIS-Tagesanalyse v2 – Chartdaten vom 23.04.2026 (KW 17)

Diese Daten werden im Auftrag der Geld IQ ausgewertet, aufbereitet und zur Verfügung gestellt. Fehlerquellen sind möglich. Die Ausführungen stellen die Meinung des Redakteurs dar und sind keine Handelsaufforderung oder Anlageberatung.`,
};

const WOCHENBLICK_26_04_2026: CockpitDocument = {
  id: "doc_wochenblick_2026_04_26",
  kind: "wochenblick",
  title: "Marktupdate Wochenblick",
  subtitle: "Elyrion Weekly Outlook · KW 18/2026",
  date: "2026-04-26",
  bodyMd: `## Marktupdate 26.04.2026

**Elyrion Weekly Outlook – KW 18 / 2026**

Die Rally hat ihre Bestätigung. Aber sie steht jetzt auf weniger Beinen, auf teureren Beinen, und auf einer Liquidität, die keinen Puffer mehr hat.

## Unsere Einschätzung

Vor sechs Wochen sah der Markt anders aus. Ende März feuerten elf von elf Oversold-Signalen gleichzeitig, der Iran-Krieg war frisch eskaliert, der Fear-and-Greed-Index stand bei fünfzehn. Anfang April kam ein erster taktischer Bounce in Richtung der 200-Tage-Linie, ohne echte Trendwende. Mitte April folgte die bullische Transition mit fallendem Öl, schwächerem Dollar und sinkender Spot-Volatilität. Die Indizes drehten, der Sentiment-Wert kletterte, und in KW16 hatten wir sechzehn historische Pre-Top-Signale gleichzeitig aktiv.

Diese Diagnose ist in der vergangenen Woche nicht widerlegt worden. Sie ist verschärft worden. Aus der schmalen Führung ist ein Tech-Monopol geworden. Aus der Wall-of-Worry-Skepsis ist eine Greed-Phase geworden. Aus der Energie-Entlastung ist ein neuer globaler Energie-Schock geworden. Und aus dem Liquiditäts-Komfort der Vorwochen ist ein Sandwich geworden.

Das neue Wochenbild ruht auf vier Säulen:

• **Erste Säule:** Tech-Monopol-Führung mit XLK als alleinigem Sektor-Leader.
• **Zweite Säule:** globaler Energie-Schock mit Brent +16% und WTI +13% in einer Woche.
• **Dritte Säule:** Liquiditäts-Sandwich aus TGA-Absorption, leerem Reverse-Repo-Fenster und flacher Fed-Bilanz.
• **Vierte Säule:** institutionelle Absicherung gegen Retail-Risikoappetit.

## Die operative Zone in KW18

Die unmittelbare Schwelle im S&P 500 liegt weiter an der 7.200er-Marke. Oberhalb davon öffnet sich der Weg Richtung 7.300 und mehr. Darunter bleibt das wahrscheinlichere Muster eine Seitwärts-Topbildung zwischen etwa 7.050 und 7.200.

Die belastbare Risk-Off-Bestätigung kommt erst, wenn ein Bündel von Schwellen gleichzeitig bricht. High-Yield-ETF unter 80,20, Real-Estate-ETF unter 92,10, VVIX über 115 und Kupfer unter 5,76. Wir nennen diese Konstellation Quadrupel-Trigger.

## Liquiditäts-Sandwich und Zinskurve

Die zweite neue Verdichtung der Woche kommt nicht aus dem Preis, sondern aus der Finanzierung des Systems. Das Treasury hat in einer Woche 254 Milliarden Dollar in den Treasury General Account gezogen. Der Saldo steht bei 1.006 Milliarden Dollar. Das Reverse-Repo-Fenster bei der Fed liegt bei 0,08 Milliarden Dollar und ist damit faktisch leer.

In Marktlogik bedeutet das: Wenn das Treasury Liquidität absorbiert, gibt es zwei Quellen, die nachgeben können. Entweder der Reverse-Repo-Saldo, der die Vergangenheits-Lösung war. Oder die Bankreserven. Da der Reverse-Repo de facto leer ist, fällt die Absorption voll auf die Bankreserven.

## Elyrion-Konklusion

• Pre-Top-Verdichtung auf vier Säulen: Tech-Monopol, globaler Energie-Schock, Liquiditäts-Sandwich, Smart-Money-vs-Retail-Divergenz.
• S&P 500 bei 7.165 und Nasdaq 100 bei 27.304 auf Allzeithochs, aber nur 58 Prozent der NYSE-Werte über der 200-Tage-Linie.
• Brent +16 Prozent und WTI +13 Prozent in einer Woche. Hormus weiter blockiert.
• Treasury absorbiert 254 Milliarden Dollar in einer Woche, Reverse-Repo leer.
• FOMC-Sitzung am 29. April mit 99 Prozent Hold-Wahrscheinlichkeit. Powell-Pressekonferenz entscheidet über Cut-Bias-Validierung.

## Strategische Positionierung

**Bevorzugt:** Quality Growth auf Pullbacks bleibt die sauberste Long-Expression.

**Defensiv:** Long-Duration-Treasuries und Gold-Konsolidierungen bleiben die methodisch sauberste defensive Antwort.

**Opportunistisch:** Sojaöl und Zucker bleiben die interessantesten nicht-indexnahen Opportunitäten.

**Zurückhaltend:** Defense-Titel und Energy-ETFs nach der Parabolik bleiben unattraktiv für späte antizyklische Käufe.

Die Rally ist noch nicht zu Ende. Aber sie wird inzwischen von immer weniger, immer teureren Trägern gehalten. Qualität halten, Breite nicht halluzinieren, und die FOMC-Woche nicht mit einem normalen Frühjahrstape verwechseln.

Elyrion Research – Weekly Outlook, 26. April 2026
Basierend auf EMIS-Wochenanalyse – Chartdaten vom 24. April 2026 (KW 17)

Alle genannten Punkte sind Analyse respektive Inspirationsbeispiele, keine Handelsaufforderung und keine Anlageberatung.`,
};

const MONATSBLICK_07_04_2026: CockpitDocument = {
  id: "doc_monatsblick_2026_04_07",
  kind: "monatsblick",
  title: "Marktupdate Monatsblick",
  subtitle: "Der Bounce läuft, doch das Regime bleibt stagflationär",
  date: "2026-04-07",
  bodyMd: `## Marktupdate 07.04.2026

**Elyrion-Market-Intelligence-System – EMIS Daily Outlook – 7. April 2026**

## Unsere Einschätzung für heute

Der Basiscase bleibt ein taktischer Erholungsmarkt innerhalb eines strukturell angeschlagenen Regimes. Der S&P 500 hat den Tag zwar mit 6.612 Punkten knapp über dem zentralen EMIS-Pivot von 6.587 beendet, und die großen US-Indizes haben den vierten Gewinntag in Folge geschafft; gleichzeitig notieren WTI bei 112,41 Dollar und die 30-jährigen US-Renditen bei 4,89 Prozent – also genau dort, wo das Makro den Risk-On-Impuls wieder einhegt. Solange Öl hoch, Long-End-Renditen fest und die Breite schwach bleiben, ist der laufende Bounce eher Entlastung als Trendwende.

## Vier grüne Tage ändern keine schwache Marktbreite

Die Kursbewegung vom Montag war konstruktiv, aber nicht befreiend. Der S&P 500 stieg um 0,45 Prozent, der Nasdaq um 0,54 Prozent; getragen wurde der Tag vor allem von Communication Services, während Utilities zurückblieben. Gleichzeitig bleibt der S&P trotz der jüngsten Erholung seit Beginn des Iran-Kriegs rund 3,9 Prozent im Minus.

EMIS beschreibt diese innere Schwäche als 17-fach belegte Distortion zwischen Mega-Cap-Tech und breitem Markt und legt für April zusammen 77 Prozent Wahrscheinlichkeit auf Bear-Fortsetzung oder Seitwärtsphase mit realer Erosion.

## Makro: Wachstum hält, Preise beschleunigen

Die harten Daten bestätigen inzwischen genau das Regime, das EMIS im Cross-Asset-Bild diagnostiziert. Der US-Arbeitsmarkt hat im März 178.000 Stellen aufgebaut, die Arbeitslosenquote lag bei 4,3 Prozent. Das ist keine Rezession. Gleichzeitig fiel der ISM Services im März auf 54,0 nach 56,1, während der Preise-Index im Services-Sektor auf 70,7 sprang; im verarbeitenden Gewerbe stieg der ISM-Preiskomponente auf 78,3, den höchsten Stand seit Juni 2022.

## Energie bleibt der Marktführer

Die eigentliche Marktachse verläuft weiter über Energie. WTI schloss bei 112,41 Dollar, Brent bei 109,77 Dollar. Reuters berichtet zudem, dass asiatische und europäische Raffinerien inzwischen Rekordaufschläge für US-Rohöl zahlen, weil der physische Ersatz für ausgefallene Nahost-Ströme knapper wird. Das ist kein bloßes Nachrichtengeräusch, sondern ein echter Supply-Shock.

## Strategische Positionierung

**Bevorzugt:** Gold, Energie und selektive defensive Zykliker bleiben die saubersten Expressions eines stagflationären Regimes.

**Defensiv:** Utilities und Health Care wirken strukturell belastbarer als breite Qualitätsindizes.

**Opportunistisch:** Relative Trades bleiben methodisch sauberer als nacktes Beta – etwa Long Energie gegen Short Discretionary.

**Zurückhaltend:** Breites Growth, Long Duration und zinssensitive Yield-Proxies bleiben anfällig.

**Gold:** Gold bleibt weniger ein Momentum-Trade als ein Regime-Asset.

Der Markt steigt vielleicht noch ein Stück – aber er atmet bereits die Luft der Stagflation.

Elyrion-Market-Intelligence-System - Daily Outlook, 7. April 2026
Basierend auf EMIS-Tagesanalyse, Charts und validierten Marktdaten.

Alle genannten Punkte sind Analyse respektive Inspirationsbeispiele, keine Handelsaufforderung und keine Anlageberatung.`,
};

const CALENDAR_27_04_2026: CockpitDocument = {
  id: "doc_calendar_2026_04_27",
  kind: "calendar",
  title: "Economic Calendar",
  subtitle: "Relevante US-Marktdaten – Woche vom 27.04.2026 bis 01.05.2026",
  date: "2026-04-26",
  bodyMd: `## Economic Calendar & Marktausblick

**Woche vom 27. April 2026 bis 01. Mai 2026**
Stand: Sonntag, 26. April 2026 (MESZ) · Alle Zeiten: MESZ

## Überblick

Die Woche ist klar US-makrodominiert und gehört zu den dichtesten Datenwochen der letzten Zeit. Der Montag eröffnet noch vergleichsweise ruhig, ab Dienstag wird es deutlich relevanter. Zur Wochenmitte bündelt sich das Bild über Housing, Durable Goods, Handelsdaten, Ölbestände und vor allem die Fed-Sitzung. Der eigentliche Makro-Härtetest folgt dann am Donnerstag mit PCE, GDP, Employment Cost Index, Personal Income/Spending und Jobless Claims. Am Freitag rundet der ISM Manufacturing die Woche ab.

## Montag, 27. April 2026 – Ruhiger Auftakt

**16:30 Uhr** – Dallas Fed Manufacturing Index (Apr) · Erwartung: -0,8, zuvor: -0,2

Ein besserer Wert als erwartet würde dafür sprechen, dass die Schwäche im verarbeitenden Gewerbe begrenzt bleibt. Tendenziell leicht positiv für Renditen und Dollar.

## Dienstag, 28. April 2026 – Konsument & Häuserpreise

• 14:15 Uhr – ADP Employment Change Weekly · Zuvor: 54,75 Tsd.
• 15:00 Uhr – S&P/Case-Shiller Home Price YoY (Feb) · Erwartung: 1,0%, zuvor: 1,2%
• 16:00 Uhr – CB Consumer Confidence (Apr) · Erwartung: 89,5, zuvor: 91,8
• 22:30 Uhr – API Crude Oil Stock Change · Zuvor: -4,4 Mio.

Bleibt das Vertrauen stabiler als erwartet, wäre das ein Argument für widerstandsfähige Nachfrage.

## Mittwoch, 29. April 2026 – FOMC-Tag

**14:30 Uhr – Housing & Orders Block:**
• Building Permits (Mar): 1,39 Mio.
• Housing Starts (Mar): 1,4 Mio.
• Durable Goods Orders MoM (Mar): 0,5% nach -1,4%
• Goods Trade Balance (Mar): -79,0 Mrd. USD

**16:30 Uhr – EIA Oil Block**

**20:00 Uhr – Fed Interest Rate Decision** · Erwartung: 3,75%, zuvor: 3,75%

**20:30 Uhr – Fed Press Conference**

Die eigentliche Marktreaktion dürfte am Abend weniger an der erwarteten unveränderten Fed-Rate von 3,75% hängen als am Ton der Kommunikation.

## Donnerstag, 30. April 2026 – Der Härtetest

**14:30 Uhr – Claims- + PCE- + GDP-Block:**
• Initial Jobless Claims: 215 Tsd.
• Core PCE Price Index MoM (Mar): 0,3%
• Core PCE Price Index YoY (Mar): 3,1%
• PCE Price Index YoY (Mar): 3,3%
• Personal Spending MoM (Mar): 0,9%
• GDP Growth Rate QoQ (Q1): 2,1% nach 0,5%
• Employment Cost Index QoQ (Q1): 0,8%

**15:45 Uhr – Chicago PMI (Apr)** · Erwartung: 55,3, zuvor: 52,8

Der besonders unangenehme Fall für die Märkte wäre ein stagflationärer Mix: enttäuschendes Wachstum, aber zugleich hohe Preis- und Kostenkomponenten.

## Freitag, 01. Mai 2026 – Industriesignal

**16:00 Uhr – ISM Manufacturing PMI (Apr)** · Erwartung: 53,2
**16:00 Uhr – ISM Manufacturing Employment** · Erwartung: 49,0

## Wöchentliche Gesamteinschätzung

Die Woche testet die US-Wirtschaft über fast alle relevanten Kanäle. Mittwoch und Donnerstag bilden klar das Herzstück.

Für den Markt ist vor allem wichtig, ob sich ein konsistentes Signal zeigt. Starke Nachfrage, ordentliches Wachstum und klebrige Preis- bzw. Kostenkomponenten wären ein Argument für höhere Renditen und einen festen Dollar. Schwächeres Wachstum bei gleichzeitig moderateren Inflations- und Kostensignalen wäre dagegen günstiger für Duration, Gold und zinssensitive Segmente.

## Zusammengefasst

Die Woche vom 27. April bis 01. Mai 2026 ist eine der wichtigsten US-Makrowochen des Frühjahrs. Die Fed-Sitzung liefert den Kommunikationsrahmen, aber die eigentliche Marktentscheidung dürfte am Donnerstag fallen.

Bestätigen die Daten eine re-accelerierende US-Wirtschaft mit hartnäckigem Preisdruck – oder zeigt sich ein glaubwürdigerer Pfad der Abkühlung?`,
};

export const cockpitDocuments: CockpitDocument[] = [
  PERSPEKTIVEN_24_04_2026,
  TAGESBLICK_24_04_2026,
  WOCHENBLICK_26_04_2026,
  MONATSBLICK_07_04_2026,
  CALENDAR_27_04_2026,
];

export function getCockpitDocumentById(id: string): CockpitDocument | undefined {
  return cockpitDocuments.find((d) => d.id === id);
}

export function getCockpitDocumentsByKind(kind: CockpitDocument["kind"]): CockpitDocument[] {
  return cockpitDocuments.filter((d) => d.kind === kind);
}
