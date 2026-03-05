import 'tsconfig-paths/register';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { Connection } from 'mongoose';
import { getConnectionToken } from '@nestjs/mongoose';

/**
 * Seed script for Chilean regions and comunas.
 *
 * Source: Wikipedia "Anexo:Comunas de Chile" – 346 comunas across 16 regions.
 * CUT (Código Único Territorial) codes from the Chilean government.
 *
 * Collections created:
 *   - regiones: { _id, nombre, codigo, ordinal, cut }
 *   - comunas:  { _id, nombre, regionId }
 */

interface RegionSeed {
  nombre: string;
  codigo: string;
  ordinal: string;
  cut: string;
  comunas: string[];
}

const REGIONES: RegionSeed[] = [
  {
    nombre: 'Arica y Parinacota',
    codigo: 'CL-AP',
    ordinal: 'XV',
    cut: '15',
    comunas: ['Arica', 'Camarones', 'Putre', 'General Lagos'],
  },
  {
    nombre: 'Tarapacá',
    codigo: 'CL-TA',
    ordinal: 'I',
    cut: '01',
    comunas: [
      'Iquique',
      'Alto Hospicio',
      'Pozo Almonte',
      'Camiña',
      'Colchane',
      'Huara',
      'Pica',
    ],
  },
  {
    nombre: 'Antofagasta',
    codigo: 'CL-AN',
    ordinal: 'II',
    cut: '02',
    comunas: [
      'Antofagasta',
      'Mejillones',
      'Sierra Gorda',
      'Taltal',
      'Calama',
      'Ollagüe',
      'San Pedro de Atacama',
      'Tocopilla',
      'María Elena',
    ],
  },
  {
    nombre: 'Atacama',
    codigo: 'CL-AT',
    ordinal: 'III',
    cut: '03',
    comunas: [
      'Copiapó',
      'Caldera',
      'Tierra Amarilla',
      'Chañaral',
      'Diego de Almagro',
      'Vallenar',
      'Alto del Carmen',
      'Freirina',
      'Huasco',
    ],
  },
  {
    nombre: 'Coquimbo',
    codigo: 'CL-CO',
    ordinal: 'IV',
    cut: '04',
    comunas: [
      'La Serena',
      'Coquimbo',
      'Andacollo',
      'La Higuera',
      'Paihuano',
      'Vicuña',
      'Illapel',
      'Canela',
      'Los Vilos',
      'Salamanca',
      'Ovalle',
      'Combarbalá',
      'Monte Patria',
      'Punitaqui',
      'Río Hurtado',
    ],
  },
  {
    nombre: 'Valparaíso',
    codigo: 'CL-VS',
    ordinal: 'V',
    cut: '05',
    comunas: [
      'Valparaíso',
      'Casablanca',
      'Concón',
      'Juan Fernández',
      'Puchuncaví',
      'Quintero',
      'Viña del Mar',
      'Isla de Pascua',
      'Los Andes',
      'Calle Larga',
      'Rinconada',
      'San Esteban',
      'La Ligua',
      'Cabildo',
      'Papudo',
      'Petorca',
      'Zapallar',
      'Quillota',
      'La Calera',
      'Hijuelas',
      'La Cruz',
      'Nogales',
      'San Antonio',
      'Algarrobo',
      'Cartagena',
      'El Quisco',
      'El Tabo',
      'Santo Domingo',
      'San Felipe',
      'Catemu',
      'Llay-Llay',
      'Panquehue',
      'Putaendo',
      'Santa María',
      'Quilpué',
      'Limache',
      'Olmué',
      'Villa Alemana',
    ],
  },
  {
    nombre: 'Metropolitana de Santiago',
    codigo: 'CL-RM',
    ordinal: 'RM',
    cut: '13',
    comunas: [
      'Santiago',
      'Cerrillos',
      'Cerro Navia',
      'Conchalí',
      'El Bosque',
      'Estación Central',
      'Huechuraba',
      'Independencia',
      'La Cisterna',
      'La Florida',
      'La Granja',
      'La Pintana',
      'La Reina',
      'Las Condes',
      'Lo Barnechea',
      'Lo Espejo',
      'Lo Prado',
      'Macul',
      'Maipú',
      'Ñuñoa',
      'Pedro Aguirre Cerda',
      'Peñalolén',
      'Providencia',
      'Pudahuel',
      'Quilicura',
      'Quinta Normal',
      'Recoleta',
      'Renca',
      'San Joaquín',
      'San Miguel',
      'San Ramón',
      'Vitacura',
      'Puente Alto',
      'Pirque',
      'San José de Maipo',
      'Colina',
      'Lampa',
      'Til Til',
      'San Bernardo',
      'Buin',
      'Calera de Tango',
      'Paine',
      'Melipilla',
      'Alhué',
      'Curacaví',
      'María Pinto',
      'San Pedro',
      'Talagante',
      'El Monte',
      'Isla de Maipo',
      'Padre Hurtado',
      'Peñaflor',
    ],
  },
  {
    nombre: "Libertador General Bernardo O'Higgins",
    codigo: 'CL-LI',
    ordinal: 'VI',
    cut: '06',
    comunas: [
      'Rancagua',
      'Codegua',
      'Coinco',
      'Coltauco',
      'Doñihue',
      'Graneros',
      'Las Cabras',
      'Machalí',
      'Malloa',
      'Mostazal',
      'Olivar',
      'Peumo',
      'Pichidegua',
      'Quinta de Tilcoco',
      'Rengo',
      'Requínoa',
      'San Vicente',
      'Pichilemu',
      'La Estrella',
      'Litueche',
      'Marchigüe',
      'Navidad',
      'Paredones',
      'San Fernando',
      'Chépica',
      'Chimbarongo',
      'Lolol',
      'Nancagua',
      'Palmilla',
      'Peralillo',
      'Placilla',
      'Pumanque',
      'Santa Cruz',
    ],
  },
  {
    nombre: 'Maule',
    codigo: 'CL-ML',
    ordinal: 'VII',
    cut: '07',
    comunas: [
      'Talca',
      'Constitución',
      'Curepto',
      'Empedrado',
      'Maule',
      'Pelarco',
      'Pencahue',
      'Río Claro',
      'San Clemente',
      'San Rafael',
      'Cauquenes',
      'Chanco',
      'Pelluhue',
      'Curicó',
      'Hualañé',
      'Licantén',
      'Molina',
      'Rauco',
      'Romeral',
      'Sagrada Familia',
      'Teno',
      'Vichuquén',
      'Linares',
      'Colbún',
      'Longaví',
      'Parral',
      'Retiro',
      'San Javier',
      'Villa Alegre',
      'Yerbas Buenas',
    ],
  },
  {
    nombre: 'Ñuble',
    codigo: 'CL-NB',
    ordinal: 'XVI',
    cut: '16',
    comunas: [
      'Chillán',
      'Bulnes',
      'Chillán Viejo',
      'El Carmen',
      'Pemuco',
      'Pinto',
      'Quillón',
      'San Ignacio',
      'Yungay',
      'Quirihue',
      'Cobquecura',
      'Coelemu',
      'Ninhue',
      'Portezuelo',
      'Ránquil',
      'Treguaco',
      'San Carlos',
      'Coihueco',
      'Ñiquén',
      'San Fabián',
      'San Nicolás',
    ],
  },
  {
    nombre: 'Biobío',
    codigo: 'CL-BI',
    ordinal: 'VIII',
    cut: '08',
    comunas: [
      'Concepción',
      'Coronel',
      'Chiguayante',
      'Florida',
      'Hualqui',
      'Lota',
      'Penco',
      'San Pedro de La Paz',
      'Santa Juana',
      'Talcahuano',
      'Tomé',
      'Hualpén',
      'Lebu',
      'Arauco',
      'Cañete',
      'Contulmo',
      'Curanilahue',
      'Los Álamos',
      'Tirúa',
      'Los Ángeles',
      'Antuco',
      'Cabrero',
      'Laja',
      'Mulchén',
      'Nacimiento',
      'Negrete',
      'Quilaco',
      'Quilleco',
      'San Rosendo',
      'Santa Bárbara',
      'Tucapel',
      'Yumbel',
      'Alto Biobío',
    ],
  },
  {
    nombre: 'La Araucanía',
    codigo: 'CL-AR',
    ordinal: 'IX',
    cut: '09',
    comunas: [
      'Temuco',
      'Carahue',
      'Cunco',
      'Curarrehue',
      'Freire',
      'Galvarino',
      'Gorbea',
      'Lautaro',
      'Loncoche',
      'Melipeuco',
      'Nueva Imperial',
      'Padre Las Casas',
      'Perquenco',
      'Pitrufquén',
      'Pucón',
      'Saavedra',
      'Teodoro Schmidt',
      'Toltén',
      'Vilcún',
      'Villarrica',
      'Cholchol',
      'Angol',
      'Collipulli',
      'Curacautín',
      'Ercilla',
      'Lonquimay',
      'Los Sauces',
      'Lumaco',
      'Purén',
      'Renaico',
      'Traiguén',
      'Victoria',
    ],
  },
  {
    nombre: 'Los Ríos',
    codigo: 'CL-LR',
    ordinal: 'XIV',
    cut: '14',
    comunas: [
      'Valdivia',
      'Corral',
      'Lanco',
      'Los Lagos',
      'Máfil',
      'Mariquina',
      'Paillaco',
      'Panguipulli',
      'La Unión',
      'Futrono',
      'Lago Ranco',
      'Río Bueno',
    ],
  },
  {
    nombre: 'Los Lagos',
    codigo: 'CL-LL',
    ordinal: 'X',
    cut: '10',
    comunas: [
      'Puerto Montt',
      'Calbuco',
      'Cochamó',
      'Fresia',
      'Frutillar',
      'Los Muermos',
      'Llanquihue',
      'Maullín',
      'Puerto Varas',
      'Castro',
      'Ancud',
      'Chonchi',
      'Curaco de Vélez',
      'Dalcahue',
      'Puqueldón',
      'Queilén',
      'Quellón',
      'Quemchi',
      'Quinchao',
      'Osorno',
      'Puerto Octay',
      'Purranque',
      'Puyehue',
      'Río Negro',
      'San Juan de la Costa',
      'San Pablo',
      'Chaitén',
      'Futaleufú',
      'Hualaihué',
      'Palena',
    ],
  },
  {
    nombre: 'Aysén del General Carlos Ibáñez del Campo',
    codigo: 'CL-AI',
    ordinal: 'XI',
    cut: '11',
    comunas: [
      'Coyhaique',
      'Lago Verde',
      'Aysén',
      'Cisnes',
      'Guaitecas',
      'Cochrane',
      "O'Higgins",
      'Tortel',
      'Chile Chico',
      'Río Ibáñez',
    ],
  },
  {
    nombre: 'Magallanes y de la Antártica Chilena',
    codigo: 'CL-MA',
    ordinal: 'XII',
    cut: '12',
    comunas: [
      'Punta Arenas',
      'Laguna Blanca',
      'Río Verde',
      'San Gregorio',
      'Cabo de Hornos',
      'Antártica',
      'Porvenir',
      'Primavera',
      'Timaukel',
      'Natales',
      'Torres del Paine',
    ],
  },
];

async function seedRegionesComunas() {
  console.log('Initializing NestJS application context...');
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn'],
  });

  try {
    const connection = app.get<Connection>(getConnectionToken());
    const db = connection.db;
    if (!db) {
      throw new Error('Database connection not available');
    }

    const regionesCol = db.collection('regiones');
    const comunasCol = db.collection('comunas');

    // Check if data already exists
    const existingRegiones = await regionesCol.countDocuments();
    const existingComunas = await comunasCol.countDocuments();

    if (existingRegiones > 0 || existingComunas > 0) {
      console.log(
        `Found existing data: ${existingRegiones} regiones, ${existingComunas} comunas`,
      );
      console.log('Dropping existing collections to re-seed...');
      await regionesCol.drop().catch(() => {});
      await comunasCol.drop().catch(() => {});
    }

    console.log('Seeding regiones and comunas...\n');

    let totalComunas = 0;

    for (const region of REGIONES) {
      // Insert region
      const regionDoc = await regionesCol.insertOne({
        nombre: region.nombre,
        codigo: region.codigo,
        ordinal: region.ordinal,
        cut: region.cut,
        createdAt: new Date(),
      });

      // Insert comunas for this region
      const comunaDocs = region.comunas.map((nombre) => ({
        nombre,
        regionId: regionDoc.insertedId,
        createdAt: new Date(),
      }));

      await comunasCol.insertMany(comunaDocs);
      totalComunas += region.comunas.length;

      console.log(
        `  ${region.ordinal.padStart(4)} | ${region.nombre}: ${region.comunas.length} comunas`,
      );
    }

    // Create indexes
    console.log('\nCreating indexes...');
    await regionesCol.createIndex({ codigo: 1 }, { unique: true });
    await regionesCol.createIndex({ nombre: 1 }, { unique: true });
    await comunasCol.createIndex({ regionId: 1 });
    await comunasCol.createIndex({ nombre: 1, regionId: 1 }, { unique: true });

    console.log(
      `\nSeed completed: ${REGIONES.length} regiones, ${totalComunas} comunas`,
    );
  } catch (error) {
    console.error('Error seeding data:', error);
    throw error;
  } finally {
    await app.close();
  }
}

seedRegionesComunas()
  .then(() => {
    console.log('\nProcess completed');
    process.exit(0);
  })
  .catch((err) => {
    console.error('\nProcess failed:', err);
    process.exit(1);
  });
