import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { UsuariosModule } from './usuarios/usuarios.module';
import { ColoniasModule } from './colonias/colonias.module';

import { AreasModule } from './areas/areas/areas.module'; // 🔹 importar aquí
import { AsignacionesModule } from './asignaciones/asignaciones.module';


import { TramitesModule } from './tramites/tramites.module';


@Module({
  
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      
    }),

    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      username: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
      autoLoadEntities: true,
      synchronize: false,
      ssl: {
        rejectUnauthorized: false,
      },
    }),

    UsuariosModule,
    ColoniasModule,
    AreasModule, 

    AsignacionesModule,

    TramitesModule,

  ],
})
export class AppModule {}
