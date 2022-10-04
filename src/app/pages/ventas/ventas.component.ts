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

  constructor( private fb: FormBuilder,
               private _db: DatabaseService,
               private _utils: UtilsService,
               private toastr: ToastrService ) { 
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
        this.precioVenta = element.precio;
        console.log("PV", this.precioVenta);
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
        let np = {} as Soldprod;
        np.id = element.id;
        np.codigo = element.codigo;
        np.clasificacion = element.clasificacion;
        np.descripcion = element.descripcion;
        np.marca = element.marca;
        np.precio = this.precioVenta;
        np.cantidad = this.ventaForm.value.cantidad;
        np.total = Math.round(((this.precioVenta)*(this.ventaForm.value.cantidad)) * 100) / 100;
        np.fecha = this._utils.getTodayTimestamp();
        this.nuevasVentas.push(np);
        this.ventaForm.reset();
        this.precioVenta = 0;
        one = false;
      }
    });
  }

  quitarProducto(i: number) {
    this.nuevasVentas.splice(i,1);
  }

  guardarVentas() {
    this.saving = true;
    this.nuevasVentas.forEach( data => {
      this._db.saveVenta(data);
      this.nuevasVentas = [];
      this.toastr.success('Registrado correctamente', 'Operación exitosa');
      this.saving = false;
    });
  }
}
