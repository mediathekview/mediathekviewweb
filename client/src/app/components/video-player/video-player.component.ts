import { Component, OnInit, AfterViewInit, ViewChild, Input } from '@angular/core';
import * as VideoJs from 'video.js';
import { AggregatedEntry, MediaType, Video } from '../../common/model';
import { SyncEnumerable } from '../../common/enumerable';

@Component({
  selector: 'mvw-video-player',
  templateUrl: './video-player.component.html',
  styleUrls: ['./video-player.component.scss']
})
export class VideoPlayerComponent implements OnInit, AfterViewInit {
  private static instance = 0;

  @Input() entry: AggregatedEntry;
  private player: VideoJs.Player;

  playerId: string;
  src: string;

  private get isFullscreen(): boolean {
    return (document.fullscreenElement != null);
  }

  constructor() {
    this.playerId = this.getPlayerId();
  }

  ngOnInit() {

  }

  ngAfterViewInit() {
    this.player = VideoJs(this.playerId);
  }

  toggleFullscreen() {
    if (this.isFullscreen) {
      this.player.exitFullscreen();
    } else {
      this.player.requestFullscreen();
    }
  }

  private setSource() {
    const highestQualityVideo = SyncEnumerable.from(this.entry.media)
      .filter((media) => media.type == MediaType.Video)
      .cast<Video>()
      .sort((a, b) => ((a as Video).quality - (b as Video).quality))
      .first();

    this.src = highestQualityVideo.url;
  }

  private getPlayerId(): string {
    const instance = VideoPlayerComponent.instance++;
    return `video-player-${instance}`;
  }
}
