import { Component } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
    selector: 'app-header',
    imports: [],
    standalone: true,
    templateUrl: './header.component.html',
    styleUrl: './header.component.css'
})
export class HeaderComponent {
 
  currentPage: string = '';
  currentForm: string = ''; 

  constructor(private router: Router, private authService: AuthService) {
    // Mise à jour de currentPage dès qu'une navigation se termine
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.currentPage = event.urlAfterRedirects;
        console.log('Current URL:', this.currentPage);
      }
    });
  }

  ngOnInit() {
    const url = new URL(window.location.href);
    if (url.searchParams.has('reload')) {
      url.searchParams.delete('reload');
      this.router.navigate([url.pathname], { queryParams: {} });
    }
  }
  
  onLogoClick() {
    this.router.navigate(['']);
  }

  // Redirige vers la page de connexion au lieu de connecter directement
  goToLogin(): void {
    this.router.navigate(['/login']);
  }

  // Redirige vers l'admin (nécessite d'être connecté)
  admin(): void {
    if (this.isLoggedIn()) {
      this.router.navigate(['/admin']);
    } else {
      // Rediriger vers login si pas connecté
      this.router.navigate(['/login']);
    }
  }
  
  // Déconnexion et redirection
  logout(): void {
    this.authService.logout(); 
    // La redirection vers la page d'accueil est maintenant gérée dans le service d'auth
  }
  
  // Vérifie si l'utilisateur est connecté
  isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }
  
  // Méthode utilitaire pour obtenir les segments de l'URL (sans les query params)
  private getUrlSegments(): string[] {
    return this.currentPage.split('?')[0].split('/').filter(segment => segment.length > 0);
  }
}