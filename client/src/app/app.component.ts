import { Component } from '@angular/core';

import { Entry, Video, Quality } from './model';

@Component({
  selector: 'mvw-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'mvw works!';
  entries: Entry[] = [];

  selectedIndex: number = 45;

  constructor() {
    let entry = {
      id: "tghz56o7zsr",
      channel: 'ARD',
      topic: 'Sturm der Liebe',
      title: 'Folge 1632',
      timestamp: Math.floor(Date.now() / 1000),
      duration: 60 * 60,
      description: 'Nora erzählt Werner von Barbaras Angebot: Sie soll eidesstattlich erklären, dass sie Barbara nicht beim Diebstahl beobachtet hat, dafür soll sie 100.000 Euro bekommen. Werner schlägt vor, zum Schein darauf einzugehen. So überreicht Nora Barbara den Umschlag mit dem vermeintlich unterschriebenen Papier, dafür bekommt sie das Geld. Doch Barbara hat sich zu früh gefreut...',
      website: 'http://ard.de',
      videos: [{
        quality: Quality.High,
        url: 'http://blabla.de/video.mp4',
        size: 500 * 1000 * 1000
      }]
    };

    for (let i = 0; i < 10; i++) {
      this.entries.push(entry);
    }
  }

  onPaginationNavigate(index) {
    console.log(index);
    this.selectedIndex = index;
  }
}
