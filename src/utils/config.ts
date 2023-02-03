export type BaseConfig = {
  debug: string
  service_url: string
  webhook_port: number
  webhook_secret: string
  disabled_workflows: string[] | never[]
}

export const validateConfig = (config: BaseConfig) => {
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

  if (!Array.isArray(config.disabled_workflows)) {
    throw new TypeError('config.disabled_workflows must be an array.');
  }
};
