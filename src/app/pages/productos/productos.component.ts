import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DatabaseService } from '../../services/database.service';
import { EMPTY, Observable } from 'rxjs';
import { Kardex } from '../../interfaces/kardex';
import { UtilsService } from '../../services/utils.service';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

declare var window: any;

@Component({
  selector: 'app-productos',
  templateUrl: './productos.component.html',
  styleUrls: ['./productos.component.css']
})
export class ProductosComponent implements OnInit {
  @ViewChild('closeButtonForm') closeButtonForm: any;
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
  registroModal: any;
  qrModal: any;
  kardexModal: any;
  kardex: Kardex[] = [];
  compras: Observable<any[]> = EMPTY;
  ventas: Observable<any[]> = EMPTY;
  articulo: string = '';
  total = 0;
  costoTotal = 0.0;

  constructor( private _db: DatabaseService,
               private _utils: UtilsService,
               private fb: FormBuilder,
               private toastr: ToastrService ) { 
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
    this.registroModal = new window.bootstrap.Modal(document.getElementById('registroModal'));
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
    document.getElementById('codigo')!.removeAttribute('readonly');
    this.registroModal.show();
  }

  openModal(id: string) {
    this.edicion = true;
    this.idEdicion = id;
    const prods = this._db.getProducto(id);
    this.registroModal.show();
    setTimeout(() => {
      prods.forEach(element => {
        this.producto = element;
        document.getElementById('codigo')!.setAttribute('readonly', 'true');
        if(this.producto != null) {
          this.productoForm = this.fb.group({
            codigo: [this.producto.codigo, Validators.required],
            clasificacion: [this.producto.clasificacion, Validators.required],
            descripcion: [this.producto.descripcion, Validators.required],
            marca: [this.producto.marca, Validators.required]
          })
        }
      })
    }, 500);
  }

  deleteProducto(id: string) {
    const prods = this._db.getProducto(id);
    Swal.fire({
      title: 'Estas seguro de eliminar este item?',
      showDenyButton: true,
      confirmButtonText: 'Confirmar',
      denyButtonText: `Cancelar`,
    }).then((result) => {
      if (result.isConfirmed) {
        setTimeout(() => {
          prods.forEach(element => {
            element.isActive = false;
            this._db.updateProducto(id, element);
          });
          Swal.fire('Item eliminado correctamente', '', 'success');
          //this.toastr.success('Item eliminado correctamente', 'Operación exitosa');
        }, 500);
      } else if (result.isDenied) {
        Swal.fire('Se canceló la acción', '', 'info')
      }
    })
    
  }

  next() {
    this.productos = this.getProducts(this.startKey); 
  }

  saveProducto() {
    if (this.productoForm.invalid) {
      this.toastr.error('Todos los campos son requeridos', 'Ha ocurrido un error');
      return;
    }
    //Guardar en Firebase
    if (this.edicion) {
    this._db.updateProducto(this.idEdicion, this.productoForm.value);
      this.toastr.success('Producto modificado correctamente', 'Operación exitosa');
      this.productoForm.reset();
      this.edicion = false;
      this.idEdicion = '';
      this.producto = null;
      document.getElementById('codigo')!.removeAttribute('readonly');
      this.closeButtonForm.nativeElement.click();
    }
    else {
      this.productoForm.value.inventario = 0;
      this.productoForm.value.isActive = true;
      this._db.saveProducto(this.productoForm.value);
      this.toastr.success('Producto guardado correctamente', 'Operación exitosa');
      this.productoForm.reset();
      this.edicion = false;
      this.idEdicion = '';
      this.producto = null;
      document.getElementById('codigo')!.removeAttribute('readonly');
      this.closeButtonForm.nativeElement.click();
    }
  }

  qrGenerate(codigo: string, descripcion: string, marca: string) {
    this.qrModal.show();
    this.qrCode = '';
    this.cod = codigo;
    this.des = descripcion;
    this.mar = marca;
    this.qrCode = this.cod + '|' + this.des + '|' + this.mar;
  }

  getKardex(codigo: string, id: string) {
    this._db.getProducto(id).subscribe( e => {
      console.log(e.inventario);
      if (e.inventario > 0) {
        this.kardex = [];
        this.kardexModal.show();
        this.cod = codigo;
        this.compras = this._db.getCompras(codigo);
        this.compras.subscribe(c => {
          for(var i = 0; i < c.length; i++) {
            let kar = c[i];
            kar.fecha = this._utils.getDateFromTimestamp(kar.fecha);
            //kar.tipo = kar.tipo;
            kar.date = this._utils.getDateFromString(kar.fecha);
            console.log(kar);
            
            this.kardex.push(kar);
          }
        });
        this.ventas = this._db.getVentas(codigo);
        this.ventas.subscribe(v => {
          for(var i = 0; i < v.length; i++) {
            this.articulo = v[i].descripcion;
            let kar = v[i];
            kar.fecha = this._utils.getDateFromTimestamp(kar.fecha);
            //kar.tipo = 'VENTA';
            kar.date = this._utils.getDateFromString(kar.fecha);
            console.log(kar);
            this.kardex.push(kar);
          }
        });
        setTimeout(() => {
          this.kardex.sort(function(a,b) {
            return a.date.getTime() - b.date.getTime();
          });
        }, 800);
      }
      else {
        Swal.fire(
          'Atención',
          'No existe inventario del item seleccionado',
          'error'
        )
      }
    });
    
  }

  pdfGenerate() {
    var data = document.getElementById('contentToConvert') as HTMLElement;
    html2canvas(data, { useCORS: true, allowTaint: true, scrollY: 0 }).then((canvas) => {
      const image = { type: 'jpeg', quality: 0.98 };
      const margin = [0.5, 0.5];
      const filename = 'myfile.pdf';

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
        debugger;
        var imgData = pageCanvas.toDataURL('image/' + image.type, image.quality);
        pdf.addImage(imgData, image.type, margin[1], margin[0], innerPageWidth, pageHeight);

        var str = "Página " + (page+1)  + " de " +  nPages;
        pdf.setFontSize(5);// optional
        pdf.text("Documento generado por el Sistema Automotivos MEGA en fecha " + this.getDate(), 0.5, pdf.internal.pageSize.height - 0.2);
        pdf.text(str, 7.5, pdf.internal.pageSize.height - 0.2);
      }

      pdf.save();
    });
  }

  getDate(): string {
    var today = new Date();
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0');
    var yyyy = today.getFullYear();
    return dd + '/' + mm + '/' + yyyy;
  }

  /*kardexGenerate(codigo: string) {
    this.kardex = [];
    this.total = 0;
    this.costoTotal = 0.0;
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
    setTimeout(() => {
      for(var j = 0; j < this.kardex.length; j++) {
        if (this.kardex[j].tipo == 'COMPRA') {
          this.total += this.kardex[j].cantidad;
          this.costoTotal += this.kardex[j].total;
        }
        else {
          this.total -= this.kardex[j].cantidad;
          this.costoTotal -= this.kardex[j].total;

        }
        this.kardex[j].cantTotal = this.total;
        this.kardex[j].costoTotal = this.costoTotal;
      }
    }, 700);
  }*/
}
