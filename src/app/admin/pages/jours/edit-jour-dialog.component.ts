import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Jour } from '../../../interfaces/jour.interface';

export interface EditJourDialogData {
  jour: Jour;
}

@Component({
  selector: 'app-edit-jour-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule
  ],
  template: `
    <div class="p-6">
      <h2 mat-dialog-title class="text-xl font-semibold mb-4 flex items-center">
        <mat-icon class="mr-2">edit</mat-icon>
        Modifier le jour
      </h2>
      
      <mat-dialog-content>
        <form [formGroup]="editForm" class="flex flex-col gap-4">
          <mat-form-field appearance="fill">
            <mat-label>Titre du jour</mat-label>
            <input matInput formControlName="title" />
          </mat-form-field>

          <mat-form-field appearance="fill">
            <mat-label>Description</mat-label>
            <textarea matInput formControlName="description" rows="4"></textarea>
          </mat-form-field>
        </form>
      </mat-dialog-content>

      <mat-dialog-actions class="flex justify-end gap-3 mt-6">
        <button mat-button (click)="onCancel()" class="min-w-[100px]">
          <mat-icon>close</mat-icon>
          Annuler
        </button>
        <button mat-raised-button color="primary" 
                (click)="onSave()" 
                [disabled]="editForm.invalid"
                class="min-w-[100px]">
          <mat-icon>save</mat-icon>
          Sauvegarder
        </button>
      </mat-dialog-actions>
    </div>
  `
})
export class EditJourDialogComponent {
  editForm: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<EditJourDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: EditJourDialogData
  ) {
    this.editForm = new FormGroup({
      title: new FormControl(data.jour.title, [Validators.required]),
      description: new FormControl(data.jour.description, [Validators.required])
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    if (this.editForm.valid) {
      const updatedJour = {
        ...this.data.jour,
        title: this.editForm.value.title,
        description: this.editForm.value.description
      };
      this.dialogRef.close(updatedJour);
    }
  }
}
