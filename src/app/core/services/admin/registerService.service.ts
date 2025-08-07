import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { RegisterRequest, RegisterResponse } from '../../../interfaces/register.interface';



@Injectable({ providedIn: 'root' })
export class RegisterService {
  private readonly baseUrl = 'http://localhost:48080/api/auth/register';
  
  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({ 
      'Content-Type': 'application/json' 
    });
  }

  register(registerData: RegisterRequest): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(this.baseUrl, registerData, { 
      headers: this.getHeaders() 
    })
    .pipe(
      map(response => {
        console.log('Réponse d\'inscription:', response);
        return response;
      }),
      catchError(error => {
        console.error('Erreur lors de l\'inscription:', error);
        return throwError(error);
      })
    );
  }
}
