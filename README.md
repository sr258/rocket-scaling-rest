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
| Gesamtnutzerzahl              | reponse time Create / Delete Nutzer                                |
| Gesamtnutzerzahl              | response time Read (Suche bei 2,4,8,16,... Gesamtnutzern, Position über vorhandenen Datensatz verteilt)                               |
| globale Nachrichtenzahl       | response / download time beim Raum öffnen                          |
| globale Nachrichtenzahl       | reponse time beim Verschicken einer Nachricht (1:1, Gruppe)        |
| Nachrichtenzahl in Raum       | response / download time beim Raum öffnen                          |
| Nachrichtenzahl in Raum       | reponse time beim Verschicken einer Nachricht (1:1, Gruppe)        |
| Anzahl hochgeladener Medien   | Upload-Zeit neuer Medien                                           |
| Anzahl hochgeladener Medien   | Download-Zeit von ...?                                             |

Variation der Umgebung
----------------------

- 1-7 Nodes NodeJS auf einer Maschine (eigenartigerweise fährt das aktuelle Setup automatisch mehrere Instanzen hoch?)
- mehrere MongoDB-Instanzen (sinnvoll?)
- eigener DB-Server (extra Maschine)
- Clustering
- zusätzliche Mongo-Indices
