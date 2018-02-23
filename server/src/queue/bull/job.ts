import * as Bull from 'bull';
import { Job } from '../';
import { Serializer } from '../../serializer/serializer';

export class BullJob<T> implements Job<T> {
  private readonly job: Bull.Job;
  private deserialized: boolean;
  private deserializedData: T | null;

  get data(): T {
    if (!this.deserialized) {
      this.deserializedData = Serializer.deserialize(this.job.data.data);
      this.deserialized = true;
    }

    return this.deserializedData as T;
  }

  constructor(job: Bull.Job) {
    this.job = job;
    this.deserialized = false;
    this.deserializedData = null;
  }
}
