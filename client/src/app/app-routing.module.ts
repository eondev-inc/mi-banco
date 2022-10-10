import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HistorialComponent } from './pages/historial/historial.component';
import { InicioComponent } from './pages/inicio/inicio.component';
import { RegistrarComponent } from './pages/registrar/registrar.component';
import { TransferenciasComponent } from './pages/transferencias/transferencias.component';

const routes: Routes = [
	{ path: 'inicio', component: InicioComponent },
	{ path: 'transferencias', component: TransferenciasComponent },
	{ path: 'historial', component: HistorialComponent },
	{ path: 'registrar', component: RegistrarComponent },
	{ path: '**', pathMatch: 'full', redirectTo: 'inicio' },
];

@NgModule({
	imports: [RouterModule.forRoot(routes)],
	exports: [RouterModule],
})
export class AppRoutingModule {}
