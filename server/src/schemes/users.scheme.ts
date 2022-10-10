import { Schema } from 'mongoose';
import { User } from '../interface/user.interface';

/**
 * Se crea el esquema User para mongo se debe verificar
 * que funcione
 */
const UserSchema = new Schema<User>({
	nombre: { type: String, required: true },
	email: { type: String, required: true },
	rut: { type: String, required: true },
	password: { type: String, required: true },
	transferencia: [
		{
			nombre: String,
			email: String,
			rut_destinatario: String,
			banco: String,
			tipo_cuenta: String,
			monto: Number,
			fecha: { type: Date, default: Date.now, required: false },
		},
	],
	destinatarios: [
		{
			nombre: String,
			apellido: String,
			email: String,
			rut_destinatario: String,
			telefono: String,
			banco: String,
			tipo_cuenta: String,
			numero_cuenta: Number,
		},
	],
});

export default UserSchema;
