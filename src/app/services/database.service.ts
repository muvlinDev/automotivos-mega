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

  saveProducto(form: any) {
    this.firestore.collection('productos').add(form);
  }

  updateProducto(id: string, form:any) {
    this.firestore.collection('productos').doc(id).update(form);
  }

  deleteProduct(id: string) {
    this.firestore.collection('productos').doc(id).delete();
  }
  /*getProductoCantidad(id:string, tipo: string, cantidad: number) {
    if(tipo == 'COMPRA') {
      var c = this.firestore.collection('productos').doc(id).get();
    }
    
  }*/

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

  getComprasByDate(startDate: Date, endDate: Date) {
    return this.firestore.collection('compras', ref => ref.where('fecha', '>', startDate).where('fecha', '<', endDate)).valueChanges();
  }

  getVentasByDate(startDate: Date, endDate: Date) {
    return this.firestore.collection('ventas', ref => ref.where('fecha', '>', startDate).where('fecha', '<', endDate)).valueChanges();
  }
}
