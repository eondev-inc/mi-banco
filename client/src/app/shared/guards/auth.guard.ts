import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot,
  UrlTree
} from '@angular/router';
import { Observable } from 'rxjs';

/**
 * Guard para proteger rutas que requieren autenticación
 * Verifica si existe datos de usuario en localStorage
 */
@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

    // Verificar si existe RUT del usuario en localStorage
    const userRut = localStorage.getItem('rut');
    const userName = localStorage.getItem('nombre');

    if (userRut && userName) {
      // Usuario autenticado
      return true;
    }

    // No autenticado - redirigir a inicio
    console.warn('Acceso denegado. Usuario no autenticado.');
    return this.router.createUrlTree(['/inicio'], {
      queryParams: { returnUrl: state.url }
    });
  }
}
