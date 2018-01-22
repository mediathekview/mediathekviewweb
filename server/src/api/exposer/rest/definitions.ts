export type RestResponse = { result?: any, errors?: RestError[] };
export type RestError = { type: string, message?: string };
