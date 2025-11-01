import { Module } from '@nestjs/common';
import { ManageRepositoryService } from './manage-repository.service';

@Module({
  providers: [ManageRepositoryService]
})
export class ManageRepositoryModule {}
