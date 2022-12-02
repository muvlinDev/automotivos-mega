import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { Observable, EMPTY, first } from 'rxjs';
import { DatabaseService } from '../../services/database.service';
import { Addedprod } from '../../interfaces/addedprod';
import { UtilsService } from '../../services/utils.service';
import { Kardex } from 'src/app/interfaces/kardex';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { NgbCalendar, NgbDatepickerModule, NgbDateStruct, NgbDatepickerI18n } from '@ng-bootstrap/ng-bootstrap';
import { I18n, Datepickeri18nService } from '../../services/datepickeri18n.service';

@Component({
  selector: 'app-compras',
  templateUrl: './compras.component.html',
  styleUrls: ['./compras.component.css'],
  providers: [I18n,{provide: NgbDatepickerI18n, useClass: Datepickeri18nService}]
})
export class ComprasComponent implements OnInit {
  productos: Observable<any[]>;
  compraForm: FormGroup;
  reporteForm: FormGroup;
  fechasForm: FormGroup;
  nuevasCompras: Addedprod[] = [];
  saving = false;
  productoSeleccionado = '';
  productoForm: FormGroup;
  cod = '';
  articulo = '';
  clasificacion = '';
  compras: Observable<any[]>;
  kardex: Kardex[] = [];
  model: NgbDateStruct;
  comprasPorFecha: Observable<any[]> = EMPTY;
  kardexFecha: Kardex[] = [];
  fechaSeleccionada = '';

  constructor( private fb: FormBuilder,
               private _db: DatabaseService,
               private _utils: UtilsService,
               private toastr: ToastrService,
               private calendar: NgbCalendar ) { 
    this.productoForm = this.fb.group({
    });
    this.compraForm = this.fb.group({
      id: ['', Validators.required],
      descripcionCompra: ['', Validators.required],
      precioCompra: ['', Validators.required],
      cantidad: ['', Validators.required]
    });
    this.reporteForm = this.fb.group({
      id: ['', Validators.required]
    });
    this.fechasForm = this.fb.group({
      fecha: ['', Validators.required]
    });
    this.productos = this._db.getAllProductos();
    this.compras = this._db.getCompras('0');
    this.model = this.calendar.getToday();
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
        np.descripcionCompra = (this.compraForm.value.descripcionCompra).toUpperCase();
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
        //np.costoUnitario = np.costoCompra;
        this.nuevasCompras.push(np);
        np.tipo = 'COMPRA';
        
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

  reporte() {
    if (this.productoSeleccionado === '') {
      this.toastr.error('Para generar un reporte, debe seleccionar un item', 'ATENCIÓN');
      return;
    }
    this.kardex = [];
    const prod = this._db.getProducto(this.productoSeleccionado);
    prod.pipe(first()).subscribe(p => {
      this.cod = p.codigo;
      this.articulo = p.descripcion;
      this.clasificacion = p.clasificacion;
      this.compras = this._db.getCompras(this.cod);
      this.compras
        .pipe(first())
        .subscribe(c => {
        for(var i = 0; i < c.length; i++) {
          let kar = c[i];
          kar.fecha = this._utils.getDateFromTimestamp(kar.fecha);
          kar.operacion = c[i].descripcionCompra;
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
      const filename = 'compras.pdf';

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

      pdf.save('reporte-compras.pdf');
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
      this.comprasPorFecha = this._db.getComprasByDate(startDate, endDate);
      this.comprasPorFecha
        .pipe(first())
        .subscribe(c => {
        for(var i = 0; i < c.length; i++) {
          let kar = c[i];
          kar.fecha = this._utils.getDateFromTimestamp(kar.fecha);
          kar.operacion = c[i].descripcionCompra;
          kar.date = this._utils.getDateFromString(kar.fecha);
          this.kardexFecha.push(kar);
        }
      });
    }
  }
}
