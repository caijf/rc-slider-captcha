import { useEffect, useRef } from 'react';

function useUnmountedRef() {
  const unmountedRef = useRef(false);

  useEffect(() => {
    unmountedRef.current = false;

    return () => {
      unmountedRef.current = true;
    };
  }, []);

  return unmountedRef;
}

export default useUnmountedRef;
