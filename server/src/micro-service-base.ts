import { MicroService } from './service';
import { ServiceBase } from './service-base';

export abstract class MicroServiceBase extends ServiceBase implements MicroService {
  readonly name: string;
  constructor(serviceName: string) {
    super();
    this.name = serviceName;
  }
}
