import { Injectable } from "@nestjs/common";
import { globSync } from "glob";
import { join, sep } from "path";

@Injectable()
export class ConfigFileLocator {
  findConfigFile(
    repositoryPath: string,
    application: string,
    profile: string
  ): string | null {
    const pattern = join(repositoryPath, `${application}-${profile}.*`)
      .split(sep)
      .join("/");

    const matches = globSync(pattern, { nodir: true });

    if (!matches.length) {
      return null;
    }

    matches.sort();
    return matches[0] ?? null;
  }
}
