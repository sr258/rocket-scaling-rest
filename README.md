Rocket.Chat Skalierungs-Tests
=============================

Dieses Projekt misst, wie der Rocket.Chat-Server bei großen Datenbeständen skaliert. Die Messung der Effekte von vielen parallelen Nutzern ist in einem anderen Projekt beheimatet.

Grundsätzlich untersuchte Faktoren
----------------------------------

1. große Datenbestände --> Effekt auf Reaktionszeiten (von CRUD)
2. große parallele Nutzerzahlen --> Effekt auf Reaktionszeiten (von typischen Nutzerinteraktionen, auch CRUD) (siehe anderes Projekt)
3. horizontaler Skalierung des Servers

Erkenntnisziele
---------------

- Welche Skalierungsverhalten weißt Rocket.Chat grundsätzlich auf? n (linear), log(n), n * log(n), oder schlimmeres?
- Skalieren bestimmte Operationen schlechter als andere? (z.B. Read immer schnell, aber Create / Delete wird langsamer)
- Wie verhält sich Rocket.Chat bei einer Mehrinstanz-Installation (MongoDB-Cluster, NodeJS-Cluster)?
- Was ist der Flaschenhals bei großen Werten? (möglich: MongoDB, Optail, Node-Architektur, Meteor, Rocket.Chat)
- Lassen sich bestimmte Probleme durch bessere Konfiguration beseitigen oder liegen sie an der Architektur / dem Code?
- Wirkt sich in insgesamt großer Datenbestand auch auf Reaktionszeiten von lokal begrenzter Nutzerinteraktion aus? (insgesamt viele Nachrichten in Datenbank --> Versenden in kleiner Gruppe)
- Führt die vorhandene natürliche Partitionierung der Nutzer in unserem Einsatzszenario zu einer Verbesserung der Performanz im Vergleich zu einer zufälligen Verteilung der Nutzer auf Gruppen?
 
Untersuchte Aktionen
--------------------

*(alle über API)*

- Nutzer erstellen
- Nutzer löschen
- 1:1 Nachricht senden
- Gruppennachricht senden
- Hochladen von Mediendateien
- Login

Tests
-----


|Einfluss von ...               | auf....                                                            |
|-------------------------------|--------------------------------------------------------------------|
| Gesamtnutzerzahl              | response time Create / Delete Nutzer                               |
| Gesamtnutzerzahl              | response time Read (Suche bei 2,4,8,16,... Gesamtnutzern, Position über vorhandenen Datensatz verteilt)                               |
| globale Nachrichtenzahl       | response / download time beim Raum öffnen                          |
| globale Nachrichtenzahl       | response time beim Verschicken einer Nachricht (1:1, Gruppe)       |
| Nachrichtenzahl in Raum       | response / download time beim Raum öffnen                          |
| Nachrichtenzahl in Raum       | response time beim Verschicken einer Nachricht (1:1, Gruppe)       |
| Anzahl hochgeladener Medien   | Upload-Zeit neuer Medien                                           |
| Anzahl hochgeladener Medien   | Download-Zeit von ...?                                             |

Variation der Umgebung
----------------------

- 1-7 Nodes NodeJS auf einer Maschine (eigenartigerweise fährt das aktuelle Setup automatisch mehrere Instanzen hoch?)
- mehrere MongoDB-Instanzen (sinnvoll?)
- eigener DB-Server (extra Maschine)
- Clustering
- zusätzliche Mongo-Indices

(vorläufige) Ergebnisse
-----------------------

Gesamtnutzerzahl -> response time Create / Delete Nutzer             
--------------------------------------------------------

- relevante Messzahlen: measurements/1inst_100000entries_conc64.txt
- Test-Szenario: 100,000 Nutzer erstellen, 64 Anfragen gleichzeitig
- Test-Setup: Virtuelle Maschine i7-6700k, 4 physische Kerne, 8 logische, 8 GB RAM, 1 Rocket-Instanz + 1 MongoDB-Node in Replica Set
- Auswertung: Die Dauer, einen neuen Nutzer zu erstellen skaliert linear. Die Hauptlast (mit 'top' manuell beobachtet) liegt anfangs in Node, verschiebt sich aber relativ schnell hinzu MongoDB.
- Konsequenz: Die Gesamtdauer, Nutzer zu erstellen ist quadratisch abhängig von der zu erstellenden Nutzerzahl. --> in großen Skalen ungünstig!
- weiter zu bearbeitende Punkte:
  - Optimierung der MongoDB-Instanz? (z.B. zusätzliches Indices)
  - Überprüfung des Codes der Nutzer-Erstellung in Rocket.Chat: ungünstige in Reihe geschaltete Mehrfachabfragen der DB?

Nachrichtenzahl in Raum -> response time beim Verschicken einer Nachricht (Gruppe) 
----------------------------------------------------------------------------------
- relevante Messzahlen: measurements/1inst_100000messages_conc64.txt
- Test-Szenario: 100,000 Nachrichten in Raum mit 32 Usern erstellen, 64 Anfragen gleichzeitig
- Test-Setup: Virtuelle Maschine i7-6700k, 4 physische Kerne, 8 logische, 8 GB RAM, 1 Rocket-Instanz + 1 MongoDB-Node in Replica Set
- Auswertung: 
  - Die Last liegt zu 80% bei Node.
  - Die Anzahl der in der Raumübersicht angezeigten Nachrichten hängt eine gewisse Zeit __erheblich__ hinter tatsächlich abgesendeten hinterher. Dann plötzlich Aufholen auf 100,000!?