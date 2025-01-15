import mariadb from "mariadb";
import { wait } from "../utils";
import { ObjectionEngine } from "../engines/high-level-objection.engine";
import { FullJob } from "../types/job";

export class MariaDBHandler {
  connection!: mariadb.Connection;

  async init() {
    this.connection = await mariadb.createConnection(process.env.mariadbURI!);

    await this.createTable();
    await this.cleanPendingJobs();
    await this.mainLoop();
  }

  async mainLoop() {
    while (true) {
      const { affectedRows } = await this.connection.query(
        'UPDATE oe_worker_jobs set worker_id = ?, status="RUNNING" where status = "PENDING" ORDER BY timestamp ASC limit 1',
        [process.env.worker_id]
      );
      if (!affectedRows) {
        await wait(15000);
        continue;
      }

      const work: FullJob = (
        await this.connection.query(
          'select * from oe_worker_jobs where worker_id = ? and status = "RUNNING" limit 1',
          [process.env.worker_id]
        )
      )[0];
      work.engine_job = JSON.parse(work.engine_job as unknown as string);

      const worker = new ObjectionEngine();
      worker.buildJob(work.engine_job);
      const file = await worker.doRender(work.engine_job);

      await this.connection.query(
        'update oe_worker_jobs set final_file = ?, status = "COMPLETE" where ID = ?',
        [file, work.ID]
      );
    }
  }

  private async createTable() {
        await this.connection.query(`CREATE TABLE IF NOT EXISTS \`oe_worker_jobs\` (
    \`ID\` smallint(6) NOT NULL AUTO_INCREMENT,
    \`status\` varchar(10) NOT NULL DEFAULT 'PENDING',
    \`final_file\` varchar(4096) DEFAULT NULL,
    \`worker_id\` tinyint(3) unsigned DEFAULT NULL,
    \`timestamp\` timestamp NOT NULL DEFAULT current_timestamp(),
    \`failed_attempts\` tinyint(3) unsigned NOT NULL DEFAULT 0,
    \`engine_job\` longtext NOT NULL,
    \`requester_id\` varchar(100) NOT NULL,
    PRIMARY KEY (\`ID\`)
    ) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;`);
  }

  async cleanPendingJobs() {
    const pendingJobs = await this.connection.query(
      'SELECT * FROM oe_worker_jobs WHERE worker_id = ? and STATUS = "RUNNING"',
      [process.env.worker_id]
    );
    for (const job of pendingJobs) {
      if (job.failed_attempts >= 3) {
        await this.connection.query(
          "UPDATE oe_worker_jobs SET STATUS = FAILED WHERE ID = ?",
          [job.ID]
        );
      } else {
        await this.connection.query(
          'UPDATE oe_worker_jobs SET failed_attempts = ?, STATUS = "PENDING" WHERE ID = ?',
          [job.failed_attempts + 1, job.ID]
        );
      }
    }
  }
}
