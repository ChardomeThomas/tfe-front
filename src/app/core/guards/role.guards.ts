// src/app/guards/role.guard.ts
import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {

  constructor(
    private authService: AuthService, 
    private router: Router
  ) {}

  canActivate(): boolean {
    // Vérifier si l'utilisateur a le rôle admin
    const userRole = this.authService.getUserRole();
    console.log('Vérification du rôle:', userRole);
    
    if (userRole === 'ADMIN' || 
        userRole === 'admin' || 
        userRole === 'ROLE_ADMIN' || 
        userRole === 'ROLE_SUPERADMIN') {
      return true; 
    }
    
    console.log('Accès refusé - Rôle insuffisant');
    this.router.navigate(['/']);
    return false;
  }
}