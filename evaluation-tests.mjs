import {prepareProfessionalPackets,validateProfessionalAnswer} from "./evaluation.mjs";
export function runEvaluationTests(dataset,registry) {
  const rows=[],config={modelSnapshot:"VALIDATION_ONLY",maxOutputTokens:1200,maxRequests:24,asOf:"2026-10-09"};
  const equal=(a,b)=>{if(JSON.stringify(a)!==JSON.stringify(b))throw Error(JSON.stringify({a,b}));};
  const error=(fn,code)=>{try{fn();throw Error("Expected rejection");}catch(e){equal(e.message,code);}};
  const test=(name,fn)=>{try{fn();rows.push({name,pass:true});}catch(e){rows.push({name,pass:false,error:e.message});}};
  const build=(d=dataset,c=config)=>prepareProfessionalPackets(d,registry,c);
  const clone=()=>JSON.parse(JSON.stringify(dataset));
  const answer=()=>({decision:"need_information",summary:"דרוש מידע נוסף לפני החלטה.",
    amountsCents:{},personalImpacts:"יש לבדוק את שני התיקים.",alternative:"להשאיר את המצב.",
    nextAction:"לבקש תנאים חתומים.",evidenceIds:[]});
  test("24 bounded requests with zero model calls",()=>{
    const b=build();equal(b.requests,24);equal(b.modelCalls,0);equal(b.cost,null);
  });
  test("paired models facts evidence and output limits match",()=>{
    const b=build();for(const c of dataset.cases){
      const pair=b.packets.filter(p=>p.caseId===c.id);equal(pair.length,2);
      equal(pair[0].messages[1],pair[1].messages[1]);
      equal(pair[0].modelSnapshot,pair[1].modelSnapshot);
      equal(pair[0].maxOutputTokens,pair[1].maxOutputTokens);
      equal(new Set(pair.map(p=>p.arm)).size,2);
    }
  });
  test("answer key not accepted as question field",()=>{
    const d=clone();d.cases[0].answerKey={decision:"stop"};
    error(()=>build(d),"INVALID_CASE");
  });
  test("dataset-level private metadata never enters packets",()=>{
    const d=clone();d.answerKey="PRIVATE_CANARY_DO_NOT_SEND";
    equal(JSON.stringify(build(d).packets).includes(d.answerKey),false);
  });
  test("duplicate cases rejected",()=>{
    const d=clone();d.cases[1].id=d.cases[0].id;error(()=>build(d),"INVALID_CASE");
  });
  test("real-data dataset rejected",()=>{
    const d=clone();d.synthetic=false;error(()=>build(d),"INVALID_DATASET");
  });
  test("unbounded model budget rejected",()=>{
    error(()=>build(dataset,{...config,maxRequests:25}),"EXPLICIT_BOUNDED_CONFIG_REQUIRED");
    error(()=>build(dataset,{...config,maxOutputTokens:2001}),"EXPLICIT_BOUNDED_CONFIG_REQUIRED");
  });
  test("expired evidence omitted from prompts",()=>{
    const b=build(dataset,{...config,asOf:"2026-11-08"});
    equal(b.packets.every(p=>JSON.parse(p.messages[1].content).evidence.accepted.length===0),true);
  });
  test("valid format is not professional approval",()=>{
    equal(validateProfessionalAnswer(answer(),build().packets[0]),
      {schemaValid:true,professionalCorrectness:"not_assessed"});
  });
  test("invented citations rejected",()=>{
    const a=answer();a.evidenceIds=["INVENTED"];
    error(()=>validateProfessionalAnswer(a,build().packets[0]),"UNSUPPORTED_CITATION");
  });
  test("fractional agorot rejected",()=>{
    const a=answer();a.amountsCents={saving:"1.5"};
    error(()=>validateProfessionalAnswer(a,build().packets[0]),"INVALID_AMOUNTS");
  });
  test("overlong summary rejected",()=>{
    const a=answer();a.summary=Array(81).fill("word").join(" ");
    error(()=>validateProfessionalAnswer(a,build().packets[0]),"SUMMARY_TOO_LONG");
  });
  test("unknown answer fields rejected",()=>{
    const a=answer();a.execute=true;
    error(()=>validateProfessionalAnswer(a,build().packets[0]),"INVALID_ANSWER_FIELDS");
  });
  return {suite:"evaluation-0.1",total:rows.length,passed:rows.filter(r=>r.pass).length,results:rows};
}
