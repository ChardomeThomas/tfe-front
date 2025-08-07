// src/app/core/services/admin/countryAdmin.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { User } from '../../../interfaces/user.interface';

@Injectable({ providedIn: 'root' })
export class UserService {
    private readonly baseUrl = 'http://localhost:48080/api/users';
      constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token') || '';
    let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  }
    private buildUrl(path: string): string {
    return `${this.baseUrl}${path}`;
  }

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.baseUrl, { headers: this.getHeaders() })
      .pipe(
        map(users => users.map(user => ({
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
          deletedAt: user.deletedAt
        }))),
        
        catchError(error => {
          console.error('Erreur getUsers:', error);
          return throwError(error);
        })
      );
  }

  updateUserRole(userId: number, newRole: string): Observable<any> {
    return this.http.patch(`${this.baseUrl}/${userId}/role`, 
      { role: newRole }, 
      { headers: this.getHeaders() }
    ).pipe(
      catchError(error => {
        console.error('Erreur updateUserRole:', error);
        return throwError(error);
      })
    );
  }

  // Récupère l'utilisateur actuel via son email
  getCurrentUser(email: string): Observable<User | null> {
    return this.getUsers().pipe(
      map(users => {
        const currentUser = users.find(user => user.email === email);
        return currentUser || null;
      }),
      catchError(error => {
        console.error('Erreur getCurrentUser:', error);
        return throwError(error);
      })
    );
  }
}
