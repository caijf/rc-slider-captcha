import { useCallback, useState, Dispatch, SetStateAction } from 'react';
import useUnmountedRef from './useUnmountedRef';

function useSafeState<S>(initialState: S | (() => S)): [S, Dispatch<SetStateAction<S>>];
function useSafeState<S = undefined>(): [S | undefined, Dispatch<SetStateAction<S | undefined>>];
function useSafeState<S>(
  initialState?: S | undefined | (() => S)
): [S | undefined, Dispatch<SetStateAction<S | undefined>>] {
  const [state, setState] = useState(initialState);
  const unmountedRef = useUnmountedRef();

  const updateState: typeof setState = useCallback((v) => {
    if (!unmountedRef.current) {
      setState(v);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return [state, updateState];
}

export default useSafeState;
