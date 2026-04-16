"""
auto_push.py — File watcher that auto-commits and pushes changes to GitHub.

Usage:
  python auto_push.py [path_to_watch]

  If no path is given, it watches the folder this script lives in.

Requirements:
  pip install watchdog
"""

import sys
import os
import time
import subprocess
import threading
from datetime import datetime
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler

# ── Config ────────────────────────────────────────────────────────────────────
DEBOUNCE_SECONDS = 4       # Wait this long after the last change before pushing
COMMIT_MSG_PREFIX = "Auto-update"
IGNORED_PATTERNS = {
    ".git", "__pycache__", ".DS_Store", "Thumbs.db",
    "auto_push.py",        # Don't react to edits of this script itself
}
# ─────────────────────────────────────────────────────────────────────────────


def run(cmd, cwd):
    """Run a shell command, return (success, output)."""
    result = subprocess.run(
        cmd, cwd=cwd, capture_output=True, text=True, shell=True
    )
    return result.returncode == 0, result.stdout.strip() + result.stderr.strip()


def is_ignored(path):
    parts = set(path.replace("\\", "/").split("/"))
    return bool(parts & IGNORED_PATTERNS)


def git_push(repo_path):
    """Stage all changes, commit, and push."""
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    msg = f"{COMMIT_MSG_PREFIX}: {timestamp}"

    print(f"\n[{timestamp}] 📦 Changes detected — committing & pushing...")

    ok, out = run("git add -A", repo_path)
    if not ok:
        print(f"  ❌ git add failed: {out}")
        return

    # Check if there's actually anything to commit
    ok, status = run("git status --porcelain", repo_path)
    if not status.strip():
        print("  ✅ Nothing to commit.")
        return

    ok, out = run(f'git commit -m "{msg}"', repo_path)
    if not ok:
        print(f"  ❌ git commit failed: {out}")
        return
    print(f"  ✅ Committed: {msg}")

    ok, out = run("git push", repo_path)
    if ok:
        print(f"  🚀 Pushed to GitHub!")
    else:
        print(f"  ❌ git push failed: {out}")
        print("     (Check your internet connection or GitHub credentials)")


class ChangeHandler(FileSystemEventHandler):
    def __init__(self, repo_path):
        self.repo_path = repo_path
        self._timer = None
        self._lock = threading.Lock()

    def _schedule_push(self):
        with self._lock:
            if self._timer:
                self._timer.cancel()
            self._timer = threading.Timer(DEBOUNCE_SECONDS, git_push, args=[self.repo_path])
            self._timer.daemon = True
            self._timer.start()

    def on_any_event(self, event):
        if event.is_directory:
            return
        if is_ignored(event.src_path):
            return
        self._schedule_push()


def main():
    repo_path = sys.argv[1] if len(sys.argv) > 1 else os.path.dirname(os.path.abspath(__file__))
    repo_path = os.path.abspath(repo_path)

    # Verify it's a git repo
    if not os.path.isdir(os.path.join(repo_path, ".git")):
        print(f"❌ ERROR: '{repo_path}' is not a git repository.")
        print("   Make sure you've cloned your GitHub repo into this folder first.")
        print("   Run setup_repo.bat if you haven't already.")
        sys.exit(1)

    print("=" * 60)
    print("  🤖 Auto-Push Watcher — github.com/koonergurjot/Etsy-Ai-Bot")
    print("=" * 60)
    print(f"  📁 Watching: {repo_path}")
    print(f"  ⏱  Debounce: {DEBOUNCE_SECONDS}s after last change")
    print("  Press Ctrl+C to stop.\n")

    handler = ChangeHandler(repo_path)
    observer = Observer()
    observer.schedule(handler, repo_path, recursive=True)
    observer.start()

    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("\n\n⏹  Watcher stopped.")
        observer.stop()
    observer.join()


if __name__ == "__main__":
    main()
