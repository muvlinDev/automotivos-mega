import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AngularFireModule } from '@angular/fire/compat';

import { AppComponent } from './app.component';
import { FooterComponent } from './layout/footer/footer.component';
import { HeaderComponent } from './layout/header/header.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { InicioComponent } from './pages/inicio/inicio.component';
import { ProductosComponent } from './pages/productos/productos.component';
import { LoginComponent } from './pages/login/login.component';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule, HashLocationStrategy, LocationStrategy } from '@angular/common';
import { QRCodeModule } from 'angularx-qrcode';
import { AngularFireAuthModule } from '@angular/fire/compat/auth';
import { ToastrModule } from 'ngx-toastr';
import { ComprasComponent } from './pages/compras/compras.component';
import { VentasComponent } from './pages/ventas/ventas.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { InventarioComponent } from './pages/inventario/inventario.component';
import { CantidadDirective } from './directives/cantidad.directive';
import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';

const firebaseConfig = {
  apiKey: "AIzaSyDkCeaHHfICNrBgkC-eBAAq21yux1yxt7g",
  authDomain: "automotivos-mega.firebaseapp.com",
  projectId: "automotivos-mega",
  storageBucket: "automotivos-mega.appspot.com",
  messagingSenderId: "29543287602",
  appId: "1:29543287602:web:0122c630d1571ecf6c652b",
  measurementId: "G-6HX72QBBR9"
};

@NgModule({
  declarations: [
    AppComponent,
    FooterComponent,
    HeaderComponent,
    InicioComponent,
    ProductosComponent,
    LoginComponent,
    ComprasComponent,
    VentasComponent,
    InventarioComponent,
    CantidadDirective
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    NgbModule,
    ReactiveFormsModule,
    CommonModule,
    QRCodeModule,
    AngularFireModule.initializeApp(firebaseConfig),
    AngularFireAuthModule,
    BrowserAnimationsModule,
    ToastrModule.forRoot(),
    SweetAlert2Module.forRoot()
  ],
  providers: [
    
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
