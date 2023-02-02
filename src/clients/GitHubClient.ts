import axios, { AxiosInstance } from 'axios';

const API_URL = 'https://api.github.com';

export interface GitHubRepoData {
  id: number
  node_id: string
  name: string
  full_name: string
  private: boolean
  owner: {
    login: string
    id: number
    node_id: string
    avatar_url: string
    gravatar_id: string
    url: string
    html_url: string
    followers_url: string
    following_url: string
    gists_url: string
    starred_url: string
    subscriptions_url: string
    organizations_url: string
    repos_url: string
    events_url: string
    received_events_url: string
    type: string
    site_admin: boolean
  }
  html_url: string
  description: string
  fork: boolean
  url: string
  forks_url: string
  keys_url: string
  collaborators_url: string
  teams_url: string
  hooks_url: string
  issue_events_url: string
  events_url: string
  assignees_url: string
  branches_url: string
  tags_url: string
  blobs_url: string
  git_tags_url: string
  git_refs_url: string
  trees_url: string
  statuses_url: string
  languages_url: string
  stargazers_url: string
  contributors_url: string
  subscribers_url: string
  subscription_url: string
  commits_url: string
  git_commits_url: string
  comments_url: string
  issue_comment_url: string
  contents_url: string
  compare_url: string
  merges_url: string
  archive_url: string
  downloads_url: string
  issues_url: string
  pulls_url: string
  milestones_url: string
  notifications_url: string
  labels_url: string
  releases_url: string
  deployments_url: string
  created_at: string
  updated_at: string
  pushed_at: string
  git_url: string
  ssh_url: string
  clone_url: string
  svn_url: string
  homepage: string
  size: number
  stargazers_count: number
  watchers_count: number
  language: string
  has_issues: boolean
  has_projects: boolean
  has_downloads: boolean
  has_wiki: boolean
  has_pages: boolean
  has_discussions: boolean
  forks_count: number
  mirror_url: string | null
  archived: boolean
  disabled: boolean
  open_issues_count: number
  license: {
    key: string
    name: string
    spdx_id: string
    url: string
    node_id: string
  }
  allow_forking: boolean
  is_template: boolean
  web_commit_signoff_required: boolean
  topics: string[]
  visibility: string
  forks: number
  open_issues: number
  watchers: number
  default_branch: string
  permissions: {
    admin: boolean
    maintain: boolean
    push: boolean
    triage: boolean
    pull: boolean
  }
  temp_clone_token: string
  allow_squash_merge: boolean
  allow_merge_commit: boolean
  allow_rebase_merge: boolean
  allow_auto_merge: boolean
  delete_branch_on_merge: boolean
  allow_update_branch: boolean
  use_squash_pr_title_as_default: boolean
  squash_merge_commit_message: string
  squash_merge_commit_title: string
  merge_commit_message: string
  merge_commit_title: string
  security_and_analysis: {
    secret_scanning: {
      status: string
    }
    secret_scanning_push_protection: {
      status: string
    }
  }
  network_count: number
  subscribers_count: number
}

export interface GitHubRepoCommitCount {
  all: number[]
  owner: number[]
}

export interface GitHubRepoReferrerSource {
  referrer: string
  count: number
  uniques: number
}

export interface GitHubRepoClone {
  timestamp: string
  count: number
  uniques: number
}

export interface GitHubRepoClones {
  count: number
  uniques: number
  clones: GitHubRepoClone[]
}

export interface GitHubRepoPageView {
  timestamp: string
  count: number
  uniques: number
}

export interface GitHubRepoPageViews {
  count: number
  uniques: number
  views: GitHubRepoClone[]
}

export class GitHubClient {
  private rest: AxiosInstance;

  constructor(token: string) {
    this.rest = axios.create({
      baseURL: API_URL,
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github.v3+json'
      }
    });
  }

  public async getRepoData(repo: string): Promise<GitHubRepoData> {
    const response = await this.rest.get(`/repos/${repo}`);
    return response.data;
  }

  public async getWeeklyCommitCountForRepo(repo: string): Promise<GitHubRepoCommitCount> {
    const response = await this.rest.get(`/repos/${repo}/stats/participation`);
    return response.data;
  }

  public async getTopReferralSourcesForRepo(repo: string): Promise<GitHubRepoReferrerSource[]> {
    const response = await this.rest.get(`/repos/${repo}/traffic/popular/referrers`);
    return response.data;
  }

  public async getWeeklyClonesForRepo(repo: string): Promise<GitHubRepoClones> {
    const response = await this.rest.get(`/repos/${repo}/traffic/clones`, {
      params: {
        per: 'week'
      }
    });

    return response.data;
  }

  public async getWeeklyPageViewsForRepo(repo: string): Promise<GitHubRepoPageViews> {
    const response = await this.rest.get(`/repos/${repo}/traffic/views`, {
      params: {
        per: 'week'
      }
    });

    return response.data;
  }
}
