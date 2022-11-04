import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Addedprod } from '../../interfaces/addedprod';
import { DatabaseService } from '../../services/database.service';
import { UtilsService } from '../../services/utils.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-devoluciones',
  templateUrl: './devoluciones.component.html',
  styleUrls: ['./devoluciones.component.css']
})
export class DevolucionesComponent implements OnInit {

  productos: Observable<any[]>;
  compraForm: FormGroup;
  nuevasCompras: Addedprod[] = [];
  saving = false;
  productoSeleccionado = '';
  productoForm: FormGroup;
  precioCompra = 0;
  margenUtilidad = 0.4;
  costoUnitario = 0;

  constructor( private fb: FormBuilder,
               private _db: DatabaseService,
               private _utils: UtilsService,
               private toastr: ToastrService ) { 
    this.productoForm = this.fb.group({
    });
    this.compraForm = this.fb.group({
      id: ['', Validators.required],
      //precioCompra: ['', Validators.required],
      cantidad: ['', Validators.required]
    });
    this.productos = this._db.getAllProductos();
  }

  ngOnInit(): void {
  }

  seleccionarProducto(event: any) {
    const id = event?.target.value;
    
    const prod = this._db.getProducto(id);
    var one = true;
    prod.forEach(element => {
      if (one) {
        this.costoUnitario = element.costoUnitario;
        this.precioCompra = (Math.round((element.costoUnitario * (1 + this.margenUtilidad) / 0.87) * 100) / 100);
        one = false;
      }
    });
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
        np.precioCompra = Math.round((this.costoUnitario / 0.87) * 100) / 100;
        //np.costoCompra = this.precioCompra * 0.87;
        np.costoCompra = this.costoUnitario;
        np.cantidad = this.compraForm.value.cantidad;
        np.precioVenta = 0;
        np.precioFinal = 0;
        np.total = Math.round(((this.precioCompra)*(this.compraForm.value.cantidad)) * 100) / 100;
        np.fecha = this._utils.getTodayTimestamp();
        np.totalFac = np.total * 0.87;
        np.inventario = element.inventario > 0 ? (element.inventario + this.compraForm.value.cantidad) : this.compraForm.value.cantidad;
        np.totalAcumulado = (element.totalAcumulado ? element.totalAcumulado : 0) + (this.costoUnitario * this.compraForm.value.cantidad);
        //np.costoUnitario = this.getCostoUnitario(element, np.totalFac, np.cantidad);
        np.costoUnitario = this.costoUnitario;
        this.nuevasCompras.push(np);
        np.tipo = 'DEVOLUCION';
        console.log(np);
        this.precioCompra = 0;
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
