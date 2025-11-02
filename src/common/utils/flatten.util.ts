/**
 * Convierte un objeto anidado en formato plano con dot notation
 * Ejemplo: { server: { port: 8080 } } -> { "server.port": 8080 }
 * Arrays de objetos: { items: [{a:1}, {b:2}] } -> { "items[0].a": 1, "items[1].b": 2 }
 */
export function flattenObject(obj: any, prefix: string = ""): any {
  // Si no es un objeto, retornar tal cual
  if (obj === null || obj === undefined) {
    return obj;
  }

  // Si no es un objeto (string, number, boolean), retornar tal cual
  if (typeof obj !== "object") {
    return obj;
  }

  const flattened: any = {};

  // Si es un array
  if (Array.isArray(obj)) {
    // Si el array contiene objetos, aplanar cada elemento
    obj.forEach((item, index) => {
      const arrayKey = prefix ? `${prefix}[${index}]` : `[${index}]`;

      if (item !== null && typeof item === "object" && !Array.isArray(item)) {
        // Si el elemento es un objeto, aplanar recursivamente
        const nested = flattenObject(item, arrayKey);
        Object.assign(flattened, nested);
      } else {
        // Si es un valor primitivo o array anidado
        flattened[arrayKey] = item;
      }
    });
    return flattened;
  }

  // Si es un objeto normal
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const value = obj[key];
      const newKey = prefix ? `${prefix}.${key}` : key;

      if (value !== null && value !== undefined && typeof value === "object") {
        // Si es un objeto o array anidado, aplicar recursión
        const nested = flattenObject(value, newKey);
        Object.assign(flattened, nested);
      } else {
        // Si es un valor primitivo o null, agregar directamente
        flattened[newKey] = value;
      }
    }
  }

  return flattened;
}
