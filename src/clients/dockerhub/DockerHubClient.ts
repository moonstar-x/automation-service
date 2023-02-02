import axios, { AxiosInstance } from 'axios';
import * as Types from './types';

const API_URL = 'https://hub.docker.com/v2';

export class DockerHubClient {
  private rest: AxiosInstance;

  constructor() {
    this.rest = axios.create({
      baseURL: API_URL
    });
  }

  public async getRepoData(owner: string | null, image: string): Promise<Types.RepoData> {
    const repo = owner ? `${owner}/${image}` : `library/${image}`;
    
    const response = await this.rest.get(`/repositories/${repo}`);
    return response.data;
  }
}
