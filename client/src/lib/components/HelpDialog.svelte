<script lang="ts">
  import Dialog from './Dialog.svelte';

  let dialog: Dialog;

  export function show() {
    dialog.show();
  }
</script>

<Dialog bind:this={dialog} title="Hilfe" icon="question-circle" limitWidth={false} closeOnClickOutside class="max-w-5xl">
  <div class="max-h-[70vh] overflow-y-auto -mx-6 -my-8 md:-mx-8 p-6 md:p-8">
    <div class="prose dark:prose-invert max-w-none">
      <h2>Suchsyntax</h2>
      <p>Tippe einen Suchbegriff in die Suchleiste ein. Standardmäßig wird in <strong>Thema</strong> und <strong>Titel</strong> gesucht. Mit speziellen Selektoren kannst du gezielter suchen:</p>

      <table>
        <thead>
          <tr>
            <th>Selektor</th>
            <th>Feld</th>
            <th>Beispiel</th>
            <th>Beschreibung</th>
          </tr>
        </thead>
        <tbody>
          <tr><td><code>!</code></td><td>Sender</td><td><code>!ARD</code></td><td>Findet Inhalte des Senders „ARD".</td></tr>
          <tr><td><code>#</code></td><td>Thema</td><td><code>#Tatort</code></td><td>Findet Inhalte mit dem Thema „Tatort".</td></tr>
          <tr><td><code>+</code></td><td>Titel</td><td><code>+Schokolade</code></td><td>Findet Inhalte mit „Schokolade" im Titel.</td></tr>
          <tr><td><code>*</code></td><td>Beschreibung</td><td><code>*Berlin</code></td><td>Findet Inhalte mit „Berlin" in der Beschreibung.</td></tr>
          <tr><td><code>&gt;</code></td><td>Dauer (länger als)</td><td><code>&gt;80</code></td><td>Findet Inhalte, die länger als 80 Minuten sind.</td></tr>
          <tr><td><code>&lt;</code></td><td>Dauer (kürzer als)</td><td><code>&lt;10</code></td><td>Findet Inhalte, die kürzer als 10 Minuten sind.</td></tr>
          <tr><td>(keiner)</td><td>Allgemeine Suche</td><td><code>Nachrichten</code></td><td>Sucht in Thema und Titel.</td></tr>
        </tbody>
      </table>

      <h3>Selektoren kombinieren</h3>
      <p>Mehrere Selektoren werden mit <strong>UND</strong> verknüpft:</p>
      <ul>
        <li><code>!ARD #Tatort</code> → alle Tatort-Folgen auf ARD</li>
      </ul>

      <h3>Mehrere Werte pro Selektor (ODER)</h3>
      <p>Denselben Selektor mehrmals verwenden, um Werte mit <strong>ODER</strong> zu verknüpfen:</p>
      <ul>
        <li><code>!ARD !ZDF #Reportage</code> → alle Reportagen auf ARD <em>oder</em> ZDF</li>
      </ul>

      <h3>Mehrere Wörter pro Wert (UND)</h3>
      <p>Wörter mit Komma trennen, damit alle vorkommen müssen (funktioniert für <code>!</code>, <code>#</code>, <code>+</code>, <code>*</code>):</p>
      <ul>
        <li><code>#Olympia,Tokio</code> → Thema enthält „Olympia" <em>und</em> „Tokio"</li>
      </ul>

      <h3>Beispiele</h3>
      <ul>
        <li><code>!ard !wdr #tatort &gt;80</code> → Tatort-Folgen von ARD oder WDR, länger als 80 Minuten</li>
        <li><code>!zdfinfo #weltall #universum &gt;30</code> → Weltall-Dokumentationen auf ZDFinfo, länger als 30 Minuten</li>
        <li><code>!tagesschau24 &lt;10</code> → kurze Beiträge von Tagesschau24</li>
        <li><code>!ard !ndr #sturm,der,liebe #rote,rosen</code> → Inhalte zu „Sturm der Liebe" <em>und</em> „Rote Rosen" von ARD <em>oder</em> NDR</li>
      </ul>

      <h3>Groß-/Kleinschreibung und Sonderzeichen</h3>
      <p>Die Suche ist <strong>nicht</strong> case-sensitiv und behandelt Umlaute flexibel — <code>Ö</code>, <code>oe</code> und <code>OE</code> liefern die gleichen Ergebnisse. Sonderzeichen müssen nicht exakt getippt werden.</p>

      <h2>Weitere Funktionen</h2>

      <h3>„Überall"-Schalter</h3>
      <p>Wenn aktiviert, sucht ein allgemeiner Begriff (ohne Selektor) in <strong>allen</strong> Feldern: Sender, Thema, Titel und Beschreibung.</p>

      <h3>„Zukünftige"-Schalter</h3>
      <p>Standardmäßig werden nur bereits ausgestrahlte Inhalte angezeigt. Mit diesem Schalter werden auch zukünftige Sendungen in den Ergebnissen eingeschlossen.</p>

      <h3>Sortierung</h3>
      <p>Ergebnisse können nach Datum, Dauer oder Sender auf- und absteigend sortiert werden – über die Spaltenköpfe in der Tabellenansicht oder das Sortierungs-Dropdown in der Kartenansicht.</p>

      <h3>RSS-Feed</h3>
      <p>Jede Suchanfrage kann als RSS-Feed abonniert werden. Klicke auf das <strong>RSS-Symbol</strong> in der Suchleiste, um den Feed-Link zu erhalten. Der Link kodiert den vollständigen Suchzustand — Selektoren, Sortierung, Dauer-Filter und die Überall/Zukünftige-Schalter — sodass komplexe Suchen direkt abonniert werden können.</p>

      <h2>FAQ</h2>

      <h3>Warum kann ich SRF- und ORF-Beiträge nicht direkt herunterladen?</h3>
      <p>ORF und SRF stellen Inhalte oft nur als <strong>HLS-Streams</strong> bereit. Der Download liefert dann nur eine <code>.m3u8</code>-Playlist-Datei ohne Videodaten. Alternativen:</p>
      <ul>
        <li><a href="https://mediathekview.de/" target="_blank" rel="noopener noreferrer">MediathekView</a> (Desktop-Client)</li>
        <li><a href="https://yt-dlp.org/" target="_blank" rel="noopener noreferrer">yt-dlp</a> (Kommandozeile)</li>
        <li>VLC Media Player (siehe unten)</li>
      </ul>

      <h3>Streams mit VLC speichern</h3>
      <ol>
        <li>Kopiere den <code>.m3u8</code>-Link aus MediathekViewWeb.</li>
        <li>Öffne VLC → <strong>Medien → Netzwerkstream öffnen…</strong> (<code>Strg+N</code>).</li>
        <li>Füge den Link ein, klicke auf den Pfeil neben „Wiedergeben" und wähle <strong>Konvertieren</strong>.</li>
        <li>Wähle ein Profil (z.B. <em>Video – H.264 + MP3 (MP4)</em>), setze eine Zieldatei und klicke <strong>Start</strong>.</li>
        <li>Optional: Im Profil-Editor unter „Videocodec" und „Audiocodec" jeweils <em>Originalspur beibehalten</em> aktivieren, um Zeit zu sparen.</li>
      </ol>
    </div>
  </div>
</Dialog>
