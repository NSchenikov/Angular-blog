import {Injectable} from '@angular/core';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {FbAuthResponse, User} from '../../../shared/interfaces';
import {Observable, Subject, throwError} from 'rxjs';
import {environment} from '../../../../environments/environment';
import {catchError, tap} from 'rxjs/operators';

@Injectable({providedIn: 'root'})
export class AuthService {

  public error$: Subject<string> = new Subject<string>();

  constructor(private http: HttpClient) {}

  get token(): string | null { //
    // const expDate = new Date(JSON.parse(localStorage.getItem('fb-token-exp')!)); //
    const expDate = new Date(localStorage.getItem('fb-token-exp')!);
    if (new Date() > expDate) {
      this.logout();
      return null
    }
    // return JSON.parse(localStorage.getItem('fb-token')!); //
    return localStorage.getItem('fb-token')!;
  }

  login(user: User): Observable<any> {
    user.returnSecureToken = true;
   return this.http.post(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${environment.apiKey}`, user)
     .pipe(
       tap(this.setToken),
       catchError(this.handleError.bind(this))
     )
  }

  logout() {
    this.setToken(null)
  }

  private handleError(error: HttpErrorResponse) {
    const {message} = error.error.error;

    switch (message) {
      case 'INVALID_EMAIL':
        this.error$.next('Incorrect email');
        break;
      case 'INVALID_PASSWORD':
        this.error$.next('Incorrect password');
        break;
      case 'EMAIL_NOT_FOUND':
        this.error$.next('Account with such email does not exist');
        break;
    }

    return throwError(error)
  }

  isAuthenticated(): boolean {
    return !!this.token
  }

  // private setToken(response: FbAuthResponse | null) {
  private setToken(response: any | null) { //
    if (response) {
      const expDate = new Date(new Date().getTime() + +response.expiresIn * 1000);
      localStorage.setItem('fb-token', response.idToken);
      localStorage.setItem('fb-token-exp', expDate.toString())
    } else {
      localStorage.clear()
    }
  }
}

