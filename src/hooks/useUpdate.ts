import { useCallback, useState } from 'react';

function useUpdate() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_, setCount] = useState(0);
  const update = useCallback(() => {
    setCount((x) => x + 1);
  }, []);
  return update;
}

export default useUpdate;
