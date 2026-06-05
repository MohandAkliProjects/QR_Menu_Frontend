import { useCallback, useState } from "react";

export function useAsyncAction() {
  const [isPending, setIsPending] = useState(false);

  const run = useCallback(async <T>(action: () => Promise<T>): Promise<T | undefined> => {
    setIsPending(true);
    try {
      return await action();
    } finally {
      setIsPending(false);
    }
  }, []);

  return { isPending, run };
}
