import { useCallback } from 'react';
import useSafeState from './useSafeState';

function useUpdate() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_, setCount] = useSafeState(0);
  const update = useCallback(() => {
    setCount((x) => x + 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return update;
}

export default useUpdate;
