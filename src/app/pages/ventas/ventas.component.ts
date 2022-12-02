import { Component, OnInit } from '@angular/core';
import { EMPTY, first, Observable } from 'rxjs';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Soldprod } from '../../interfaces/soldprod';
import { DatabaseService } from '../../services/database.service';
import { UtilsService } from '../../services/utils.service';
import { ToastrService } from 'ngx-toastr';
import { Kardex } from 'src/app/interfaces/kardex';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { NgbCalendar } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-ventas',
  templateUrl: './ventas.component.html',
  styleUrls: ['./ventas.component.css']
})
export class VentasComponent implements OnInit {
  productos: Observable<any[]>;
  ventaForm: FormGroup;
  reporteForm: FormGroup;
  fechasForm: FormGroup;
  nuevasVentas: Soldprod[] = [];
  saving = false;
  productoSeleccionado = '';
  productoSeleccionadoReporte = '';
  precioVenta = 0;
  precioFinal = 0;
  margenUtilidad = 0.4;
  productForm: FormGroup;
  cod = '';
  articulo = '';
  clasificacion = '';
  ventas: Observable<any[]> = EMPTY;
  kardex: Kardex[] = [];
  ventasPorFecha: Observable<any[]> = EMPTY;
  kardexFecha: Kardex[] = [];
  fechaSeleccionada = '';

  constructor( private fb: FormBuilder,
               private _db: DatabaseService,
               private _utils: UtilsService,
               private toastr: ToastrService,
               private calendar: NgbCalendar ) { 
    this.productForm = this.fb.group({});
    this.ventaForm = this.fb.group({
      id: ['', Validators.required],
      descripcionVenta: ['', Validators.required],
      cantidad: ['', Validators.required]
    });
    this.reporteForm = this.fb.group({
      id: ['', Validators.required]
    });
    this.fechasForm = this.fb.group({
      fecha: ['', Validators.required]
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
        this.precioVenta = Math.round((element.costoUnitario * (1 + this.margenUtilidad)) * 100) / 100;
        this.precioFinal = Math.round((this.precioVenta / (1 - 0.13)) * 100) / 100;
        one = false;
      }
    });
  }

  seleccionarProductoReporte(event: any) {
    this.productoSeleccionadoReporte = event?.target.value;
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
          np.descripcionVenta = (this.ventaForm.value.descripcionVenta).toUpperCase();
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
          np.totalFac = element.costoUnitario * np.cantidad;
          np.inventario = element.inventario - this.ventaForm.value.cantidad;
          np.totalAcumulado = element.totalAcumulado - np.totalFac;
          np.costoUnitario = element.costoUnitario;
          np.tipo = "VENTA";
          
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

  reporte() {
    if (this.productoSeleccionadoReporte === '') {
      this.toastr.error('Para generar un reporte, debe seleccionar un item', 'ATENCIÓN');
      return;
    }
    this.kardex = [];
    const prod = this._db.getProducto(this.productoSeleccionadoReporte);
    prod.pipe(first()).subscribe(p => {
      this.cod = p.codigo;
      this.articulo = p.descripcion;
      this.clasificacion = p.clasificacion;
      this.ventas = this._db.getVentas(this.cod);
      this.ventas
        .pipe(first())
        .subscribe(c => {
        for(var i = 0; i < c.length; i++) {
          let kar = c[i];
          kar.fecha = this._utils.getDateFromTimestamp(kar.fecha);
          kar.operacion = c[i].descripcionVenta;
          kar.date = this._utils.getDateFromString(kar.fecha);
          this.kardex.push(kar);
        }
      });
      setTimeout(() => {
        this.kardex.sort(function(a,b) {
          return a.date.getTime() - b.date.getTime();
        });
      }, 800);
    });
  }

  pdfGenerate(template: string) {
    var data = document.getElementById(template) as HTMLElement;
    html2canvas(data, { useCORS: true, allowTaint: true, scrollY: 0 }).then((canvas) => {
      const image = { type: 'jpeg', quality: 0.98 };
      const margin = [0.5, 0.5];
      const filename = 'ventas.pdf';

      var imgWidth = 8.5;
      var pageHeight = 11;

      var innerPageWidth = imgWidth - margin[0] * 2;
      var innerPageHeight = pageHeight - margin[1] * 2;

      // Calculate the number of pages.
      var pxFullHeight = canvas.height;
      var pxPageHeight = Math.floor(canvas.width * (pageHeight / imgWidth));
      var nPages = Math.ceil(pxFullHeight / pxPageHeight);

      // Define pageHeight separately so it can be trimmed on the final page.
      var pageHeight = innerPageHeight;

      // Create a one-page canvas to split up the full image.
      var pageCanvas = document.createElement('canvas');
      var pageCtx = pageCanvas.getContext('2d');
      pageCanvas.width = canvas.width;
      pageCanvas.height = pxPageHeight;

      // Initialize the PDF.
      var pdf = new jsPDF('p', 'in', [8.5, 11]);

      for (var page = 0; page < nPages; page++) {
        // Trim the final page to reduce file size.
        if (page === nPages - 1 && pxFullHeight % pxPageHeight !== 0) {
          pageCanvas.height = pxFullHeight % pxPageHeight;
          pageHeight = (pageCanvas.height * innerPageWidth) / pageCanvas.width;
        }

        // Display the page.
        var w = pageCanvas.width;
        var h = pageCanvas.height;
        pageCtx!.fillStyle = 'white';
        pageCtx!.fillRect(0, 0, w, h);
        pageCtx!.drawImage(canvas, 0, page * pxPageHeight, w, h, 0, 0, w, h);

        // Add the page to the PDF.
        if (page > 0) pdf.addPage();
        var imgData = pageCanvas.toDataURL('image/' + image.type, image.quality);
        pdf.addImage(imgData, image.type, margin[1], margin[0], innerPageWidth, pageHeight);

        var str = "Página " + (page+1)  + " de " +  nPages;
        pdf.setFontSize(5);// optional
        pdf.text("Documento generado por el Sistema Automotivos MEGA en fecha " + this.getDate(), 0.5, pdf.internal.pageSize.height - 0.2);
        pdf.text(str, 7.5, pdf.internal.pageSize.height - 0.2);
      }

      pdf.save('reporte-ventas.pdf');
    });
  }

  getDate(): string {
    var today = new Date();
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0');
    var yyyy = today.getFullYear();
    return dd + '/' + mm + '/' + yyyy;
  }

  reporteFecha() {
    if(this.fechasForm.invalid) {
      this.toastr.error("Debe seleccionar una fecha", "ERROR");
    }
    else {
      this.fechaSeleccionada = this.fechasForm.value.fecha.day + "/" + this.fechasForm.value.fecha.month + "/" + this.fechasForm.value.fecha.year;
      let startDate = new Date(this.fechasForm.value.fecha.year + "-" + this.fechasForm.value.fecha.month + "-" + this.fechasForm.value.fecha.day + " 00:00:00");
      let endDate = new Date(this.fechasForm.value.fecha.year + "-" + this.fechasForm.value.fecha.month + "-" + this.fechasForm.value.fecha.day + " 23:59:59");
      this.kardexFecha = [];
      this.ventasPorFecha = this._db.getVentasByDate(startDate, endDate);
      this.ventasPorFecha
        .pipe(first())
        .subscribe(c => {
        for(var i = 0; i < c.length; i++) {
          let kar = c[i];
          kar.fecha = this._utils.getDateFromTimestamp(kar.fecha);
          kar.operacion = c[i].descripcionVenta;
          kar.date = this._utils.getDateFromString(kar.fecha);
          this.kardexFecha.push(kar);
        }
      });
    }
  }
}
