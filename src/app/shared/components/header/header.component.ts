import { Component } from '@angular/core';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-header',
  imports: [RouterLink],
  standalone: true,
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {
  currentPage: string = '';
  currentForm: string = '';

  constructor(private router: Router, public authService: AuthService) { // ⭐ Ajouté public
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

  // ⭐ NOUVELLE MÉTHODE : Aller au profil
  goToProfile(): void {
    // Tu peux créer une page profil ou rediriger vers l'accueil
    this.router.navigate(['/']); // Ou ['/profile'] si tu créés une page profil
  }

  // ⭐ MÉTHODE AMÉLIORÉE : Redirige vers l'admin avec vérification du rôle
  admin(): void {
    if (!this.isLoggedIn()) {
      // Pas connecté → redirection vers login
      this.router.navigate(['/login']);
      return;
    }

    if (this.isAdmin()) {
      // Connecté ET admin → accès autorisé
      this.router.navigate(['/admin']);
    } else {
      // Connecté mais pas admin → accès refusé
      console.warn('Tentative d\'accès admin sans droits suffisants');
      alert('Accès interdit - Droits administrateur requis');
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

  isAdmin(): boolean {
    if (!this.isLoggedIn()) return false;
    
    const userRole = this.authService.getUserRole();
    // console.log('Rôle utilisateur pour affichage bouton admin:', userRole);
    return userRole === 'ADMIN' || 
           userRole === 'admin' || 
           userRole === 'ROLE_ADMIN' || 
           userRole === 'ROLE_SUPERADMIN'; 
  }

  getUserEmail(): string {
    return this.authService.getUserEmail() || 'Utilisateur';
  }

  private getUrlSegments(): string[] {
    return this.currentPage.split('?')[0].split('/').filter(segment => segment.length > 0);
  }

  
}