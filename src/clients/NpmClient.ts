import axios, { AxiosInstance } from 'axios';

const NPMS_API_URL = 'https://api.npms.io/v2';
const NPM_API_URL = 'https://api.npmjs.org';

export interface NpmUser {
  username: string
  email: string
}

export interface NpmsPackageMetadata {
  name: string
  scope: string | 'unscoped'
  version: string
  description: string
  keywords: string[]
  date: string
  publisher: NpmUser
  maintainers: NpmUser[]
  repository: {
    type: string
    url: string
    directory: string
  }
  links: {
    npm: string
    homepage: string
    repository: string
    bugs: string
  }
  license: string
  dependencies: Record<string, string>
  releases: {
    from: string
    to: string
    count: number
  }[]
  hasSelectiveFiles: boolean
}

export interface NpmsPackageNpmData {
  downloads: {
    from: string
    to: string
    count: number
  }[]
  starsCount: number
}

export interface NpmsPackageGitHubData {
  homepage: string
  starsCount: number
  forksCount: number
  subscribersCount: number
  issues: {
    count: number
    openCount: number
    distribution: Record<string, string>
    isDisabled: boolean
  }
  contributors: {
    username: string
    commitsCount: number
  }[]
  commits: {
    from: string
    to: string
    count: number
  }[]
  statuses: {
    context: string
    state: string
  }[]
}

export interface NpmsPackageSourceData {
  files: {
    readmeSize: number
    testsSize: number
    hasChangelog: boolean
  }
  badges: {
    urls: {
      original: string
      shields: string
      content: string
    }
    info: {
      service: string
      type: string
      modifiers: {
        type: string
      }
    }
  }[]
  linters: string[]
  coverage: number
}

export interface NpmsPackageEvaluation {
  quality: {
    carefulness: number
    tests: number
    health: number
    branding: number
  }
  popularity: {
    communityInterest: number
    downloadsCount: number
    downloadsAcceleration: number
    dependentsCount: number
  }
  maintenance: {
    releasesFrequency: number
    commitsFrequency: number
    openIssues: number
    issuesDistribution: number
  }
}

export interface NpmsPackageScore {
  final: number
  detail: {
    quality: number
    popularity: number
    maintenance: number
  }
}

export interface NpmsPackageInfo {
  analyzedAt: string
  collected: {
    metadata: NpmsPackageMetadata
    npm: NpmsPackageNpmData
    github: NpmsPackageGitHubData
    source: NpmsPackageSourceData
  },
  evaluation: NpmsPackageEvaluation
  score: NpmsPackageScore
}

export type NpmDownloadPeriod = 'last-day' | 'last-week' | 'last-month' | 'last-year';

export type NpmPackageDownloads = {
  downloads: number
  start: string
  end: string
  package: string
}

export class NpmClient {
  private npmsRest: AxiosInstance;
  private npmRest: AxiosInstance;

  constructor() {
    this.npmsRest = axios.create({
      baseURL: NPMS_API_URL
    });
    this.npmRest = axios.create({
      baseURL: NPM_API_URL
    });
  }

  public async getPackageInfo(pkg: string): Promise<NpmsPackageInfo> {
    const response = await this.npmsRest.get(`/package/${pkg}`);
    return response.data;
  }

  public async getMultiplePackagesInfo(pkgs: string[]): Promise<Record<string, NpmsPackageInfo>> {
    const response = await this.npmsRest.post('/package/mget', pkgs);
    return response.data;
  }

  public async getDownloadsInPeriodForPackage(pkg: string, period: NpmDownloadPeriod): Promise<NpmPackageDownloads> {
    const response = await this.npmRest.get(`/downloads/point/${period}/${pkg}`);
    return response.data;
  }
}
