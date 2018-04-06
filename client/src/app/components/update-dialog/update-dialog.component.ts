import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material';

@Component({
  selector: 'mvw-update-dialog',
  templateUrl: './update-dialog.component.html',
  styleUrls: ['./update-dialog.component.scss']
})
export class UpdateDialogComponent {
  private readonly dialog: MatDialogRef<UpdateDialogComponent>;

  constructor(dialog: MatDialogRef<UpdateDialogComponent>) {
    this.dialog = dialog;
  }

  close(activeUpdate: boolean) {
    this.dialog.close(activeUpdate);
  }
}
