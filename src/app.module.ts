import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { UsuarioModule } from './modules/usuario/usuario.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProcessosModule } from './modules/processos/processos.module';
import { ClienteModule } from './modules/cliente/cliente.module';
import { EnderecosModule } from './modules/enderecos/enderecos.module';
import { RelatoriosModule } from './modules/relatorios/relatorios.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { ArquivoModule } from './modules/arquivo/arquivo.module';
import { BeneficiosModule } from './modules/beneficios/beneficios.module';
import { StatusProcessoModule } from './modules/status-processo/status-processo.module';
import { AuditoriaModule } from './modules/auditoria/auditoria.module';
import { RotasModule } from './modules/rotas/rotas.module';
import * as dotenv from 'dotenv';
import { TipoAgendamentoModule } from './modules/agendamento/agendamento.module';
dotenv.config();
@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT, 10),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      autoLoadEntities: true,
      synchronize: true,
    }),
    AuthModule,
    ArquivoModule,
    UsuarioModule,
    ProcessosModule,
    ClienteModule,
    EnderecosModule,
    RelatoriosModule,
    DashboardModule,
    BeneficiosModule,
    StatusProcessoModule,
    TipoAgendamentoModule,
    AuditoriaModule,
    RotasModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
