import argparse
import signal
import sys
import time
import psycopg2
from datetime import datetime

# ---------------------------
# CONFIG
# ---------------------------
DB_CONFIG = {
    "host": "localhost",
    "dbname": "docs",
    "user": "appuser",
    "password": "secret"
}

POLL_SLEEP = 5  # seconds between tasks


# ---------------------------
# GLOBALS
# ---------------------------
SHUTDOWN = False


# ---------------------------
# SIGNAL HANDLING
# ---------------------------
def handle_signal(signum, frame):
    global SHUTDOWN
    SHUTDOWN = True
    print(f"[DAEMON] Received signal {signum}, shutting down...")


signal.signal(signal.SIGTERM, handle_signal)
signal.signal(signal.SIGINT, handle_signal)


# ---------------------------
# DB HELPERS
# ---------------------------
def get_conn():
    return psycopg2.connect(**DB_CONFIG)


def fetch_tasks(conn, job_id):
    with conn.cursor() as cur:
        cur.execute("""
            SELECT task_id, filename, file_path
            FROM task
            WHERE job_id = %s
            ORDER BY task_id
        """, (job_id,))
        return cur.fetchall()


def update_task_status(conn, task_id, status, output=None):
    with conn.cursor() as cur:
        cur.execute("""
            UPDATE task
            SET status = %s,
                end_ts = %s,
                output_json = %s
            WHERE task_id = %s
        """, (status, datetime.utcnow(), output, task_id))
    conn.commit()


def mark_task_running(conn, task_id, pid):
    with conn.cursor() as cur:
        cur.execute("""
            UPDATE task
            SET status = 'RUNNING',
                pid = %s,
                start_ts = %s
            WHERE task_id = %s
        """, (pid, datetime.utcnow(), task_id))
    conn.commit()


def update_job_status(conn, job_id, status):
    with conn.cursor() as cur:
        cur.execute("""
            UPDATE job
            SET status = %s,
                update_ts = %s
            WHERE job_id = %s
        """, (status, datetime.utcnow(), job_id))
    conn.commit()


# ---------------------------
# TASK LOGIC (PLACEHOLDER)
# ---------------------------
def process_file(file_path):
    """
    Replace this with:
    - pdf/text extraction
    - chunking
    - LLM calls
    """
    time.sleep(2)
    return {
        "summary": f"Processed file {file_path}"
    }


# ---------------------------
# MAIN DAEMON LOOP
# ---------------------------
def run(job_id):
    pid = os.getpid()
    print(f"[DAEMON] Starting job {job_id}, pid={pid}")

    conn = get_conn()

    update_job_status(conn, job_id, "RUNNING")

    tasks = fetch_tasks(conn, job_id)

    for task_id, filename, file_path in tasks:
        if SHUTDOWN:
            update_job_status(conn, job_id, "ABORTED")
            print("[DAEMON] Job aborted")
            return

        try:
            print(f"[DAEMON] Running task {task_id} ({filename})")
            mark_task_running(conn, task_id, pid)

            result = process_file(file_path)

            update_task_status(
                conn,
                task_id,
                status="DONE",
                output=result
            )

        except Exception as e:
            update_task_status(
                conn,
                task_id,
                status="FAILED",
                output={"error": str(e)}
            )
            update_job_status(conn, job_id, "FAILED")
            print(f"[DAEMON] Task {task_id} failed: {e}")
            return

        time.sleep(POLL_SLEEP)

    update_job_status(conn, job_id, "DONE")
    print(f"[DAEMON] Job {job_id} completed successfully")


# ---------------------------
# ENTRYPOINT
# ---------------------------
if __name__ == "__main__":
    import os

    parser = argparse.ArgumentParser()
    parser.add_argument("--job-id", required=True, type=int)
    args = parser.parse_args()

    run(args.job_id)
