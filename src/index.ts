import { useCallback, useEffect, useState } from 'react';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import useConstant from 'use-constant';

export const useRx = <Event, State>(
  callback: (event$: Observable<Event>, state$: BehaviorSubject<State>) => Observable<State>,
  initialState: State
): [
    state: State,
    dispatch: (event: Event) => void,
    setState: React.Dispatch<React.SetStateAction<State>>,
  ] => {
  const [state, setState] = useState(initialState);
  const event$ = useConstant(() => new Subject<Event>());
  const state$ = useConstant(() => new BehaviorSubject<State>(initialState));
  const dispatch = useCallback((event: Event) => {
    event$.next(event);
  }, []);

  useEffect(() => {
    const subscription = callback(event$, state$)
      .subscribe(setState);

    return () => {
      subscription.unsubscribe();
      state$.complete();
      event$.complete();
    }
  }, []);

  useEffect(() => {
    state$.next(state)
  }, [state]);

  return [state, dispatch, setState];
};
