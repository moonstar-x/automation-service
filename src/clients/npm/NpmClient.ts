import axios, { AxiosInstance } from 'axios';
import * as Types from './types';

const NPMS_API_URL = 'https://api.npms.io/v2';
const NPM_API_URL = 'https://api.npmjs.org';

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

  public async getPackageInfo(pkg: string): Promise<Types.PackageInfo> {
    const response = await this.npmsRest.get(`/package/${pkg}`);
    return response.data;
  }

  public async getMultiplePackagesInfo(pkgs: string[]): Promise<Record<string, Types.PackageInfo>> {
    const response = await this.npmsRest.post('/package/mget', pkgs);
    return response.data;
  }

  public async getDownloadsInPeriodForPackage(pkg: string, period: Types.NpmDownloadPeriod): Promise<Types.NpmPackageDownloads> {
    const response = await this.npmRest.get(`/downloads/point/${period}/${pkg}`);
    return response.data;
  }
}
