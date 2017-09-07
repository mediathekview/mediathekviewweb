import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'duration'
})
export class DurationPipe implements PipeTransform {
  transform(totalSeconds: number, args?: any): string {
    const minutes = Math.floor(totalSeconds / 60).toFixed().padStart(2, '0');
    const seconds = (totalSeconds % 60).toFixed().padStart(2, '0');

    return `${minutes}:${seconds}`;
  }
}
