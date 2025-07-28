import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { VoyageService } from '../../../core/services/voyage.service';
import { CountryService } from '../../../core/services/country.service';
import { Voyage, Country } from '../../../../interfaces/country.interface';
import { BackgroundComponent } from "../../../shared/components/background/background.component";
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';

@Component({
    selector: 'app-voyages',
    imports: [CommonModule, BackgroundComponent, MatCardModule, MatButtonModule],
    standalone: true,
    templateUrl: './voyages.component.html',
    styleUrl: './voyages.component.css'
})
export class VoyagesComponent implements OnInit {
    voyages: Voyage[] = [];
    countryName: string | null = null;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private voyageService: VoyageService,
        private countryService: CountryService
    ) {}

    ngOnInit(): void {
        const countryId = this.route.snapshot.paramMap.get('countryId');
        if (countryId) {
            this.voyageService.getVoyagesByPointOfInterestId(+countryId)
                .subscribe(voyages => {
                    this.voyages = voyages;
                    console.log(this.voyages);
                });
            this.countryService.getCountries()
                .subscribe(countries => {
                    const country = countries.find(c => c.id.toString() === countryId);
                    this.countryName = country ? country.name : null;
                    console.log('Country Name:', this.countryName);
                });
        }
    }

    goToDays(voyageId: number) {
        const countryId = this.route.snapshot.paramMap.get('countryId');
        if (countryId) {
            this.router.navigate(['/countries', countryId, 'voyages', voyageId, 'jours']);
        }
    }
}
