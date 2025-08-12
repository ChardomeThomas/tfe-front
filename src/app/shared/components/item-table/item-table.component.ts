import { Component, Input, TemplateRef, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-item-table',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatButtonModule, MatIconModule, MatCardModule],
  templateUrl: './item-table.component.html',
  styleUrls: ['./item-table.component.css']
})
export class ItemTableComponent implements OnChanges {
  @Input() title!: string;
  @Input() dataSource: any[] = [];
  @Input() columns: string[] = [];
  @Input() actionsTemplate?: TemplateRef<any>;
  @Input() statusFilter?: string; // Nouveau : Filtrer par statut

  displayedColumns: string[] = [];
  filteredDataSource: any[] = []; // Nouveau : Données filtrées

  ngOnChanges() {
    this.displayedColumns = this.actionsTemplate
      ? [...this.columns, 'actions']
      : [...this.columns];

    // Appliquer le filtre de statut si défini
    this.filteredDataSource = this.statusFilter
      ? this.dataSource.filter(item => item.status === this.statusFilter)
      : this.dataSource;
  }

  // Helper method to format destinations display
  formatDestinations(destinations: any[]): string {
    if (!destinations || destinations.length === 0) {
      return 'Aucune destination';
    }
    return destinations.map(dest => dest.name || dest).join(', ');
  }
}
