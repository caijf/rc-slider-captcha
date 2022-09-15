import { useCallback, useState } from 'react';

function useUpdate() {
  const [_, setCount] = useState(0);
  const update = useCallback(() => {
    setCount((x) => x + 1);
  }, []);
  return update;
}

export default useUpdate;
