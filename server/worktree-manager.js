import { execFile } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import os from 'os';
import fs from 'fs';

const execFileAsync = promisify(execFile);
const WORKTREE_BASE = path.join(os.homedir(), '.cc-gui', 'worktrees');

export class WorktreeManager {
  async isGitRepo(projectPath) {
    try {
      await execFileAsync('git', ['-C', projectPath, 'rev-parse', '--git-dir']);
      return true;
    } catch {
      return false;
    }
  }

  async create(projectPath, sessionId, branchName) {
    const worktreePath = path.join(WORKTREE_BASE, sessionId);

    fs.mkdirSync(WORKTREE_BASE, { recursive: true });

    // Clean up stale worktree at this path if it exists
    if (fs.existsSync(worktreePath)) {
      fs.rmSync(worktreePath, { recursive: true, force: true });
      await execFileAsync('git', ['-C', projectPath, 'worktree', 'prune']).catch(() => {});
    }

    await execFileAsync('git', [
      '-C', projectPath,
      'worktree', 'add',
      '-b', branchName,
      worktreePath,
    ]);

    return worktreePath;
  }

  async remove(projectPath, worktreePath) {
    if (!worktreePath) return;
    try {
      await execFileAsync('git', [
        '-C', projectPath,
        'worktree', 'remove',
        worktreePath,
        '--force',
      ]);
    } catch {
      // Manual cleanup if git worktree remove fails
      try {
        fs.rmSync(worktreePath, { recursive: true, force: true });
        await execFileAsync('git', ['-C', projectPath, 'worktree', 'prune']);
      } catch {}
    }
  }

  async removeBranch(projectPath, branchName) {
    if (!branchName) return;
    try {
      await execFileAsync('git', ['-C', projectPath, 'branch', '-D', branchName]);
    } catch {}
  }
}
