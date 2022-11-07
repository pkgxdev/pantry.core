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
  - --import-map={{ srcroot }}/import-map.json
env:
  TEA_PANTRY_PATH: "{{srcroot}}"
---*/

import { usePantry, useFlags, useCellar, useInventory } from "hooks"
import build from "./build/build.ts"
import { hydrate, install } from "prefab"
import * as ARGV from "./utils/args.ts"
import { panic } from "utils/error.ts"

useFlags()

const pantry = usePantry()
const cellar = useCellar()
const inventory = useInventory()
const dry = await ARGV.toArray(ARGV.pkgs())
const wet = await hydrate(dry, async (pkg, dry) => {
  const deps = await pantry.getDeps(pkg)
  return dry ? [...deps.build, ...deps.runtime] : deps.runtime
})

for (const pkg of wet.wet) {
  if (!await cellar.has(pkg)) {
    const version = await inventory.select(pkg) ?? panic()
    await install({ project: pkg.project, version })
  }
}

for (const rq of dry) {
  const pkg = await pantry.resolve(rq)
  await build(pkg)
}
