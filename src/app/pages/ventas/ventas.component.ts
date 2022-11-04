import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Soldprod } from '../../interfaces/soldprod';
import { DatabaseService } from '../../services/database.service';
import { UtilsService } from '../../services/utils.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-ventas',
  templateUrl: './ventas.component.html',
  styleUrls: ['./ventas.component.css']
})
export class VentasComponent implements OnInit {

  productos: Observable<any[]>;
  ventaForm: FormGroup;
  nuevasVentas: Soldprod[] = [];
  saving = false;
  productoSeleccionado = '';
  precioVenta = 0;
  precioFinal = 0;
  margenUtilidad = 0.4;
  productForm: FormGroup;

  constructor( private fb: FormBuilder,
               private _db: DatabaseService,
               private _utils: UtilsService,
               private toastr: ToastrService ) { 
    this.productForm = this.fb.group({});
    this.ventaForm = this.fb.group({
      id: ['', Validators.required],
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
        console.log((element.costoUnitario * (1 + this.margenUtilidad)));
        this.precioVenta = Math.round((element.costoUnitario * (1 + this.margenUtilidad)) * 100) / 100;
        this.precioFinal = Math.round((this.precioVenta / (1 - 0.13)) * 100) / 100;
        one = false;
      }
    });
  }

  agregar() {
    if (this.ventaForm.invalid) {
      this.toastr.error('Debe completar todos los campos', 'Ocurrió un error');
      return
    }
    const prod = this._db.getProducto(this.ventaForm.value.id);
    var one = true;
    prod.forEach(element => {
      if (one) {
        if (element.inventario > this.ventaForm.value.cantidad) {
          let np = {} as Soldprod;
          np.id = element.id;
          np.codigo = element.codigo;
          np.clasificacion = element.clasificacion;
          np.descripcion = element.descripcion;
          np.marca = element.marca;
          np.precioCompra = element.precioCompra;
          np.costoCompra = element.costoCompra;
          np.cantidad = this.ventaForm.value.cantidad;
          np.precioVenta = this.precioVenta;
          np.precioFinal = this.precioVenta / (1 - 0.13);
          np.total = Math.round(((np.precioFinal)*(this.ventaForm.value.cantidad)) * 100) / 100;
          np.fecha = this._utils.getTodayTimestamp();
          // np.totalFac = this.precioVenta * 0.87;
          np.totalFac = element.costoUnitario;
          np.inventario = element.inventario - this.ventaForm.value.cantidad;
          np.totalAcumulado = element.totalAcumulado - np.totalFac;
          np.costoUnitario = element.costoUnitario;
          np.tipo = "VENTA";
          console.log(np);
          
          this.nuevasVentas.push(np);
          this.ventaForm.reset();
          this.precioFinal = 0;
          this.precioVenta = 0;
        }
        else {
          this.toastr.error('No tiene inventario suficiente, disponible ' + element.inventario, 'Ocurrió un error');
          return
        }
        one = false;
      }
    });
  }

  getCostoUnitario(prod: any, totalFac: number, cantidad: number): number {
    if (prod.costoUnitario > 0) {
      return Math.round((prod.totalAcumulado - totalFac) / (prod.inventario - cantidad) *100) / 100;
    }
    else {
      return totalFac / cantidad;
    }
  }

  quitarProducto(i: number) {
    this.nuevasVentas.splice(i,1);
  }

  guardarVentas() {
    this.saving = true;
    this.nuevasVentas.forEach( data => {
      this._db.saveVenta(data);
      this.nuevasVentas = [];
      this.productForm.value.inventario = data.inventario;
      this.productForm.value.totalAcumulado = data.totalAcumulado;
      this.productForm.value.costoUnitario = data.costoUnitario;

      this._db.updateProducto(data.id, this.productForm.value);
      this.toastr.success('Registrado correctamente', 'Operación exitosa');
      this.saving = false;
    });
  }
}
