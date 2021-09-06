import { useCallback, useEffect, useState } from 'react';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import useConstant from 'use-constant';

export const useRx = <Event, State>(
  callback: (event$: Observable<Event>, state$: BehaviorSubject<State>) => Observable<State>,
  initialState: State
): [state: State, dispatch: (event: Event) => void] => {
  const [state, setState] = useState(initialState);
  const event$ = useConstant(() => new Subject<Event>());
  const state$ = useConstant(() => new BehaviorSubject<State>(initialState));
  const dispatch = useCallback((event: Event) => {
    event$.next(event);
  }, []);
  useEffect(() => {
    const subscription = callback(event$, state$).subscribe(
      (next) => (setState(next), state$.next(next))
    );
    return () => {
      subscription.unsubscribe();
      state$.complete();
      event$.complete();
    }
  }, []);
  return [state, dispatch];
};
