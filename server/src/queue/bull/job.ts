import * as Bull from 'bull';
import { Job } from '../';
import { Serializer } from '../../serializer/serializer';

export class BullJob<T> implements Job<T> {
  private readonly job: Bull.Job;
  private deserialized: boolean = false;
  private deserializedData: T;

  get data(): T {
    if (!this.deserialized) {
      this.deserializedData = Serializer.deserialize(this.job.data.data);
      this.deserialized = true;
    }

    return this.deserializedData;
  }

  constructor(job: Bull.Job) {
    this.job = job;
  }
}
