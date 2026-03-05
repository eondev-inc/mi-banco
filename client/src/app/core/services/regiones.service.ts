import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/user.model';

export interface Region {
	_id: string;
	nombre: string;
	codigo: string;
	ordinal: number;
	cut: number;
}

export interface Comuna {
	_id: string;
	nombre: string;
	regionId: string;
}

interface RegionesResponseBody {
	regiones: Region[];
}

interface ComunasResponseBody {
	comunas: Comuna[];
}

@Injectable({ providedIn: 'root' })
export class RegionesService {
	private readonly http = inject(HttpClient);
	private readonly apiUrl = environment.apiUrl;

	getRegiones(): Observable<Region[]> {
		return this.http
			.get<ApiResponse<RegionesResponseBody>>(`${this.apiUrl}/regiones`)
			.pipe(map((r) => r.body.regiones));
	}

	getComunasByRegion(regionId: string): Observable<Comuna[]> {
		return this.http
			.get<ApiResponse<ComunasResponseBody>>(`${this.apiUrl}/regiones/${regionId}/comunas`)
			.pipe(map((r) => r.body.comunas));
	}
}
