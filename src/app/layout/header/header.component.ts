import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {

  usuario = "";
  email = "";

  constructor( private _auth: AuthService,
               private router: Router) { 
    this.usuario = _auth.getLocalData("names") + " " + _auth.getLocalData("lastnames");
    this.email = _auth.getLocalData("email")!;
  }

  ngOnInit(): void {}
  

  logout() {
    this._auth.clearLocalStorage();
    this.router.navigateByUrl("/login");
  }
}
