import { Injectable } from '@angular/core';
import { AngularFirestore} from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {

  constructor( private firestore: AngularFirestore) { }

  getAllProductos() {
    return this.firestore.collection('productos', ref => ref.where('isActive', '==', true).orderBy('codigo')).valueChanges({idField: 'id'});
  }

  getProductos(limitKey: number, startKey?: any): Observable<any[]> {
    return this.firestore.collection('productos', ref => ref.where('isActive', '==', true)
                                                            .orderBy('codigo')
                                                            .startAfter(startKey)
                                                            .limit(limitKey)).valueChanges({idField: 'id'});
  }

  getProducto(id: string): Observable<any> {
    return this.firestore.collection('productos').doc(id).valueChanges({idField: 'id'});
  }

  updateProducto(id: string, form:any) {
    this.firestore.collection('productos').doc(id).update(form);
  }

  saveCompra(form: any) {
    this.firestore.collection('compras').add(form);
  }

  saveVenta(form: any) {
    this.firestore.collection('ventas').add(form);
  }

  getCompras(cod: string) {
    return this.firestore.collection('compras', ref => ref.where('codigo', '==', cod)
                                                          .orderBy('fecha')).valueChanges();
  }

  getVentas(cod: string) {
    return this.firestore.collection('ventas', ref => ref.where('codigo', '==', cod)
                                                          .orderBy('fecha')).valueChanges();
  }
}
