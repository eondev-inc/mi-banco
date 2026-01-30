import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

/**
 * Componente Navbar con Material Design
 * Barra de navegación principal con menú responsive y gestión de sesión
 */
@Component({
    selector: 'app-navbar',
    templateUrl: './navbar.component.html',
    styleUrls: ['./navbar.component.scss'],
    standalone: false
})
export class NavbarComponent implements OnInit {
  public loggedIn: boolean = false;
  public userName: string = '';

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.comprobarSesion();
  }

  /**
   * Cierra la sesión del usuario y limpia localStorage
   */
  public cerrarSesion(): void {
    localStorage.removeItem('login');
    localStorage.removeItem('bancos');
    localStorage.removeItem('rut');
    localStorage.removeItem('nombre');
    this.loggedIn = false;
    this.userName = '';
    this.router.navigate(['/inicio']);
  }

  /**
   * Comprueba si existe una sesión activa en localStorage
   */
  private comprobarSesion(): void {
    const login = JSON.parse(localStorage.getItem('login') || '{}');
    const nombre = localStorage.getItem('nombre');

    if (Object.keys(login).length > 0) {
      this.loggedIn = true;
      this.userName = nombre || 'Usuario';
    } else {
      this.loggedIn = false;
      this.userName = '';
    }
  }
}
