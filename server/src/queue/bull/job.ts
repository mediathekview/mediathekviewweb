import * as Bull from 'bull';
import { Job } from '../';
import { Serializer } from '../../common/serializer';


export class BullJob<T> implements Job<T> {
  private readonly job: Bull.Job;
  private readonly serializer: Serializer;

  private deserialized: boolean;
  private deserializedData: T | null;

  get data(): T {
    if (!this.deserialized) {
      this.deserializedData = this.serializer.deserialize(this.job.data.data);
      this.deserialized = true;
    }

    return this.deserializedData as T;
  }

  constructor(job: Bull.Job, serializer: Serializer) {
    this.job = job;
    this.serializer = serializer;

    this.deserialized = false;
    this.deserializedData = null;
  }
}
