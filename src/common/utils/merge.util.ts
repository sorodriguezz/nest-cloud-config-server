type Mergeable = Record<string, any>;

export type MergeStrategy = "deep" | "shallow";

export const mergeConfigs = (
  base: any,
  override: any,
  strategy: MergeStrategy = "deep"
): any => {
  if (override === undefined) {
    return base;
  }

  if (base === undefined || base === null) {
    return cloneValue(override);
  }

  if (strategy === "shallow") {
    if (isPlainObject(base) && isPlainObject(override)) {
      return { ...base, ...override };
    }
    return cloneValue(override);
  }

  if (isPlainObject(base) && isPlainObject(override)) {
    return deepMerge(base, override);
  }

  return cloneValue(override);
};

const deepMerge = (base: Mergeable, override: Mergeable): Mergeable => {
  const result: Mergeable = { ...base };

  Object.keys(override).forEach((key) => {
    const baseValue = result[key];
    const overrideValue = override[key];

    if (isPlainObject(baseValue) && isPlainObject(overrideValue)) {
      result[key] = deepMerge(baseValue, overrideValue);
      return;
    }

    result[key] = cloneValue(overrideValue);
  });

  return result;
};

const isPlainObject = (value: any): value is Mergeable => {
  if (!value || typeof value !== "object") {
    return false;
  }

  return Object.prototype.toString.call(value) === "[object Object]";
};

const cloneValue = (value: any): any => {
  if (Array.isArray(value)) {
    return value.map((item) => cloneValue(item));
  }

  if (isPlainObject(value)) {
    return deepMerge({}, value);
  }

  return value;
};
