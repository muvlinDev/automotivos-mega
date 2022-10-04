import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor( private afa: AngularFireAuth ) { }

  signInWithEmail(email: string, pass: string) {
    return this.afa.signInWithEmailAndPassword(email, pass);
  }

  saveLocalData(key: string, value: string) {
    localStorage.setItem(key, value);
  }

  getLocalData(key: string) {
    return localStorage.getItem(key);
  }

  clearLocalStorage() {
    localStorage.clear();
  }
}
