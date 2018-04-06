import { Injectable, OnInit } from '@angular/core';
import { SwUpdate } from '@angular/service-worker';
import { UpdateAvailableEvent, UpdateActivatedEvent } from '@angular/service-worker/src/low_level';
import { MatDialog, MatDialogRef } from '@angular/material';
import { UpdateDialogComponent } from '../components/update-dialog/update-dialog.component';
import { timeout } from '../common/utils';

@Injectable()
export class UpdateService {
  private readonly serviceWorker: SwUpdate;
  private readonly dialogService: MatDialog;

  constructor(serviceWorker: SwUpdate, dialog: MatDialog) {
    this.serviceWorker = serviceWorker;
    this.dialogService = dialog;
  }

  async start() {
    if (!this.serviceWorker.isEnabled) {
      return;
    }

    this.serviceWorker.available.subscribe((event) => this.onUpdateAvailable(event));
    this.serviceWorker.activated.subscribe((event) => this.onUpdateActivated(event));

    while (true) {
      await this.serviceWorker.checkForUpdate();
      await timeout(1000 * 60 * 30); // 30 minutes
    }
  }

  private async onUpdateAvailable(event: UpdateAvailableEvent) {
    console.log('update available', event);

    await this.serviceWorker.activateUpdate();
  }

  private async onUpdateActivated(event: UpdateActivatedEvent) {
    console.log('update activated', event);

    await this.dialogService.afterAllClosed.toPromise();

    const dialogRef = this.dialogService.open(UpdateDialogComponent) as MatDialogRef<UpdateDialogComponent, boolean>;
    const activateUpdate = await dialogRef.afterClosed().toPromise();

    if (activateUpdate) {
      location.reload();
    }
  }
}
