export interface NpmUser {
  username: string
  email: string
}

export interface PackageMetadata {
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

export interface PackageNpmData {
  downloads: {
    from: string
    to: string
    count: number
  }[]
  starsCount: number
}

export interface PackageGitHubData {
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

export interface PackageSourceData {
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

export interface PackageEvaluation {
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

export interface PackageScore {
  final: number
  detail: {
    quality: number
    popularity: number
    maintenance: number
  }
}

export interface PackageInfo {
  analyzedAt: string
  collected: {
    metadata: PackageMetadata
    npm: PackageNpmData
    github: PackageGitHubData
    source: PackageSourceData
  },
  evaluation: PackageEvaluation
  score: PackageScore
}

export type NpmDownloadPeriod = 'last-day' | 'last-week' | 'last-month' | 'last-year';

export type NpmPackageDownloads = {
  downloads: number
  start: string
  end: string
  package: string
}
