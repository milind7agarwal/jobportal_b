const queue = [];
let running = false;

export const enqueue = async (jobFn) => {
  return new Promise((resolve, reject) => {
    queue.push({ jobFn, resolve, reject });
    void processQueue();
  });
};

const processQueue = async () => {
  if (running) return;
  const next = queue.shift();
  if (!next) return;

  running = true;
  try {
    const result = await next.jobFn();
    next.resolve(result);
  } catch (err) {
    next.reject(err);
  } finally {
    running = false;
    if (queue.length) void processQueue();
  }
};

