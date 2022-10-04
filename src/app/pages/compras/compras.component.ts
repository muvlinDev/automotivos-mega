import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { Observable } from 'rxjs';
import { DatabaseService } from '../../services/database.service';
import { Addedprod } from '../../interfaces/addedprod';
import { UtilsService } from '../../services/utils.service';

@Component({
  selector: 'app-compras',
  templateUrl: './compras.component.html',
  styleUrls: ['./compras.component.css']
})
export class ComprasComponent implements OnInit {

  productos: Observable<any[]>;
  compraForm: FormGroup;
  nuevasCompras: Addedprod[] = [];
  saving = false;
  productoSeleccionado = '';
  productoForm: FormGroup;

  constructor( private fb: FormBuilder,
               private _db: DatabaseService,
               private _utils: UtilsService,
               private toastr: ToastrService ) { 
    this.productoForm = this.fb.group({
    });
    this.compraForm = this.fb.group({
      id: ['', Validators.required],
      costo: ['', Validators.required],
      cantidad: ['', Validators.required],
      precio: ['', Validators.required]
    });
    this.productos = this._db.getAllProductos();
  }

  ngOnInit(): void {
  }

  seleccionarProducto(event: any) {
    this.productoSeleccionado = event?.target.value;
  }

  agregar() {
    if (this.compraForm.invalid) {
      this.toastr.error('Debe completar todos los campos', 'Ocurrió un error');
      return
    }
    const prod = this._db.getProducto(this.compraForm.value.id);
    var one = true;
    prod.forEach(element => {
      if (one) {
        let np = {} as Addedprod;
        np.id = element.id;
        np.codigo = element.codigo;
        np.clasificacion = element.clasificacion;
        np.descripcion = element.descripcion;
        np.marca = element.marca;
        np.costo = this.compraForm.value.costo;
        np.cantidad = this.compraForm.value.cantidad;
        np.precio = this.compraForm.value.precio;
        np.total = Math.round(((this.compraForm.value.costo)*(this.compraForm.value.cantidad)) * 100) / 100;
        np.fecha = this._utils.getTodayTimestamp();
        this.nuevasCompras.push(np);
        this.compraForm.reset();
        one = false;
      }
    });
  }

  quitarProducto(i: number) {
    this.nuevasCompras.splice(i,1);
  }

  guardarCompras() {
    this.saving = true;
    this.nuevasCompras.forEach( data => {
      this._db.saveCompra(data);
      this.nuevasCompras = [];
      this.productoForm.value.costo = data.costo;
      this.productoForm.value.precio = data.precio;
      this._db.updateProducto(data.id, this.productoForm.value);
      this.toastr.success('Registros almacenados correctamente', 'Operación exitosa');
      this.saving = false;
    });
  }
}
