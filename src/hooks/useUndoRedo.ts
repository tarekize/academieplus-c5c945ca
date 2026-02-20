import { useReducer, useCallback } from 'react';

interface HistoryState<T> {
  past: T[];
  present: T;
  future: T[];
}

type HistoryAction<T> =
  | { type: 'SET'; newPresent: T }
  | { type: 'UNDO' }
  | { type: 'REDO' }
  | { type: 'RESET'; initialPresent: T };

function historyReducer<T>(state: HistoryState<T>, action: HistoryAction<T>): HistoryState<T> {
  switch (action.type) {
    case 'SET': {
      const { newPresent } = action;
      if (JSON.stringify(newPresent) === JSON.stringify(state.present)) {
        return state;
      }
      return {
        past: [...state.past, state.present],
        present: newPresent,
        future: [],
      };
    }
    case 'UNDO': {
      if (state.past.length === 0) return state;
      const previous = state.past[state.past.length - 1];
      const newPast = state.past.slice(0, state.past.length - 1);
      return {
        past: newPast,
        present: previous,
        future: [state.present, ...state.future],
      };
    }
    case 'REDO': {
      if (state.future.length === 0) return state;
      const next = state.future[0];
      const newFuture = state.future.slice(1);
      return {
        past: [...state.past, state.present],
        present: next,
        future: newFuture,
      };
    }
    case 'RESET': {
      return {
        past: [],
        present: action.initialPresent,
        future: [],
      };
    }
  }
}

export function useUndoRedo<T>(initialPresent: T) {
  const [state, dispatch] = useReducer(historyReducer<T>, {
    past: [],
    present: initialPresent,
    future: [],
  });

  const set = useCallback((newPresent: T) => {
    dispatch({ type: 'SET', newPresent });
  }, []);

  const undo = useCallback(() => {
    dispatch({ type: 'UNDO' });
  }, []);

  const redo = useCallback(() => {
    dispatch({ type: 'REDO' });
  }, []);

  const reset = useCallback((newPresent: T) => {
    dispatch({ type: 'RESET', initialPresent: newPresent });
  }, []);

  const canUndo = state.past.length > 0;
  const canRedo = state.future.length > 0;

  return {
    state: state.present,
    set,
    undo,
    redo,
    reset,
    canUndo,
    canRedo,
  };
}
