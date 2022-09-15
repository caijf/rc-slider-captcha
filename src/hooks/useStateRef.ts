import { useRef } from 'react';

function useStateRef<T = any>(state: T) {
  const statusRef = useRef(state);
  if (statusRef.current !== state) {
    statusRef.current = state;
  }
  return statusRef;
}

export default useStateRef;
