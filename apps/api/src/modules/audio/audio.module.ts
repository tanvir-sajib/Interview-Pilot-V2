import { Module } from '@nestjs/common';
import { AudioController } from './audio.controller';
import { AudioService } from './audio.service';
import { LocalStorageProvider } from './storage/local-storage.provider';
import { MockSTTProvider } from './stt/mock-stt.provider';
import { STORAGE_PROVIDER_TOKEN } from './interfaces/storage.interface';
import { STT_PROVIDER_TOKEN } from './interfaces/stt.interface';

@Module({
  controllers: [AudioController],
  providers: [
    AudioService,
    { provide: STORAGE_PROVIDER_TOKEN, useClass: LocalStorageProvider },
    { provide: STT_PROVIDER_TOKEN, useClass: MockSTTProvider },
  ],
  exports: [AudioService, STORAGE_PROVIDER_TOKEN, STT_PROVIDER_TOKEN],
})
export class AudioModule {}
