import humanizeDuration from 'humanize-duration';

export const createExecutionTimer = () => {
  const start = Date.now();

  return () => {
    const delta = Date.now() - start;

    return {
      milliseconds: delta,
      seconds: delta / 1000,
      formattedDuration: humanizeDuration(delta)
    };
  };
};
