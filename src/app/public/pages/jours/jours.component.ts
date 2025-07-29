import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BackgroundComponent } from '../../../shared/components/background/background.component';
import { Jour } from '../../../../interfaces/country.interface';
import { DayService } from '../../../core/services/day.service';
import { CommonModule, DatePipe } from '@angular/common';
import { PhotoService } from '../../../core/services/photo.service';
import { Photo } from '../../../../interfaces/country.interface';
import { VoyageService } from '../../../core/services/voyage.service';
import { Voyage } from '../../../../interfaces/country.interface';

@Component({
  selector: 'app-jours',
  imports: [BackgroundComponent, CommonModule, DatePipe],
  templateUrl: './jours.component.html',
  styleUrl: './jours.component.css'
})
export class JoursComponent implements OnInit {
  jours: Jour[] = [];
  randomPhotos: { [dayId: number]: Photo | null } = {};
  voyageDescription: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private dayService: DayService,
    private photoService: PhotoService,
    private voyageService: VoyageService
  ) {}
  onJourClick(jour: Jour) {
    const countryId = this.route.snapshot.paramMap.get('countryId');
    const voyageId = this.route.snapshot.paramMap.get('voyageId');
    if (countryId && voyageId && jour.id) {
      this.router.navigate([`/countries/${countryId}/voyages/${voyageId}/jours/${jour.id}/photos`]);
    }
  }

  ngOnInit() {
    const tripId = this.route.snapshot.paramMap.get('voyageId');
    if (tripId) {
      this.voyageService.getVoyageById(Number(tripId)).subscribe((voyage: Voyage) => {
        this.voyageDescription = voyage.description;
      });
      this.dayService.getDaysByTrip(tripId)
        .subscribe(jours => {
          this.jours = jours;
          this.jours.forEach(jour => {
            this.photoService.getRandomPhotoByDay(jour.id).subscribe(photo => {
              if (photo && photo.url && !photo.url.startsWith('http')) {
                photo.url = `http://localhost:8080/${photo.url.replace(/^\/+/, '')}`;
              }
              this.randomPhotos[jour.id] = photo;
            });
          });
        });
    }
  }
}
