#!/usr/bin/env tea

/*---
args:
  - deno
  - run
  - --allow-read
  - --allow-env
  - --allow-write
---*/

import { panic } from "utils";
import * as ARGV from "./utils/args.ts"

const platform = Deno.env.get("PLATFORM") ?? panic("$PLATFORM not set")

let rv: RV

switch(platform) {
  case "darwin+x86-64":
    rv = { os: "macos-11", container: "~" }
    break
    case "darwin+aarch64":
      rv = { os: "[self-hosted, macOS, ARM64]", container: "~" }
      break
      case "linux+aarch64":
        rv = { os: "[self-hosted, linux, ARM64]", container: "~" }
        break
        case "linux+x86-64":
    // FIXME: we'd like to build on a number of different outputs
    // [ubuntu, debian, ubuntu+infuser]
    rv = { os: await getLinuxSize(), container: "debian:buster-slim" }
    break
  default:
    panic(`Invalid platform description: ${platform}`)
}

const output = `os=${rv!.os}\ncontainer=${rv!.container}\n`

Deno.stdout.write(new TextEncoder().encode(output))

if (Deno.env.get("GITHUB_ENV")) {
  const envFile = Deno.env.get("GITHUB_ENV")!
  await Deno.writeTextFile(envFile, output, { append: true})
}

async function getLinuxSize(): Promise<string> {
  const exceptions: { [pkg: string]: number } = {
    "deno.land": 4,
    "ziglang.org": 8,
  }

  const pkgs = await ARGV.toArray(ARGV.pkgs())

  let coreSize = 2

  for (const pkg of pkgs) {
    coreSize = Math.max(exceptions[pkg.project] || 2, coreSize)
  }

  return imageName(coreSize)
}

function imageName(size: number) {
  switch (size) {
    case 0:
    case 1:
    case 2:
      return "ubuntu-latest"
    case 4:
    case 8:
    case 16:
      return `ubuntu-latest-${size}-cores`
    default:
      throw new Error("Invalid core size")
  }
}

interface RV {
  os: string
  container: string
}
