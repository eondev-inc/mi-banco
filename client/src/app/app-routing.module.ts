import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HistorialComponent } from './pages/historial/historial.component';
import { InicioComponent } from './pages/inicio/inicio.component';
import { RegistrarComponent } from './pages/registrar/registrar.component';
import { TransferenciasComponent } from './pages/transferencias/transferencias.component';
import { AuthGuard } from './shared/guards/auth.guard';

/**
 * Configuración de rutas de la aplicación
 * Rutas protegidas con AuthGuard: transferencias, historial, registrar
 */
const routes: Routes = [
	{
		path: 'inicio',
		component: InicioComponent
	},
	{
		path: 'transferencias',
		component: TransferenciasComponent,
		canActivate: [AuthGuard]
	},
	{
		path: 'historial',
		component: HistorialComponent,
		canActivate: [AuthGuard]
	},
	{
		path: 'registrar',
		component: RegistrarComponent,
		canActivate: [AuthGuard]
	},
	{
		path: '',
		redirectTo: 'inicio',
		pathMatch: 'full'
	},
	{
		path: '**',
		redirectTo: 'inicio'
	}
];

@NgModule({
	imports: [RouterModule.forRoot(routes)],
	exports: [RouterModule],
})
export class AppRoutingModule {}
