import { Observable, from, ObservableInput, OperatorFunction } from 'rxjs';

export function exhaustWithLastMap<T, I>(project: (value: T, index: number) => ObservableInput<I>): OperatorFunction<T, I> {
  return (source) => {
    let index = -1;
    let currentProjection: Observable<I> | null = null;
    let hasNextValue = false;
    let nextValue: T;

    const observable = new Observable<I>((subscriber) => {
      const subscription = source.subscribe((value) => {
        index++;
        hasNextValue = true;
        nextValue = value;

        function projectNextValue() {
          currentProjection = from(project(nextValue, index));
          hasNextValue = false;

          currentProjection.subscribe({
            next: (value) => subscriber.next(value),
            error: (error) => subscriber.error(error),
            complete: () => {
              currentProjection = null;
              if (hasNextValue) {
                projectNextValue();
              }
            }
          });
        }

        if (currentProjection == null) {
          projectNextValue();
        }
      });

      return subscription;
    });

    return observable;
  };
}
