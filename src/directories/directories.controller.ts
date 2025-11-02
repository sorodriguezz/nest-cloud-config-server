import { Controller, Get, HttpCode, HttpStatus } from "@nestjs/common";
import { DirectoriesService } from "./directories.service";

@Controller("directories")
export class DirectoriesController {
  constructor(private readonly directoriesService: DirectoriesService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  listDirectories() {
    const directories = this.directoriesService.listDirectories();
    return directories;
  }
}
