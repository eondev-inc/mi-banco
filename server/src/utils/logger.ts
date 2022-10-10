import moment from 'moment-timezone';
import * as colors from 'colors';
/**
 * Modulo para tener un output por consola más ordenado y con colores
 * que detallen la importancia de las salidas
 */
export class Logger {
	private moment: any;
	private colors: any;
	constructor() {
		this.colors = colors;
	}
	//Logger debug
	/**
	 * Imprime en consola el/los mensajes indicados en color Debug
	 * @param textoA
	 * @param textoB
	 */
	public d(textoA: string, textoB?: string): void {
		this.moment = moment().tz('America/Santiago').format('DD-MM-YYYY h:mm:ss');
		if (textoB) {
			console.log(this.colors.blue(`${this.moment} - ${textoA}: ${textoB}`));
		} else {
			console.log(this.colors.blue(`${this.moment} - ${textoA}`));
		}
	}

	/**
	 * Imprime en consola el/los mensajes indicados en color Error
	 * @param textoA
	 * @param textoB
	 */
	//Logger error
	public e(textoA: string, textoB?: string): void {
		this.moment = moment().tz('America/Santiago').format('DD-MM-YYYY h:mm:ss');
		if (textoB) {
			console.log(this.colors.red(`${this.moment} - ${textoA}: ${textoB}`));
		} else {
			console.log(this.colors.red(`${this.moment} - ${textoA}`));
		}
	}

	/**
	 * Imprime en consola el/los mensajes indicados en color Verbose
	 *  @param textoA
	 *  @param textoB
	 */
	//Logger verbose
	public v(textoA: string, textoB?: string): void {
		this.moment = moment().tz('America/Santiago').format('DD-MM-YYYY h:mm:ss');
		if (textoB) {
			console.log(this.colors.yellow(`${this.moment} - ${textoA}: ${textoB}`));
		} else {
			console.log(this.colors.yellow(`${this.moment} - ${textoA}`));
		}
	}
}
