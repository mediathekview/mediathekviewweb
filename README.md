# MediathekViewWeb → [mediathekviewweb.de](https://mediathekviewweb.de/)

MediathekViewWeb ist eine einfache Browser-Oberfläche für den Zugriff auf die Filmliste des [MediathekView Projekts](https://mediathekview.de/).

Im Gegensatz zu MediathekView muss bei MediathekViewWeb weder ein Programm installiert noch eine Filmliste heruntergeladen werden, die Suche steht deshalb augenblicklich im Browser zur Verfügung.
Da die Abfrage auf dem Server durchgeführt wird, die Anforderungen an das Endgerät (Browser) minimal sind, und weil kein Java installiert werden muss, lässt sich die Website auch auf Smartphones und Tablets nutzen.

![MediathekViewWeb](https://abload.de/img/mediathekviewwebnqrq7.png)


## Anleitung

##### 1. In die Suchliste eintippen, was man anschauen möchte.
##### 2. Doppelklick auf das Videosymbol, um die Sendung sofort in der besten verfügbaren Qualität zu starten, oder mit der Maus drübergehen, um das Menü zu öffnen.

![Popover](https://abload.de/img/popoverx1ojl.png)
##### Ein Klick auf das Abspielsymbol startet das Video in der gewünschten Qualität. Ein Klick auf das Diskettensymbol startet den Download der Videodatei *(Achtung: dies wird nicht von allen Browsern (z.B. Firefox) unterstützt - hier dann per Rechtsklick -> "Ziel speichern unter" bzw. "Save target as" das Video herunterladen)*.


##### Im geöffneten Player das X oben rechts oder Escape drücken, um den Player zu schließen. Dadurch wird auch das Abspielen beendet. 
![Overlay](https://abload.de/img/videooverlayzxqh9.png)



### Erweiterte Suche
##### Die Suchzeile unterstützt das Durchsuchen nach Sender, Thema, Titel und Beschreibung. Hier einige Beispiele:

- "!ard" zeigt alle Beiträge der ARD.

- "#sport" zeigt alle Beiträge aller Sender zum Thema "Sport".

- "+gebärdensprache" zeigt alle Beiträge, die "Gebärdensprache" im Titel enthalten.

- "\*norwegen" zeigt alle Beiträge aller Sender, die "Norwegen" in der Beschreibung enthalten.

- "!ard #wetter" zeigt alle Beiträge von ARD zum Thema "Wetter".

- "#doku +weltall" zeigt alle Beiträge aller Sender im Thema "Doku", die im Titel "Weltall" enhalten.

- "#tagesschau \*klima" zeigt alle Beiträge der "Tagesschau", die "Klima" in der Beschreibung enthalten.

- ">60" zeigt Beiträge, die länger als 60 Minuten dauern. Der Operator "<" wird analog unterstützt.


##### Das Komma ist der "und" Operator

- "\*diane,kruger" zeigt alle Beiträge, die "Diane" und "Kruger" in der Beschreibung enthalten.

##### Es lassen sich auch gleichzeitig mehrere Sender, Themen, Titel oder Beschreibungen angeben:

- "!ard !ndr #sturm,der,liebe #rote,rosen" zeigt Themen "Sturm der Liebe" und "Rote Rosen" von ARD und NDR.

##### In den *allermeisten* Fällen reicht die Eingabe aussagekräftiger Begriffe aus Titel oder Thema:

- "planet wissen" zeigt alle Beiträge, in denen "Planet" und "Wissen" im Titel oder im Thema vorkommen.

##### Überall suchen

- Wenn "Überall" aktiviert ist, werden alle Begriffe, die **kein** !, #, + oder * davor haben in **allen** Feldern gesucht. Zusätzlich kann man jedoch auch hier noch nach Sender, Thema, Titel und Beschreibung filtern.


## FAQ

### SRF und ORF Downloads
Downloads von Beiträgen des ORF und SRF in MediathekViewWeb bringen lediglich eine m3u8 Datei zum vorschein. Das liegt daran, dass diese Sender keine ganzen Videos mehr anbieten, sondern nur noch HLS-Streams. Diese kann man sich zwar auf der Website anschauen (streamen), aber nichts sinnvolles herunterladen.

Abhilfe schaffen hier bspw. der Java Desktop Client [MediathekView](https://mediathekview.de/) oder Universal-Downloader wie bspw.  [yt-dlp](https://yt-dlp.org/) (das kann entgegen des Namens *viel* mehr als nur YouTube) oder auch VLC wie im nächsten Abschnitt beschrieben.

#### Konvertierung mit VLC

Mit dem VLC-Player bietet sich die Möglichkeit, die Streams mit der .m3u8-Endung auf dem Rechner sowohl anzusehen als auch zu speichern. Zunächst musst der entsprechende Link in die Zwischenablage kopiert werden. Wurde im VLC im Menupunkt Ansicht die "Erweiterte Steuerung" aktiviert, so sind zusätzliche Buttons vorhanden, der rote dient zum Aufnehmen und Speichern, das funktioniert z. B. auch mit Livestreams.

Im geöffneten Player kann nun mit CTRL(STRG)-V der Link aus der Zwischenablage übernommen werden und mit Klick auf den roten Button die Aufnahme gestartet werden, dabei kann der Film auch angesehen werden. In diesem Fall muss die Aufnahme nach dem Beenden mit dem entsprechenden Dateinamen versehen werden.

Eine weitere Möglichkeit der Speicherung bietet sich über folgende Option:
Medien > Netzwerkstream öffnen > Link aus der Zwischenablage übernehmen > neben dem Button Wiedergeben auf den Pfeil klicken und Konvertieren/Speichern wählen: Im Feld Zieldatei wählen den Dateinamen eingeben und abschicken > Start. Diese Prozedur lässt sich durch die Standard-Shortkeys (Achtung, die lassen sich ändern) vereinfachen: CTRL-N > Link übernehmen > ALT-O > Zieldateinamen eingeben > Start.

Bei Benutzung des Aufnahme-Buttons erfolgt die Speicherung im Standard-Video Verzeichnis des Betriebssystems.

## Verwendete Dienste und Libraries
##### (zumindest die wichtigsten, siehe [server package.json](https://github.com/mediathekview/mediathekviewweb/blob/master/server/package.json) und [client package.json](https://github.com/mediathekview/mediathekviewweb/blob/master/client/package.json) für mehr)

### Serverseitig
- Node
- Redis
- Elasticsearch

### Clientseitig
- Bootstrap 3
- jQuery

### Auf beiden Seiten
- Socket.IO
