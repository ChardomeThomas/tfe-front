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
//     // Mise à jour de currentPage dès qu'une navigation se termine
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

  login(): void {
    this.authService.login(); 
    window.location.href = window.location.href.split('?')[0] + '?reload=' + new Date().getTime();
  }
  admin(): void {
    this.router.navigate(['admin']);
  
  }
  
  logout(): void {
    this.authService.logout(); 
    window.location.href = window.location.href.split('?')[0] + '?reload=' + new Date().getTime();
  }
  
//   // Vérifie si l'utilisateur est connecté
  isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }
  
//   // Méthode utilitaire pour obtenir les segments de l'URL (sans les query params)
  private getUrlSegments(): string[] {
    return this.currentPage.split('?')[0].split('/').filter(segment => segment.length > 0);
  }
  
}
