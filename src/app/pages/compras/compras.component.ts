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
      precioCompra: ['', Validators.required],
      cantidad: ['', Validators.required]
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
        console.log(element);
        let np = {} as Addedprod;
        np.id = element.id;
        np.codigo = element.codigo;
        np.clasificacion = element.clasificacion;
        np.descripcion = element.descripcion;
        np.marca = element.marca;
        np.precioCompra = this.compraForm.value.precioCompra;
        np.costoCompra = this.compraForm.value.precioCompra * 0.87;
        np.cantidad = this.compraForm.value.cantidad;
        np.precioVenta = 0;
        np.precioFinal = 0;
        np.total = Math.round(((this.compraForm.value.precioCompra)*(this.compraForm.value.cantidad)) * 100) / 100;
        np.fecha = this._utils.getTodayTimestamp();
        np.totalFac = np.total * 0.87;
        np.inventario = element.inventario > 0 ? (element.inventario + this.compraForm.value.cantidad) : this.compraForm.value.cantidad;
        np.totalAcumulado = (element.totalAcumulado ? element.totalAcumulado : 0) + np.totalFac;
        np.costoUnitario = this.getCostoUnitario(element, np.totalFac, np.cantidad);
        this.nuevasCompras.push(np);
        console.log(np);
        
        this.compraForm.reset();
        one = false;
      }
    });
  }

  getCostoUnitario(prod: any, totalFac: number, cantidad: number): number {
    if (prod.costoUnitario > 0) {
      return (prod.totalAcumulado + totalFac) / (prod.inventario + cantidad);
    }
    else {
      return totalFac / cantidad;
    }
  }

  quitarProducto(i: number) {
    this.nuevasCompras.splice(i,1);
  }

  guardarCompras() {
    this.saving = true;
    this.nuevasCompras.forEach( data => {
      this._db.saveCompra(data);
      this.nuevasCompras = [];
      this.productoForm.value.costoCompra = data.costoCompra;
      this.productoForm.value.precioCompra = data.precioCompra;
      this.productoForm.value.costoUnitario = data.costoUnitario;
      this.productoForm.value.totalAcumulado = data.totalAcumulado;
      this.productoForm.value.inventario = data.inventario;

      this._db.updateProducto(data.id, this.productoForm.value);
      this.toastr.success('Registrado correctamente', 'Operación exitosa');
      this.saving = false;
    });
  }
}
