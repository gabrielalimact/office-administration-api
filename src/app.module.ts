import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { UsuarioModule } from './modules/usuario/usuario.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProcessosModule } from './modules/processos/processos.module';
import { ClienteModule } from './modules/cliente/cliente.module';
import { EnderecosModule } from './modules/enderecos/enderecos.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'postgres',
      database: 'office_administration_db',
      autoLoadEntities: true,
      synchronize: true,
    }),
    AuthModule,
    UsuarioModule,
    ProcessosModule,
    ClienteModule,
    EnderecosModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
