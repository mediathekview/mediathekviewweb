export type HttpResponse<T extends string | Buffer> = {
  statusCode: number;
  statusMessage: string;
  body: T;
}
