import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { ArquivoController } from './arquivo.controller';
import { ArquivoService } from './arquivo.service';
import { Arquivo } from './entities/arquivo.entity';
import { MulterConfigService } from './multer-config.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Arquivo]),
    MulterModule.registerAsync({
      useClass: MulterConfigService,
    }),
  ],
  controllers: [ArquivoController],
  providers: [ArquivoService, MulterConfigService],
  exports: [ArquivoService],
})
export class ArquivoModule {}
