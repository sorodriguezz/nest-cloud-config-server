import { BadRequestException } from "@nestjs/common";
import type { ConfigQuery } from "../models/config-query.model";

const SAFE_TOKEN = /^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$/;

export const validateConfigQuery = (query: ConfigQuery): void => {
  const { repo, application, profile } = query;

  if (!repo || !application || !profile) {
    throw new BadRequestException("Missing required parameters");
  }

  assertSafeToken(repo, "repo");
  assertSafeToken(application, "application");
  assertSafeToken(profile, "profile");
};

export const assertSafeToken = (value: string, field: string) => {
  if (!SAFE_TOKEN.test(value)) {
    throw new BadRequestException(`Invalid ${field} value`);
  }
};
