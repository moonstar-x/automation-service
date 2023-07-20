import fs from 'fs';
import path from 'path';
import YAML from 'yaml';
import { CustomConfig } from './customTypes';

export interface BaseConfig {
  debug: boolean
  service_url: string
  webhook_port: number
  webhook_secret: string
  enable_twitter_trigger: boolean
  disabled_workflows: string[]
}

export interface Config extends BaseConfig {
  custom: CustomConfig
}

const validateBaseConfig = (config: BaseConfig) => {
  if (typeof config.debug !== 'boolean') {
    throw new TypeError('config.debug must be a boolean.');
  }

  if (typeof config.service_url !== 'string') {
    throw new TypeError('config.service_url must be a string.');
  }

  if (isNaN(config.webhook_port)) {
    throw new TypeError('config.webhook_port must be a number.');
  }

  if (typeof config.webhook_secret !== 'string') {
    throw new TypeError('config.webhook_secret must be a string.');
  }

  if (typeof config.enable_twitter_trigger !== 'boolean') {
    throw new TypeError('config.enable_twitter_trigger must be a boolean.');
  }

  if (!Array.isArray(config.disabled_workflows)) {
    throw new TypeError('config.disabled_workflows must be an array.');
  }
};

const loadConfig = (location: string): Config => {
  const content = fs.readFileSync(location, {
    encoding: 'utf-8'
  });

  const config: Config = YAML.parse(content);
  validateBaseConfig(config);

  return config;
};

export const config = loadConfig(path.join(process.cwd(), 'config', 'config.yml'));
