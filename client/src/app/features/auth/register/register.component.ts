import { Component, inject, signal, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatStepperModule } from '@angular/material/stepper';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatSelectModule } from '@angular/material/select';
import { AuthService } from '../../../core/auth/auth.service';
import { RegionesService, Region, Comuna } from '../../../core/services/regiones.service';
import { rutValidator } from '../../../shared/validators/rut.validator';
import { minAgeValidator } from '../../../shared/validators/age.validator';
import { emailMatchValidator } from '../../../shared/validators/email-match.validator';
import { clean } from 'rut.js';

@Component({
	selector: 'app-register',
	standalone: true,
	imports: [
		ReactiveFormsModule,
		RouterLink,
		MatCardModule,
		MatFormFieldModule,
		MatInputModule,
		MatButtonModule,
		MatIconModule,
		MatProgressSpinnerModule,
		MatSnackBarModule,
		MatStepperModule,
		MatDatepickerModule,
		MatSelectModule,
	],
	template: `
		<div class="auth-container">
			<div class="auth-brand">
				<mat-icon class="auth-brand__icon">account_balance</mat-icon>
				<h1 class="auth-brand__name">Mi Banco</h1>
				<p class="auth-brand__tagline">Crea tu cuenta en segundos</p>
			</div>

			<mat-card class="auth-card">
				<mat-card-header>
					<mat-card-title>Crear Cuenta</mat-card-title>
					<mat-card-subtitle>Completa tus datos para registrarte</mat-card-subtitle>
				</mat-card-header>

				<mat-card-content>
					@if (auth.authError()) {
						<div class="auth-error" role="alert">
							<mat-icon>error_outline</mat-icon>
							<span>{{ auth.authError() }}</span>
						</div>
					}

					<mat-stepper [linear]="true" #stepper>

						<!-- ==================== PASO 1: IDENTIDAD ==================== -->
						<mat-step [stepControl]="identidadForm" label="Identidad">
							<form [formGroup]="identidadForm">
								<div class="step-content">

									<mat-form-field appearance="outline" class="full-width">
										<mat-label>Nombres</mat-label>
										<input matInput formControlName="nombres" autocomplete="given-name" aria-label="Nombres">
										<mat-icon matPrefix>person</mat-icon>
										@if (identidadForm.get('nombres')?.hasError('required') && identidadForm.get('nombres')?.touched) {
											<mat-error>Los nombres son obligatorios</mat-error>
										}
										@if (identidadForm.get('nombres')?.hasError('minlength')) {
											<mat-error>Minimo 2 caracteres</mat-error>
										}
									</mat-form-field>

									<mat-form-field appearance="outline" class="full-width">
										<mat-label>Apellidos</mat-label>
										<input matInput formControlName="apellidos" autocomplete="family-name" aria-label="Apellidos">
										<mat-icon matPrefix>person_outline</mat-icon>
										@if (identidadForm.get('apellidos')?.hasError('required') && identidadForm.get('apellidos')?.touched) {
											<mat-error>Los apellidos son obligatorios</mat-error>
										}
										@if (identidadForm.get('apellidos')?.hasError('minlength')) {
											<mat-error>Minimo 2 caracteres</mat-error>
										}
									</mat-form-field>

									<mat-form-field appearance="outline" class="full-width">
										<mat-label>RUT</mat-label>
										<input matInput formControlName="rut" placeholder="12.345.678-9" autocomplete="username" aria-label="RUT">
										<mat-icon matPrefix>badge</mat-icon>
										@if (identidadForm.get('rut')?.hasError('required') && identidadForm.get('rut')?.touched) {
											<mat-error>El RUT es obligatorio</mat-error>
										}
										@if (identidadForm.get('rut')?.hasError('invalidRut')) {
											<mat-error>RUT invalido</mat-error>
										}
									</mat-form-field>

									<mat-form-field appearance="outline" class="full-width">
										<mat-label>Fecha de nacimiento</mat-label>
										<input matInput [matDatepicker]="picker" formControlName="fechaNacimiento" aria-label="Fecha de nacimiento">
										<mat-icon matPrefix>cake</mat-icon>
										<mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
										<mat-datepicker #picker></mat-datepicker>
										@if (identidadForm.get('fechaNacimiento')?.hasError('required') && identidadForm.get('fechaNacimiento')?.touched) {
											<mat-error>La fecha de nacimiento es obligatoria</mat-error>
										}
										@if (identidadForm.get('fechaNacimiento')?.hasError('minAge')) {
											<mat-error>Debes tener al menos 18 anos para registrarte</mat-error>
										}
									</mat-form-field>

									<div class="step-actions">
										<button mat-flat-button color="primary" matStepperNext type="button">
											Continuar
										</button>
									</div>
								</div>
							</form>
						</mat-step>

						<!-- ==================== PASO 2: CONTACTO ==================== -->
						<mat-step [stepControl]="contactoForm" label="Contacto">
							<form [formGroup]="contactoForm">
								<div class="step-content">

									<mat-form-field appearance="outline" class="full-width">
										<mat-label>Correo electronico</mat-label>
										<input matInput type="email" formControlName="email" autocomplete="email" aria-label="Correo electronico">
										<mat-icon matPrefix>email</mat-icon>
										@if (contactoForm.get('email')?.hasError('required') && contactoForm.get('email')?.touched) {
											<mat-error>El correo es obligatorio</mat-error>
										}
										@if (contactoForm.get('email')?.hasError('email')) {
											<mat-error>Correo invalido</mat-error>
										}
									</mat-form-field>

									<mat-form-field appearance="outline" class="full-width">
										<mat-label>Confirmar correo electronico</mat-label>
										<input matInput type="email" formControlName="emailConfirmacion" autocomplete="email" aria-label="Confirmar correo electronico">
										<mat-icon matPrefix>mark_email_read</mat-icon>
										@if (contactoForm.get('emailConfirmacion')?.hasError('required') && contactoForm.get('emailConfirmacion')?.touched) {
											<mat-error>La confirmacion del correo es obligatoria</mat-error>
										}
										@if (contactoForm.get('emailConfirmacion')?.hasError('email')) {
											<mat-error>Correo invalido</mat-error>
										}
										@if (contactoForm.hasError('emailMismatch') && contactoForm.get('emailConfirmacion')?.touched) {
											<mat-error>Los correos no coinciden</mat-error>
										}
									</mat-form-field>

									<mat-form-field appearance="outline" class="full-width">
										<mat-label>Telefono</mat-label>
										<input matInput type="tel" formControlName="telefono" placeholder="+56 9 XXXX XXXX" autocomplete="tel" aria-label="Telefono">
										<mat-icon matPrefix>phone</mat-icon>
										@if (contactoForm.get('telefono')?.hasError('required') && contactoForm.get('telefono')?.touched) {
											<mat-error>El telefono es obligatorio</mat-error>
										}
										@if (contactoForm.get('telefono')?.hasError('pattern')) {
											<mat-error>Formato invalido. Ej: +56912345678 o 912345678</mat-error>
										}
									</mat-form-field>

									<div class="step-actions">
										<button mat-button matStepperPrevious type="button">Atras</button>
										<button mat-flat-button color="primary" matStepperNext type="button">
											Continuar
										</button>
									</div>
								</div>
							</form>
						</mat-step>

						<!-- ==================== PASO 3: UBICACION ==================== -->
						<mat-step [stepControl]="ubicacionForm" label="Ubicacion">
							<form [formGroup]="ubicacionForm">
								<div class="step-content">

									<mat-form-field appearance="outline" class="full-width">
										<mat-label>Region</mat-label>
										<mat-select formControlName="regionId" (selectionChange)="onRegionChange($event.value)" aria-label="Region">
											@for (region of regiones(); track region._id) {
												<mat-option [value]="region._id">{{ region.nombre }}</mat-option>
											}
										</mat-select>
										<mat-icon matPrefix>map</mat-icon>
										@if (ubicacionForm.get('regionId')?.hasError('required') && ubicacionForm.get('regionId')?.touched) {
											<mat-error>La region es obligatoria</mat-error>
										}
									</mat-form-field>

									<mat-form-field appearance="outline" class="full-width">
										<mat-label>Comuna</mat-label>
										<mat-select formControlName="comunaId" [disabled]="comunas().length === 0" aria-label="Comuna">
											@for (comuna of comunas(); track comuna._id) {
												<mat-option [value]="comuna._id">{{ comuna.nombre }}</mat-option>
											}
										</mat-select>
										<mat-icon matPrefix>location_city</mat-icon>
										@if (ubicacionForm.get('comunaId')?.hasError('required') && ubicacionForm.get('comunaId')?.touched) {
											<mat-error>La comuna es obligatoria</mat-error>
										}
									</mat-form-field>

									<mat-form-field appearance="outline" class="full-width">
										<mat-label>Direccion</mat-label>
										<input matInput formControlName="direccion" autocomplete="street-address" aria-label="Direccion">
										<mat-icon matPrefix>home</mat-icon>
										@if (ubicacionForm.get('direccion')?.hasError('required') && ubicacionForm.get('direccion')?.touched) {
											<mat-error>La direccion es obligatoria</mat-error>
										}
										@if (ubicacionForm.get('direccion')?.hasError('minlength')) {
											<mat-error>Minimo 5 caracteres</mat-error>
										}
									</mat-form-field>

									<div class="step-actions">
										<button mat-button matStepperPrevious type="button">Atras</button>
										<button mat-flat-button color="primary" matStepperNext type="button">
											Continuar
										</button>
									</div>
								</div>
							</form>
						</mat-step>

						<!-- ==================== PASO 4: SEGURIDAD ==================== -->
						<mat-step [stepControl]="seguridadForm" label="Seguridad">
							<form [formGroup]="seguridadForm" (ngSubmit)="onSubmit()" novalidate>
								<div class="step-content">

									<mat-form-field appearance="outline" class="full-width">
										<mat-label>Contrasena</mat-label>
										<input matInput
											[type]="hidePassword() ? 'password' : 'text'"
											formControlName="password"
											autocomplete="new-password"
											aria-label="Contrasena">
										<mat-icon matPrefix>lock</mat-icon>
										<button mat-icon-button
											matSuffix
											type="button"
											(click)="hidePassword.set(!hidePassword())"
											[attr.aria-label]="hidePassword() ? 'Mostrar contrasena' : 'Ocultar contrasena'">
											<mat-icon>{{ hidePassword() ? 'visibility_off' : 'visibility' }}</mat-icon>
										</button>
										@if (seguridadForm.get('password')?.hasError('required') && seguridadForm.get('password')?.touched) {
											<mat-error>La contrasena es obligatoria</mat-error>
										}
										@if (seguridadForm.get('password')?.hasError('minlength')) {
											<mat-error>Minimo 6 caracteres</mat-error>
										}
									</mat-form-field>

									<!-- Password strength indicator -->
									@if (seguridadForm.get('password')?.value) {
										<div class="password-strength">
											<div class="password-strength__bar"
												[class]="'password-strength__bar--' + passwordStrength()">
											</div>
											<span class="password-strength__label">
												{{ passwordStrengthLabel() }}
											</span>
										</div>
									}

									<div class="step-actions">
										<button mat-button matStepperPrevious type="button">Atras</button>
										<button mat-flat-button
											color="primary"
											type="submit"
											[disabled]="seguridadForm.invalid || auth.isLoading()">
											@if (auth.isLoading()) {
												<mat-spinner diameter="20" class="btn-spinner"></mat-spinner>
												Registrando...
											} @else {
												Crear Cuenta
											}
										</button>
									</div>
								</div>
							</form>
						</mat-step>

					</mat-stepper>
				</mat-card-content>

				<mat-card-actions align="end">
					<span class="auth-link-text">Ya tienes cuenta?</span>
					<a mat-button color="primary" routerLink="/auth/login">Iniciar sesion</a>
				</mat-card-actions>
			</mat-card>
		</div>
	`,
	styles: [
		`
			.auth-container {
				min-height: 100vh;
				display: flex;
				flex-direction: column;
				align-items: center;
				justify-content: center;
				padding: 24px;
				background: linear-gradient(135deg, #0a2640 0%, #1a4a6d 100%);
			}

			.auth-brand {
				text-align: center;
				margin-bottom: 32px;
			}

			.auth-brand__icon {
				font-size: 48px;
				width: 48px;
				height: 48px;
				color: #65e4a3;
			}

			.auth-brand__name {
				font-size: 2rem;
				font-weight: 700;
				color: #ffffff;
				margin: 8px 0 4px;
				letter-spacing: -1px;
			}

			.auth-brand__tagline {
				color: rgba(255, 255, 255, 0.7);
				font-size: 0.9375rem;
				margin: 0;
			}

			.auth-card {
				width: 100%;
				max-width: 520px;
				border-radius: 0.5rem !important;
				padding: 8px 16px 16px;
			}

			.auth-error {
				display: flex;
				align-items: center;
				gap: 8px;
				padding: 12px 16px;
				border-radius: 8px;
				background: rgba(220, 53, 69, 0.1);
				color: #dc3545;
				margin-bottom: 16px;
				font-size: 0.875rem;
			}

			.auth-error mat-icon {
				font-size: 20px;
				width: 20px;
				height: 20px;
			}

			.full-width {
				width: 100%;
			}

			.step-content {
				padding: 16px 0;
			}

			.step-actions {
				display: flex;
				gap: 8px;
				justify-content: flex-end;
				margin-top: 16px;
			}

			.btn-spinner {
				display: inline-block;
				margin-right: 8px;
			}

			.auth-link-text {
				font-size: 0.875rem;
				color: #757575;
				margin-right: 4px;
			}

			.password-strength {
				margin-bottom: 16px;
			}

			.password-strength__bar {
				height: 4px;
				border-radius: 2px;
				transition: all 300ms ease;
			}

			.password-strength__bar--weak {
				width: 33%;
				background: #dc3545;
			}
			.password-strength__bar--medium {
				width: 66%;
				background: #fd7e14;
			}
			.password-strength__bar--strong {
				width: 100%;
				background: #65e4a3;
			}

			.password-strength__label {
				font-size: 0.75rem;
				color: #757575;
				margin-top: 4px;
				display: block;
			}
		`,
	],
})
export class RegisterComponent implements OnInit {
	readonly auth = inject(AuthService);
	private readonly fb = inject(FormBuilder);
	private readonly router = inject(Router);
	private readonly snackBar = inject(MatSnackBar);
	private readonly regionesService = inject(RegionesService);

	readonly hidePassword = signal(true);
	readonly regiones = signal<Region[]>([]);
	readonly comunas = signal<Comuna[]>([]);

	// ==================== PASO 1: Identidad ====================
	readonly identidadForm = this.fb.nonNullable.group({
		nombres: ['', [Validators.required, Validators.minLength(2)]],
		apellidos: ['', [Validators.required, Validators.minLength(2)]],
		rut: ['', [Validators.required, rutValidator()]],
		fechaNacimiento: [null as Date | null, [Validators.required, minAgeValidator(18)]],
	});

	// ==================== PASO 2: Contacto ====================
	readonly contactoForm = this.fb.nonNullable.group(
		{
			email: ['', [Validators.required, Validators.email]],
			emailConfirmacion: ['', [Validators.required, Validators.email]],
			telefono: ['', [Validators.required, Validators.pattern(/^(\+56)?9\d{8}$/)]],
		},
		{ validators: emailMatchValidator('email', 'emailConfirmacion') },
	);

	// ==================== PASO 3: Ubicacion ====================
	readonly ubicacionForm = this.fb.nonNullable.group({
		regionId: ['', Validators.required],
		comunaId: ['', Validators.required],
		direccion: ['', [Validators.required, Validators.minLength(5)]],
	});

	// ==================== PASO 4: Seguridad ====================
	readonly seguridadForm = this.fb.nonNullable.group({
		password: ['', [Validators.required, Validators.minLength(6)]],
	});

	ngOnInit(): void {
		this.regionesService.getRegiones().subscribe((list) => this.regiones.set(list));
	}

	onRegionChange(regionId: string): void {
		this.comunas.set([]);
		this.ubicacionForm.patchValue({ comunaId: '' });
		if (regionId) {
			this.regionesService.getComunasByRegion(regionId).subscribe((list) => this.comunas.set(list));
		}
	}

	passwordStrength(): string {
		const pwd = this.seguridadForm.get('password')?.value ?? '';
		if (pwd.length < 6) return 'weak';
		if (pwd.length >= 10 && /[A-Z]/.test(pwd) && /[0-9]/.test(pwd)) return 'strong';
		return 'medium';
	}

	passwordStrengthLabel(): string {
		const s = this.passwordStrength();
		return s === 'weak' ? 'Debil' : s === 'medium' ? 'Media' : 'Fuerte';
	}

	onSubmit(): void {
		if (
			this.identidadForm.invalid ||
			this.contactoForm.invalid ||
			this.ubicacionForm.invalid ||
			this.seguridadForm.invalid
		) {
			this.identidadForm.markAllAsTouched();
			this.contactoForm.markAllAsTouched();
			this.ubicacionForm.markAllAsTouched();
			this.seguridadForm.markAllAsTouched();
			return;
		}

		this.auth.clearError();

		const { nombres, apellidos, rut, fechaNacimiento } = this.identidadForm.getRawValue();
		const { email, emailConfirmacion, telefono } = this.contactoForm.getRawValue();
		const { regionId, comunaId, direccion } = this.ubicacionForm.getRawValue();
		const { password } = this.seguridadForm.getRawValue();

		// Format RUT for backend (clean -> body-DV)
		const cleanedRut = clean(rut);
		const formattedRut = cleanedRut.length >= 2
			? `${cleanedRut.slice(0, -1)}-${cleanedRut.slice(-1)}`
			: cleanedRut;

		// Format date as ISO string YYYY-MM-DD
		const fechaStr = fechaNacimiento instanceof Date
			? fechaNacimiento.toISOString().split('T')[0]
			: (fechaNacimiento as string | null) ?? '';

		this.auth.register({
			nombres,
			apellidos,
			email,
			emailConfirmacion,
			rut: formattedRut,
			telefono,
			fechaNacimiento: fechaStr,
			direccion,
			regionId,
			comunaId,
			password,
		}).subscribe((success) => {
			if (success) {
				this.snackBar.open('Cuenta creada exitosamente. Inicia sesion.', 'Cerrar', {
					duration: 5000,
					panelClass: 'success-snackbar',
				});
				this.router.navigate(['/auth/login']);
			}
		});
	}
}
