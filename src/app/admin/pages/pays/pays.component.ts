import { Component } from '@angular/core';
import { Country, Voyage } from '../../../../interfaces/country.interface';
import { ActivatedRoute, Router } from '@angular/router';
import { VoyageService } from '../../../core/services/voyage.service';
import { CountryService } from '../../../core/services/country.service';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';

@Component({
    selector: 'app-admin-pays',
    imports: [CommonModule,MatToolbarModule],
    templateUrl: './pays.component.html',
    styleUrl: './pays.component.css'
})
export class AdminPaysComponent {
    voyages: Voyage[] = [];
   
    countryName: string | null = null;

    constructor(
        private route: ActivatedRoute,
        private voyageService: VoyageService,
        private countryService: CountryService,
         private router: Router
    ) {}

    ngOnInit(): void {
       const countryId = this.route.snapshot.paramMap.get('countryId');
        if (countryId) {
            this.voyageService.getVoyagesByCountryId(+countryId)
                .subscribe(voyages => {
                    this.voyages = voyages;
                    console.log(this.voyages);
                    
                });

            this.countryService.getCountries()
                .subscribe(countries => {
                    const country = countries.find(c => c.id === +countryId);
                    this.countryName = country ? country.name : null;
                });
        }

    }
         onLogoClick() {
     this.router.navigate(['']);
   }
}
