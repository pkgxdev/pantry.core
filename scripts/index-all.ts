#!/usr/bin/env -S tea -E

/*---
args:
  - deno
  - run
  - --allow-net
  - --allow-run
  - --allow-read
  - --allow-write={{tea.prefix}}
  - --allow-env
  - --unstable
  - --allow-sys
---*/


import { SQSClient, SendMessageCommand } from "npm:@aws-sdk/client-sqs@^3"
import { panic } from "utils"
import yaml from 'npm:yaml';
// import fs from 'fs';

const sqsClient = new SQSClient({ region: Deno.env.get("AWS_REGION") ?? panic("No region specified") })


const sqsUrl = 'https://sqs.us-east-1.amazonaws.com/640264234305/generate-package-details.fifo';



const root = `/Users/neil/dev/tea/pantry.core/projects`;

async function index(pkg:string) {
  try {
    const pkgYamlPath = [root, pkg, 'package.yml'].join('/');
    const decoder = new TextDecoder("utf-8");
    const yamlRaw =  Deno.readFileSync(pkgYamlPath);
    const yml = yaml.parse(decoder.decode(yamlRaw));

    const project = pkg;

    const taskMessage = {
      project,
      github: getGithubRepo(yml?.versions?.github),
      // TODO: add other useable data here eventually
    }
    console.log(taskMessage);
    const res = await sqsClient.send(new SendMessageCommand({
      MessageGroupId: 'project',
      MessageDeduplicationId: project,
      MessageBody: JSON.stringify(taskMessage),
      QueueUrl: sqsUrl,
    }))
    console.log(res);
    //     console.log(`SQS task for pkg:${project} messageId:${res.MessageId}`)
    //   } catch (error) {
    //     console.error(error);
    //   }
  } catch (error) {
    console.error(error);
  }
}

const getGithubRepo = (gh?:string) => {
  if (gh) {
    const [maintainer, repo] = gh.split('/');
    return [maintainer, repo].join('/');
  } else {
    return '';
  }
}

async function getNames(currentPath: string): Promise<string[]> {
  const names: string[] = [];

  for await (const dirEntry of Deno.readDir(currentPath)) {
    const entryPath = `${currentPath}/${dirEntry.name}`;
    names.push(entryPath);

    if (dirEntry.isDirectory) {
      const nextNames = await getNames(entryPath);
      names.push(...nextNames);
    }
  }

  return names;
}

const dirRecursive = await getNames(root);
const yamls = dirRecursive
  .filter((p) => p.includes('package.yml'))
  .map((p) => {
    return p.replace('/package.yml', '').replace(`${root}/`, '')
  });

for(let pkg of yamls) {
  await index(pkg);
}