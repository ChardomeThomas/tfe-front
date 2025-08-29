import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { BackgroundComponent } from './shared/components/background/background.component';
import { AuthService } from './core/services/auth.service';

@Component({
    selector: 'app-root',
    imports: [RouterOutlet, BackgroundComponent],
    standalone: true,
    templateUrl: './app.component.html',
    styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'tfe-front';
   private tokenCheckInterval: any;
  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    // Vérifier le token au démarrage de l'application
    this.authService.checkTokenValidity();
    
    // Vérifier le token toutes les 5 minutes (300000ms)
    this.tokenCheckInterval = setInterval(() => {
      if (this.authService.isLoggedIn()) {
        // console.log(`Token valide - Temps restant: ${this.authService.getTokenTimeRemaining()} minutes`);
        this.authService.checkTokenValidity();
      }
    }, 5 * 60 * 1000);

    // Optionnel : Vérifier le token à chaque fois que l'utilisateur revient sur l'onglet
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden && this.authService.isLoggedIn()) {
        this.authService.checkTokenValidity();
      }
    });
  }

  ngOnDestroy(): void {
    // Nettoyer l'interval quand le composant est détruit
    if (this.tokenCheckInterval) {
      clearInterval(this.tokenCheckInterval);
    }
  }
}
