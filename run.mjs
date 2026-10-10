// Run npm test. Prepare only: npm run benchmark:prepare -- MODEL_ID --as-of YYYY-MM-DD
import {readFile,mkdir,writeFile} from "node:fs/promises";
import {createHash} from "node:crypto";
import {spawnSync} from "node:child_process";
import {fileURLToPath} from "node:url";
import {runTests} from "./penny-tests.mjs";
import {runSourceTests} from "./source-tests.mjs";
import {runEvaluationTests} from "./evaluation-tests.mjs";
import {runTeamTests} from "./team-tests.mjs";
import {prepareRoleContext} from "./team-workflow.mjs";
import {prepareProfessionalPackets} from "./evaluation.mjs";
const json=async path=>JSON.parse(await readFile(new URL(path,import.meta.url),"utf8"));
const registry=await json("./sources/registry.json");
const dataset=await json("./evaluation/cases-v1.json");
const team=await json("./team/roles.json");
const teamExample=await json("./team/example-work-item.json");
const allTests=()=>{
  const suites=[runTests(),runSourceTests(registry),runEvaluationTests(dataset,registry),runTeamTests(team,teamExample)];
  return {release:"penny-engineering-0.3.0",qualification:"unqualified",
    total:suites.reduce((s,r)=>s+r.total,0),passed:suites.reduce((s,r)=>s+r.passed,0),suites};
};
const report=allTests();
if(process.argv.includes("--child")) {
  process.stdout.write(JSON.stringify(report));
  process.exit(report.passed===report.total?0:1);
}
const fresh=spawnSync(process.execPath,[fileURLToPath(import.meta.url),"--child"],{
  encoding:"utf8",timeout:30000
});
report.freshProcess={passed:fresh.status===0&&fresh.stdout===JSON.stringify(allTests()),
  exitCode:fresh.status};
const dir=new URL("./reports/",import.meta.url);
await mkdir(dir,{recursive:true});
await writeFile(new URL("tests.json",dir),JSON.stringify(report,null,2));
const files=["penny-core.mjs","penny-tests.mjs","penny-benchmark.mjs",
  "source-registry.mjs","source-tests.mjs","sources/registry.json",
  "evaluation.mjs","evaluation-tests.mjs","evaluation/cases-v1.json","run.mjs",
  "team-workflow.mjs","team-tests.mjs","team/roles.json","team/example-work-item.json"];
const hashes={};
for(const file of files) hashes[file]=createHash("sha256")
  .update(await readFile(new URL(file,import.meta.url))).digest("hex");
await writeFile(new URL("manifest.json",dir),JSON.stringify({
  release:report.release,createdAt:new Date().toISOString(),qualification:"unqualified",files:hashes
},null,2));
const i=process.argv.indexOf("--prepare");
if(i>=0) {
  const dateIndex=process.argv.indexOf("--as-of");
  if(dateIndex<0||!process.argv[dateIndex+1])throw Error("AS_OF_DATE_REQUIRED");
  const prepared=prepareProfessionalPackets(dataset,registry,{
    modelSnapshot:process.argv[i+1],asOf:process.argv[dateIndex+1],
    maxOutputTokens:1200,maxRequests:24
  });
  await writeFile(new URL("requests.json",dir),JSON.stringify(prepared,null,2));
  console.log(JSON.stringify({preparedRequests:prepared.requests,modelCalls:prepared.modelCalls}));
}
const teamIndex=process.argv.indexOf("--team");
if(teamIndex>=0){
  const context=prepareRoleContext(team,teamExample,process.argv[teamIndex+1]);
  await writeFile(new URL("team-context.json",dir),JSON.stringify(context,null,2));
  console.log(JSON.stringify({preparedRole:context.role.id,status:context.status,modelCalls:0}));
}
console.log(JSON.stringify(report,null,2));
if(report.passed!==report.total||!report.freshProcess.passed)process.exitCode=1;
