import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DatabaseService } from '../../services/database.service';
import { EMPTY, Observable } from 'rxjs';
import { Kardex } from '../../interfaces/kardex';
import { Addedprod } from '../../interfaces/addedprod';
import { UtilsService } from '../../services/utils.service';

declare var window: any;

@Component({
  selector: 'app-productos',
  templateUrl: './productos.component.html',
  styleUrls: ['./productos.component.css']
})
export class ProductosComponent implements OnInit {
  
  productos: Observable<any[]>;
  producto: any;
  productoForm: FormGroup;
  edicion = false;
  idEdicion = '';
  startKey: any = '';
  public myAngularxQrCode: string = '';
  qrCode: string = '';
  cod: string = '';
  des: string = '';
  mar: string = '';
  qrModal: any;
  kardexModal: any;
  kardex: Kardex[] = [];
  compras: Observable<any[]> = EMPTY;
  ventas: Observable<any[]> = EMPTY;
  articulo: string = '';



  constructor( private _db: DatabaseService,
               private _utils: UtilsService,
               private fb: FormBuilder ) { 
    this.productoForm = this.fb.group({
      codigo: ['', Validators.required],
      clasificacion: ['', Validators.required],
      descripcion: ['', Validators.required],
      marca: ['', Validators.required]
    });
    this.productos = this.getProducts(this.startKey);
    this.myAngularxQrCode = 'tutsmake.com';
  }

  ngOnInit(): void {
    this.qrModal = new window.bootstrap.Modal(document.getElementById('qrModal'));
    this.kardexModal = new window.bootstrap.Modal(document.getElementById('kardexModal'));
  }

  getProducts( start: any ) {
    var aux = 0;
    var prods = this._db.getProductos(10, start);
    prods.subscribe(p => {    
      p.forEach(prod => {
        if (aux == 9) {
          this.startKey = prod.codigo
        }
        aux++;
      });
    })
    return prods;
  }

  newModal() {
    this.productoForm.reset();
    //document.getElementById('codigo').removeAttribute('readonly');
  }

  openModal(id: string) {
    console.log(id);
  }

  deleteProducto(id: string) {
    console.log(id);
  }

  next() {
    this.productos = this.getProducts(this.startKey);
    
  }

  qrGenerate(codigo: string, descripcion: string, marca: string) {
    this.qrModal.show();
    this.qrCode = '';
    this.cod = codigo;
    this.des = descripcion;
    this.mar = marca;
    this.qrCode = this.cod + '|' + this.des + '|' + this.mar;
  }

  kardexGenerate(codigo: string) {
    this.kardexModal.show()
    this.cod = codigo;
    this.compras = this._db.getCompras(codigo);
    this.compras.subscribe(c => {
      for(var i = 0; i < c.length; i++) {
        let kar = c[i];
        kar.fecha = this._utils.getDateFromTimestamp(kar.fecha);
        kar.tipo = 'COMPRA';
        kar.date = this._utils.getDateFromString(kar.fecha);
        this.kardex.push(kar);
      }
    });
    this.ventas = this._db.getVentas(codigo);
    this.ventas.subscribe(v => {
      for(var i = 0; i < v.length; i++) {
        this.articulo = v[i].descripcion;
        let kar = v[i];
        kar.fecha = this._utils.getDateFromTimestamp(kar.fecha);
        kar.tipo = 'VENTA';
        kar.date = this._utils.getDateFromString(kar.fecha);
        this.kardex.push(kar);
      }
    });
    setTimeout(() => {
      this.kardex.sort(function(a,b) {
        return b.date.getTime() - a.date.getTime();
      });
    }, 500);
  }



}
