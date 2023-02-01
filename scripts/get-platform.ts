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

const platform = Deno.env.get("PLATFORM") ?? panic("$PLATFORM not set")

let container = "~"
let os = ""
let buildOs = ""

switch(platform) {
  case "darwin+x86-64":
    os = "macos-11"
    buildOs = "[self-hosted, macOS, X64]"
    break
  case "darwin+aarch64":
    os = "[self-hosted, macOS, ARM64]"
    buildOs = os
    break
  case "linux+aarch64":
    os = "[self-hosted, linux, ARM64]"
    buildOs = os
    break
  case "linux+x86-64":
    // FIXME: we'd like to build on a number of different outputs
    // [ubuntu, debian, ubuntu+infuser]
    os = "ubuntu-latest"
    buildOs = "[self-hosted, linux, X64]"
    container = "debian:buster-slim"
    break
  default:
    panic(`Invalid platform description: ${platform}`)
}

const output = `os=${os}\nbuild-os=${buildOs}\ncontainer=${container}\n`

Deno.stdout.write(new TextEncoder().encode(output))

if (Deno.env.get("GITHUB_OUTPUT")) {
  const envFile = Deno.env.get("GITHUB_OUTPUT")!
  await Deno.writeTextFile(envFile, output, { append: true})
}
