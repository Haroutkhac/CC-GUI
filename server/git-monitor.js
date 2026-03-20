// Git Monitor: reads diffs, detects file overlaps, checks mergeability, creates PRs
// Pure git utility functions — no state management, no scheduling.

import { execFile } from 'child_process';
import { promisify } from 'util';

const execFileAsync = promisify(execFile);
const MAX_DIFF_SIZE = 50000;
const GIT_TIMEOUT = 15000;

async function git(args, cwd, options = {}) {
  const { stdout } = await execFileAsync('git', ['-C', cwd, ...args], {
    timeout: options.timeout || GIT_TIMEOUT,
    maxBuffer: 1024 * 512,
    env: { ...process.env },
  });
  return (stdout || '').trim();
}

export class GitMonitor {

  // Get diff stats and raw diff for a worktree (changes vs its base branch)
  async getDiff(worktreePath) {
    try {
      const base = await this._getBaseBranch(worktreePath);
      const [stat, raw] = await Promise.all([
        git(['diff', '--stat', `${base}...HEAD`], worktreePath).catch(() => ''),
        git(['diff', `${base}...HEAD`], worktreePath).catch(() => ''),
      ]);

      const files = this._parseDiffStat(stat);
      const truncated = raw.length > MAX_DIFF_SIZE ? raw.slice(0, MAX_DIFF_SIZE) + '\n... (truncated)' : raw;

      return { files, rawDiff: truncated, summary: stat || 'No changes' };
    } catch {
      return { files: [], rawDiff: '', summary: 'Unable to read diff' };
    }
  }

  // Get uncommitted changes in the worktree
  async getWorkingChanges(worktreePath) {
    try {
      const status = await git(['status', '--porcelain'], worktreePath);
      return status ? status.split('\n').filter(Boolean) : [];
    } catch {
      return [];
    }
  }

  // Get branch status: commits ahead of base
  async getBranchStatus(worktreePath) {
    try {
      const base = await this._getBaseBranch(worktreePath);
      const log = await git(['log', '--oneline', `${base}..HEAD`], worktreePath).catch(() => '');
      const commits = log ? log.split('\n').filter(Boolean).map(line => {
        const [hash, ...rest] = line.split(' ');
        return { hash, message: rest.join(' ') };
      }) : [];
      return { commitCount: commits.length, commits, base };
    } catch {
      return { commitCount: 0, commits: [], base: 'main' };
    }
  }

  // Get list of files changed on this branch vs base
  async getChangedFiles(worktreePath) {
    try {
      const base = await this._getBaseBranch(worktreePath);
      const out = await git(['diff', '--name-only', `${base}...HEAD`], worktreePath);
      return out ? out.split('\n').filter(Boolean) : [];
    } catch {
      return [];
    }
  }

  // Check if two branches can auto-merge (dry run)
  async checkMergeability(projectPath, branchA, branchB) {
    try {
      // Get merge base
      const mergeBase = await git(['merge-base', branchA, branchB], projectPath);
      if (!mergeBase) return { mergeable: true, conflicts: [] };

      // Use merge-tree to check for conflicts without modifying working tree
      try {
        const result = await git(['merge-tree', mergeBase, branchA, branchB], projectPath);
        // merge-tree outputs conflict markers if there are conflicts
        const conflicts = [];
        const conflictMatches = result.matchAll(/changed in both\n\s+base\s+\d+ [a-f0-9]+ (.+)\n/g);
        for (const match of conflictMatches) {
          conflicts.push({ file: match[1], type: 'both_modified' });
        }
        return { mergeable: conflicts.length === 0, conflicts };
      } catch {
        return { mergeable: true, conflicts: [] };
      }
    } catch {
      return { mergeable: true, conflicts: [] };
    }
  }

  // Find file overlaps between multiple sessions' branches
  async getFileOverlaps(projectPath, sessionsWithWorktrees) {
    const fileMap = {}; // filePath -> [sessionIds]
    const sessionFiles = {};

    await Promise.all(sessionsWithWorktrees.map(async (s) => {
      const files = await this.getChangedFiles(s.worktreePath);
      sessionFiles[s.id] = files;
      for (const file of files) {
        if (!fileMap[file]) fileMap[file] = [];
        fileMap[file].push(s.id);
      }
    }));

    // Only return files touched by 2+ sessions
    const overlaps = [];
    for (const [file, sessionIds] of Object.entries(fileMap)) {
      if (sessionIds.length > 1) {
        overlaps.push({ file, sessionIds });
      }
    }

    return { overlaps, sessionFiles };
  }

  // Rebase a worktree branch onto latest base
  async rebase(worktreePath, projectPath) {
    const base = await this._getBaseBranch(worktreePath);
    try {
      await git(['fetch', 'origin', base], projectPath, { timeout: 30000 });
    } catch {
      // Might not have a remote, that's ok
    }
    try {
      await git(['rebase', `origin/${base}`], worktreePath, { timeout: 30000 });
      return { success: true };
    } catch (err) {
      // Abort failed rebase
      await git(['rebase', '--abort'], worktreePath).catch(() => {});
      return { success: false, error: err.message };
    }
  }

  // Push branch to origin
  async push(worktreePath, branchName) {
    try {
      await git(['-c', 'push.autoSetupRemote=true', 'push', '-u', 'origin', branchName], worktreePath, { timeout: 30000 });
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }

  // Create a PR using gh CLI
  async createPR(worktreePath, branchName, baseBranch, title, body) {
    try {
      const { stdout } = await execFileAsync('gh', [
        'pr', 'create',
        '--base', baseBranch,
        '--head', branchName,
        '--title', title,
        '--body', body,
      ], {
        cwd: worktreePath,
        timeout: 30000,
        env: { ...process.env },
      });
      const url = (stdout || '').trim();
      return { success: true, url };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }

  // Get the current branch name
  async getCurrentBranch(worktreePath) {
    try {
      return await git(['rev-parse', '--abbrev-ref', 'HEAD'], worktreePath);
    } catch {
      return null;
    }
  }

  // --- Internal helpers ---

  async _getBaseBranch(worktreePath) {
    // Try to find main/master as the base
    try {
      await git(['rev-parse', '--verify', 'main'], worktreePath);
      return 'main';
    } catch {
      try {
        await git(['rev-parse', '--verify', 'master'], worktreePath);
        return 'master';
      } catch {
        return 'HEAD~10'; // fallback
      }
    }
  }

  _parseDiffStat(stat) {
    if (!stat) return [];
    const files = [];
    for (const line of stat.split('\n')) {
      const match = line.match(/^\s*(.+?)\s+\|\s+(\d+)\s*([+-]*)/);
      if (match) {
        const plusCount = (match[3].match(/\+/g) || []).length;
        const minusCount = (match[3].match(/-/g) || []).length;
        files.push({
          path: match[1].trim(),
          changes: parseInt(match[2]),
          insertions: plusCount,
          deletions: minusCount,
        });
      }
    }
    return files;
  }
}
