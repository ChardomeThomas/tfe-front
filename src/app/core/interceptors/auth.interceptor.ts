// auth.interceptor.ts
import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(private authService: AuthService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Ajouter le token à chaque requête si disponible
    let authReq = req;
    const token = this.authService.getToken();
    
    if (token && !this.authService.isTokenExpired()) {
      authReq = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }

    return next.handle(authReq).pipe(
      catchError((error: HttpErrorResponse) => {
        // Si erreur 401 (Unauthorized), le token est probablement expiré
        if (error.status === 401) {
          console.log('Erreur 401 détectée - Token expiré ou invalide');
          
          // Vérifier si on est déjà sur la page de login pour éviter les boucles
          const currentUrl = window.location.pathname;
          if (currentUrl !== '/login' && currentUrl !== '/register') {
            // Seulement rediriger si on n'est pas déjà sur une page d'auth
            this.authService.logout('/login');
          }
        }
        
        return throwError(() => error);
      })
    );
  }
}