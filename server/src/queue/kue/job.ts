import * as Kue from 'kue';
import { Job } from '../';
import { Serializer } from '../../serializer/serializer';

export class KueJob<T> implements Job<T> {
  private readonly job: Kue.Job;
  private deserialized: boolean = false;
  private deserializedData: T;

  get data(): T {
    if (!this.deserialized) {
      this.deserializedData = Serializer.deserialize(this.job.data);
      this.deserialized = true;
    }

    return this.deserializedData;
  }

  constructor(job: Kue.Job) {
    this.job = job;
  }
}
