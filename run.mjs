// run.mjs | Run: node run.mjs
// Optional preparation only: node run.mjs --prepare MODEL_ID
import {readFile,mkdir,writeFile} from "node:fs/promises";
import {createHash} from "node:crypto";
import {spawnSync} from "node:child_process";
import {fileURLToPath} from "node:url";
import {runTests} from "./penny-tests.mjs";
import {prepareBenchmark} from "./penny-benchmark.mjs";
const dir=new URL("./reports/",import.meta.url);
const report=runTests();
if(process.argv.includes("--child")) {
  process.stdout.write(JSON.stringify(report));
  process.exit(report.passed===report.total?0:1);
}
// Fresh process proves the modules do not depend on the preceding conversation.
// This is software reproducibility, not statistical model reliability.
const fresh=spawnSync(process.execPath,[fileURLToPath(import.meta.url),"--child"],{encoding:"utf8",timeout:30000});
report.freshProcess={passed:fresh.status===0 &&
  fresh.stdout===JSON.stringify(runTests()),exitCode:fresh.status};
await mkdir(dir,{recursive:true});
await writeFile(new URL("tests.json",dir),JSON.stringify(report,null,2));
const files=["penny-core.mjs","penny-tests.mjs","penny-benchmark.mjs","run.mjs"];
const hashes={};
for(const file of files) hashes[file]=createHash("sha256")
  .update(await readFile(new URL(file,import.meta.url))).digest("hex");
await writeFile(new URL("manifest.json",dir),JSON.stringify({
  release:"penny-core-0.1.0",createdAt:new Date().toISOString(),
  qualification:"unqualified",files:hashes
},null,2));
const i=process.argv.indexOf("--prepare");
if(i>=0) {
  const prepared=prepareBenchmark({model:process.argv[i+1],maxOutputTokens:1200});
  await writeFile(new URL("requests.json",dir),JSON.stringify(prepared,null,2));
}
console.log(JSON.stringify(report,null,2));
if(report.passed!==report.total || !report.freshProcess.passed) process.exitCode=1;