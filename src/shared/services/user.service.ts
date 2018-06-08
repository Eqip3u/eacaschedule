import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { UserRegistration } from '../models/user.registration.interface';
import { ConfigService } from '../utils/config.service';

import {BaseService} from './base.service';
import { BehaviorSubject, Observable, throwError } from 'rxjs';

import { map, catchError } from 'rxjs/operators';

@Injectable()
export class UserService extends BaseService {

    baseUrl: string;

    private _authNavStatusSource = new BehaviorSubject<boolean>(false);
    authNavStatus$ = this._authNavStatusSource.asObservable();

    private loggedIn = false;

    constructor(private http: HttpClient, private configService: ConfigService) {
        super();
        this.loggedIn = !!localStorage.getItem('auth_token');
        this._authNavStatusSource.next(this.loggedIn);
        this.baseUrl = this.configService.getApiURI();
    }

    register(email: string, password: string, firstName: string, lastName: string, location: string): Observable<UserRegistration> {
        const body = JSON.stringify({ email, password, firstName, lastName, location });
        const httpOptions = {headers: new HttpHeaders({ 'Content-Type':  'application/json' })};

        return this.http.post<UserRegistration>(this.baseUrl + '/accounts', body, httpOptions).pipe(catchError(e => this.handleError(e)));
    }

    login(userName, password) {
        return this.http.post<{id, auth_token, expires_in, error}>(this.baseUrl + '/auth/login', { userName, password }).pipe(
            map(res => {
                localStorage.setItem('auth_token', res.auth_token);
                this.loggedIn = true;
                this._authNavStatusSource.next(true);
                return true;
            }),
            catchError(e => this.handleError(e))
        );
    }

    logout() {
        localStorage.removeItem('auth_token');
        this.loggedIn = false;
        this._authNavStatusSource.next(false);
    }

    isLoggedIn() {
        return this.loggedIn;
    }
}