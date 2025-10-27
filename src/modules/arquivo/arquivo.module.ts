import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ArquivoController } from './arquivo.controller';
import { ArquivoService } from './arquivo.service';
import { Arquivo } from './entities/arquivo.entity';
@Module({
  imports: [TypeOrmModule.forFeature([Arquivo])],
  controllers: [ArquivoController],
  providers: [ArquivoService],
  exports: [ArquivoService],
})
export class ArquivoModule {}
