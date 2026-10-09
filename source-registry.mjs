// source-registry.mjs — bounded retrieval of reviewed claims, never whole documents.
// This checks editorial records. It does not independently verify source truth.
const demand = (condition, code) => { if (!condition) throw new Error(code); };
const isoDate = value => {
  demand(typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value), "INVALID_DATE");
  const d=new Date(value+"T00:00:00Z");
  demand(Number.isFinite(d.getTime()) && d.toISOString().slice(0,10)===value,"INVALID_DATE");
  return value;
};
export function validateRegistry(registry) {
  demand(registry?.schemaVersion===1 && typeof registry.version==="string" &&
    registry.version.length>0 && Array.isArray(registry.sources),"INVALID_REGISTRY");
  const ids=new Set();
  for(const s of registry.sources) {
    demand(typeof s.id==="string" && s.id.length>0 && !ids.has(s.id),"DUPLICATE_SOURCE");
    ids.add(s.id);
    demand(typeof s.url==="string" && /^https:\/\//.test(s.url) &&
      typeof s.title==="string" && typeof s.publisher==="string" &&
      typeof s.jurisdiction==="string" && s.verification?.locator &&
      ["content_verified","quarantined","unavailable"].includes(s.status) &&
      Array.isArray(s.claims) && Array.isArray(s.limitations),"INVALID_SOURCE");
    isoDate(s.verifiedAt);
    if(s.status==="content_verified") {
      demand(isoDate(s.reviewDue)>s.verifiedAt && s.claims.length>0,"INVALID_REVIEW_WINDOW");
      demand(s.verification.method==="full_page_read","FULL_REVIEW_REQUIRED");
    } else demand(s.claims.length===0,"UNAPPROVED_CLAIMS");
    const claimIds=new Set();
    for(const c of s.claims) {
      demand(typeof c.id==="string" && c.id.length>0 && !claimIds.has(c.id) &&
        typeof c.text==="string" && c.text.length>0 &&
        Array.isArray(c.allowedUses) && c.allowedUses.length>0 &&
        c.allowedUses.every(u=>["data_definition","general_math"].includes(u)),
        "INVALID_CLAIM");
      claimIds.add(c.id);
    }
  }
  return true;
}
export function resolveEvidence(registry, requests, options) {
  validateRegistry(registry);
  const asOf=isoDate(options?.asOf);
  demand(typeof options?.jurisdiction==="string" && Array.isArray(requests),"INVALID_REQUEST");
  const accepted=[],rejected=[];
  const seen=new Set();
  for(const r of requests) {
    demand(r && typeof r.sourceId==="string" && typeof r.claimId==="string" &&
      typeof r.use==="string","INVALID_REQUEST");
    const key=JSON.stringify([r.sourceId,r.claimId,r.use]);
    if(seen.has(key)) continue;
    seen.add(key);
    const source=registry.sources.find(s=>s.id===r.sourceId);
    let reason=null,claim;
    if(!source) reason="UNKNOWN_SOURCE";
    else if(source.status!=="content_verified") reason="SOURCE_NOT_USABLE";
    else if(source.verifiedAt>asOf) reason="SOURCE_NOT_YET_REVIEWED";
    else if(asOf>=source.reviewDue) reason="SOURCE_REVIEW_DUE";
    else if(!(claim=source.claims.find(c=>c.id===r.claimId))) reason="UNKNOWN_CLAIM";
    else if(!claim.allowedUses.includes(r.use)) reason="USE_NOT_SUPPORTED";
    else if(source.jurisdiction!==options.jurisdiction &&
      !(source.jurisdiction==="GENERAL" && r.use==="general_math"))
      reason="JURISDICTION_MISMATCH";
    if(reason) rejected.push({sourceId:r.sourceId,claimId:r.claimId,reason,
      status:source?.status??"unknown",reviewNotes:source?[...source.limitations]:[]});
    else accepted.push({
      sourceId:source.id,claimId:claim.id,text:claim.text,use:r.use,
      title:source.title,url:source.url,publisher:source.publisher,
      verifiedAt:source.verifiedAt,reviewDue:source.reviewDue,
      locator:source.verification.locator,limitations:[...source.limitations]
    });
  }
  return {registryVersion:registry.version,asOf,status:rejected.length?"needs_review":"ready",
    accepted,rejected};
}
