import { Injectable } from "@nestjs/common";
import { globSync } from "glob";
import { join, sep } from "path";

const DEFAULT_PATTERNS = [
  "application.*",
  "application-{profile}.*",
  "{application}.*",
  "{application}-{profile}.*",
];

@Injectable()
export class ConfigFileLocator {
  findConfigFiles(
    repositoryPath: string,
    application: string,
    profile: string,
    patterns: string[] = DEFAULT_PATTERNS
  ): string[] {
    const matched = new Set<string>();

    patterns.forEach((patternTemplate) => {
      const pattern = this.buildPattern(
        repositoryPath,
        patternTemplate,
        application,
        profile
      );

      const matches = globSync(pattern, { nodir: true }).sort();
      matches.forEach((match) => matched.add(match));
    });

    return Array.from(matched);
  }

  private buildPattern(
    repositoryPath: string,
    template: string,
    application: string,
    profile: string
  ): string {
    const resolved = template
      .replace(/\{application\}/g, application)
      .replace(/\{profile\}/g, profile);

    return join(repositoryPath, resolved).split(sep).join("/");
  }
}
