import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {

  constructor( private af: AngularFirestore ) { }

  getUsuarioPorEmail(email: string): Observable<any[]> {
    return this.af.collection('usuarios', ref => ref.where('email', '==', email)).valueChanges({idField: 'id'});
  }
}
