import { Module } from "@nestjs/common";
import { DirectoriesController } from "./directories.controller";
import { DirectoriesService } from "./directories.service";

@Module({
  controllers: [DirectoriesController],
  providers: [DirectoriesService],
  exports: [DirectoriesService],
})
export class DirectoriesModule {}
