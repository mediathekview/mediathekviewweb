import { Component, OnInit } from '@angular/core';
import { UpdateService } from './services/update.service';

@Component({
  selector: 'mvw-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  private readonly updateService: UpdateService;

  constructor(updateService: UpdateService) {
    this.updateService = updateService;
  }

  ngOnInit(): void {
    this.updateService.start();
  }
}
