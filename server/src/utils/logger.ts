/**
 * Modulo para tener un output por consola más ordenado y con colores
 * que detallen la importancia de las salidas
 */
export class Logger {
	private getFormattedTimestamp(): string {
		const formatter = new Intl.DateTimeFormat('es-CL', {
			timeZone: 'America/Santiago',
			year: 'numeric',
			month: '2-digit',
			day: '2-digit',
			hour: '2-digit',
			minute: '2-digit',
			second: '2-digit',
			hour12: false
		});

		const parts = formatter.formatToParts(new Date());
		const day = parts.find(p => p.type === 'day')?.value;
		const month = parts.find(p => p.type === 'month')?.value;
		const year = parts.find(p => p.type === 'year')?.value;
		const hour = parts.find(p => p.type === 'hour')?.value;
		const minute = parts.find(p => p.type === 'minute')?.value;
		const second = parts.find(p => p.type === 'second')?.value;

		return `${day}-${month}-${year} ${hour}:${minute}:${second}`;
	}

	//Logger debug
	/**
	 * Imprime en consola el/los mensajes indicados en color Debug
	 * @param textoA
	 * @param textoB
	 */
	public d(textoA: string, textoB?: string): void {
		const timestamp = this.getFormattedTimestamp();
		if (textoB) {
			console.log(`\x1b[34m${timestamp} - ${textoA}: ${textoB}\x1b[0m`);
		} else {
			console.log(`\x1b[34m${timestamp} - ${textoA}\x1b[0m`);
		}
	}

	/**
	 * Imprime en consola el/los mensajes indicados en color Error
	 * @param textoA
	 * @param textoB
	 */
	//Logger error
	public e(textoA: string, textoB?: string): void {
		const timestamp = this.getFormattedTimestamp();
		if (textoB) {
			console.log(`\x1b[31m${timestamp} - ${textoA}: ${textoB}\x1b[0m`);
		} else {
			console.log(`\x1b[31m${timestamp} - ${textoA}\x1b[0m`);
		}
	}

	/**
	 * Imprime en consola el/los mensajes indicados en color Verbose
	 *  @param textoA
	 *  @param textoB
	 */
	//Logger verbose
	public v(textoA: string, textoB?: string): void {
		const timestamp = this.getFormattedTimestamp();
		if (textoB) {
			console.log(`\x1b[33m${timestamp} - ${textoA}: ${textoB}\x1b[0m`);
		} else {
			console.log(`\x1b[33m${timestamp} - ${textoA}\x1b[0m`);
		}
	}
}
