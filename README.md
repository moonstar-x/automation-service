[![discord](https://img.shields.io/discord/730998659008823296.svg?label=&logo=discord&logoColor=ffffff&color=7389D8&labelColor=6A7EC2)](https://discord.gg/mhj3Zsv)
[![ci-build-status](https://img.shields.io/github/actions/workflow/status/moonstar-x/automation-service/push.yml?branch=master&logo=github)](https://github.com/moonstar-x/automation-service)
[![open-issues-count](https://img.shields.io/github/issues-raw/moonstar-x/automation-service?logo=github)](https://github.com/moonstar-x/automation-service)

# automation-service

A custom automation service to handle some notifications with a Workflow based design.

**This service isn't 100% generic and will contain workflow implementations that are meant just for me.**

> **Warning**
> If you wish to use this project for yourself, you may need to delete some (if not all) workflow implementations inside the `src/workflow/impl` folder and implement your own workflows. You can check [this](#making-a-workflow) to see how to make your own workflow.

## Requirements

* [Git](https://git-scm.com/)
* [Node.js](https://nodejs.org/en/)
* [Docker](https://www.docker.com/) (In case you need to build the Docker image)

## Installation

First, clone this repo:

```text
git clone https://github.com/moonstar-x/automation-service
```

And install the dependencies:

```text
npm install
```

You can then start the development service with:

```text
npm run dev
```

Or build and run it:

```text
npm run build
node ./build/index.js
```

## Docker Image

Unless you want to run the workflows I have defined (which are also present in this repo), using the public Docker image may not be the right choice.

You should instead make your own workflows inside the `src/impl` folder and build the Docker image yourself if you so need to run this through Docker.

In any case, when running a container for this, you should:

* Expose the port you've set inside the `config.webhook_port` config.
* Use a volume to `/opt/app/config` with your `config.yml` file inside.
* Use a volume to `/opt/app/data` to persist the data inside the Level database.

## Configuration

Inside the `config` folder you will find a `config.sample.yml` file. Copy this file and rename it to `config.yml` and change it according to your needs.

At a bare minimum, your config should look something like this:

* `config.debug` - Setting this to `true` will enable `DEBUG` logging.
* `config.service_url` - Set this to the publicly accessible URL for this service. This is necessary for certain things such as the `GitHubTrigger` which registers webhooks on repositories based on this value.
* `config.webhook_port` - Set this to the port you wish your service to be listening to.
* `config.webhook_secret` - Set this to a random secret of your choice to allow authenticated webhook calls.
* `config.disabled_workflows` - This is an array of workflow names that you wish to disable (for whatever reason).

### Adding Your Own Configuration

Adding your own configuration could help in case you need to implement your own workflows and need to *hide* a secret like an API key or token.

* First, make use of the `custom` field inside the `config.yml` file and add whatever you need to it there.
* You should then update the `CustomConfig` interface inside the `src/config/customTypes.ts` file accordingly.
* You're also free to set `CustomConfig` as `any` if you don't wish to have TypeScript support for your custom config.

## Making a Workflow

To make your own workflow, simply create a new file inside the `src/workflow/impl` folder (you may create this file in nested sub-folders as well) and export one (or many) class(es) that extend the `Workflow<T>` abstract class.

Workflows need to only have an instance of `Application` as their constructor parameters. If you need to further parametrize your workflow you should consider creating a base workflow class and only export subclasses that extend your base workflow with whatever parameters you need. If you need an example of this, check out [LeagueOfLegendsStatsWorkflow.ts](https://github.com/moonstar-x/automation-service/tree/master/src/workflow/impl/games/LeagueOfLegendsStatsWorkflow.ts).

Workflows are triggered by a `Trigger<T>` which can execute your workflow based on a specific event. There are some triggers already implemented for you to use, though you're free to implement your own. The generic in `Trigger<T>` refers to the type of the payload that the workflow will receive inside its `public run(payload: T): Promise<void>` method. This generic is also the same for `Workflow<T>`. Some triggers may not necessarily pass a payload to the workflow, in this case the generic should be `void`.

Once you have your workflow created, implement its `run()` method, which will execute your defined instructions based on the event triggered by the `Trigger<T>` used. You may also add additional logic to the `setup()` method which runs once when the workflow is registered in the application (you should still call `super.setup()`, otherwise you risk your workflow not initializing its trigger).

## Making a Trigger

If you need a more specialized trigger, you may implement your own class that extends `Trigger<T>`. This class should implement a `init()` method which should initialize the trigger and set when and how is the trigger going to emit its event. Typically, the event is triggered by running `this.emit('trigger', payload?: T)`.

## Using Twitter.ClientV1 (or Twitter.ClientV2)

The Twitter API requires users to authenticate through OAuth in case you need to make requests on a user's behalf. You can get away with using an application bearer token to access the V2 API without user context, but in case you need user context you should then use the corresponding oauth script:

```text
npx ts-node src/scripts/oauth/twitter/twitter-v1.ts
npx ts-node src/scripts/oauth/twitter/twitter-v2.ts
```

This requires you to have the following inside your `config.custom` config object:

```yml
twitter:
  api_key: string
  api_key_secret: string
  client_id: string
  client_secret: string
  bearer_token: string
  users:
    - my_account_handle
```

These scripts will start an HTTP server on the same port as `config.webhook_port` and create OAuth URLs for users to login with and will save any token inside the Level database which will be located inside the `data/level` folder.

> This script is super bare-bones, since I really didn't care that much for this because it is typically something that is run only once at the beginning.

## Data Persisting

Data persisting is done through a Level database which will be located inside the `data/level` folder. You're free to use this for whatever kind of data you need to persist. You can use the `levelDatabaseService` from the `src/services/LevelDatabaseService.ts` file.

## Filesystem Access

There is another service named `fileSystemService` from the `src/services/FileSystemService.ts` file which exposes a little service that serves files located inside the `data/fs` folder. This service allows you to *navigate* inside this folder without leaving outside it (you may access children directories but not anything above `data/fs`).
