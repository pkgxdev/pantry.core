#!/usr/bin/env -S tea -E

/*---
args:
  - deno
  - run
  - --allow-run=tar
  - --allow-net
  - --allow-read
  - --allow-env
  - --unstable
  - --import-map={{ srcroot }}/import-map.json
---*/

import { S3 } from "s3"
import { pkg as pkgutils, run, TarballUnarchiver } from "utils"
import { useFlags, useOffLicense, useCache, usePrefix } from "hooks"
import { Package, PackageRequirement } from "types"
import SemVer, * as semver from "semver"
import { dirname, basename } from "deno/path/mod.ts"
import Path from "path"
import { set_output } from "./utils/gha.ts"
import { sha256 } from "./bottle.ts"

useFlags()

if (Deno.args.length === 0) throw new Error("no args supplied")

const s3 = new S3({
  accessKeyID: Deno.env.get("AWS_ACCESS_KEY_ID")!,
  secretKey: Deno.env.get("AWS_SECRET_ACCESS_KEY")!,
  region: "us-east-1",
})

const bucket = s3.getBucket(Deno.env.get("AWS_S3_BUCKET")!)
const encode = (() => { const e = new TextEncoder(); return e.encode.bind(e) })()
const cache = useCache()

const pkgs = args_get("pkgs").map(pkgutils.parse).map(assert_pkg)
const srcs = args_get("srcs")
const bottles = args_get("bottles")
const checksums = args_get("checksums")


function args_get(key: string): string[] {
  const it = Deno.args[Symbol.iterator]()
  while (true) {
    const { value, done } = it.next()
    if (done) throw new Error()
    if (value === `--${key}`) break
  }
  const rv: string[] = []
  while (true) {
    const { value, done } = it.next()
    if (done) return rv
    if (value.startsWith('--')) return rv
    rv.push(value)
  }
}

const rv: string[] = []
const put = async (key: string, body: string | Path | Uint8Array) => {
  console.log({ uploading: body, to: key })
  rv.push(`/${key}`)
  if (body instanceof Path) {
    body = await Deno.readFile(body.string)
  } else if (typeof body === "string") {
    body = encode(body)
  }
  return bucket.putObject(key, body)
}

for (const [index, pkg] of pkgs.entries()) {
  const bottle = new Path(bottles[index])
  const checksum = checksums[index]
  const stowed = cache.decode(bottle)!
  const key = useOffLicense('s3').key(stowed)
  const versions = await get_versions(key, pkg)

  //FIXME stream the bottle (at least) to S3
  await put(key, bottle)
  await put(`${key}.sha256sum`, `${checksum}  ${basename(key)}`)
  await put(`${dirname(key)}/versions.txt`, versions.join("\n"))
  // We store naked `tea` binaries for direct download as well.
  if (pkg.project == 'tea.xyz') await putTeaBin(pkg, key, bottle)

  // mirror the sources
  if (srcs[index] != "~") {
    const src = usePrefix().join(srcs[index])
    const srcKey = useOffLicense('s3').key({
      pkg: stowed.pkg,
      type: "src",
      extname: src.extname()
    })
    const srcChecksum = await sha256(src)
    const srcVersions = await get_versions(srcKey, pkg)
    await put(srcKey, src)
    await put(`${srcKey}.sha256sum`, `${srcChecksum}  ${basename(srcKey)}`)
    await put(`${dirname(srcKey)}/versions.txt`, srcVersions.join("\n"))
  }
}

await set_output('cf-invalidation-paths', rv)

//end

async function get_versions(key: string, pkg: Package): Promise<SemVer[]> {
  const prefix = dirname(key)
  const rsp = await bucket.listObjects({ prefix })

  //FIXME? API isn’t clear if these nulls indicate failure or not
  //NOTE if this is a new package then some empty results is expected
  const got = rsp
    ?.contents
    ?.compact(x => x.key)
    .map(x => basename(x))
    .filter(x => x.match(/v.*\.tar\.gz$/))
    .map(x => x.replace(/v(.*)\.tar\.gz/, "$1"))
    ?? []

  // have to add pkg.version as put and get are not atomic
  return [...new Set([...got, pkg.version.toString()])]
    .compact(semver.parse)
    .sort(semver.compare)
}

function assert_pkg(pkg: Package | PackageRequirement) {
  if ("version" in pkg) {
    return pkg
  } else {
    return {
      project: pkg.project,
      version: new SemVer(pkg.constraint)
    }
  }
}

async function putTeaBin(pkg: Package, key: string, bottle: Path) {
  const { verbosity } = useFlags()
  const dstdir = usePrefix()
  const cmd = new TarballUnarchiver({
    zipfile: bottle, dstdir, verbosity
  }).args()

  await run({ cmd, clearEnv: true })

  const bin = dstdir.join(`${pkg.project}/v${pkg.version}/bin/tea`)
  const s3Dest = key.replace(new RegExp(`\/v([0-9\.]+)\.tar\.(g|x)z$`), '/tea_v$1')
  return await put(s3Dest, bin)
}