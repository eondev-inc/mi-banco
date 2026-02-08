import cluster from 'cluster';
import * as os from 'os';

const numCPUs = os.cpus().length;

export function runInCluster(bootstrap: () => Promise<void>) {
  if (cluster.isPrimary) {
    console.log(`[Cluster] Master ${process.pid} is running`);
    console.log(`[Cluster] Forking ${numCPUs} workers...`);

    // Fork workers
    for (let i = 0; i < numCPUs; i++) {
      cluster.fork();
    }

    cluster.on('exit', (worker, code, signal) => {
      console.log(
        `[Cluster] Worker ${worker.process.pid} died (code: ${code}, signal: ${signal})`,
      );
      console.log('[Cluster] Starting a new worker...');
      cluster.fork();
    });

    cluster.on('online', (worker) => {
      console.log(`[Cluster] Worker ${worker.process.pid} is online`);
    });
  } else {
    bootstrap();
    console.log(`[Cluster] Worker ${process.pid} started`);
  }
}
