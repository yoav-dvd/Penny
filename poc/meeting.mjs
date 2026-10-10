import {randomUUID} from 'node:crypto';
import {project,totals} from './model.mjs';
import {validDate} from './workbook.mjs';

export const CARD_TYPES = ['intake','upload','snapshot','tasks','considerations','followup','summary'];
export const TITLES = {intake:'נכיר את הצורך',upload:'המסמכים שיעזרו לנו',snapshot:'תמונת המצב',tasks:'הצעדים הבאים',considerations:'מה כדאי לבדוק',followup:'נשמור על קשר',summary:'סיכום הפגישה'};
export function meeting(state) {
  state.meeting ??= {id:randomUUID(),messages:[],artifacts:[],scope:null,goal:'',followup:null};
  return state.meeting;
}
function addMessage(m,role,text,extra={}) {
  const message={id:randomUUID(),role,text,at:new Date().toISOString(),...extra};
  m.messages.push(message);
  return message;
}
export function artifact(state,type) {
  if (!CARD_TYPES.includes(type)) throw new Error('סוג תוצר לא נתמך.');
  const m=meeting(state),view=project(state);
  const accounts=view.accounts.filter(a=>m.scope!=='person-a'&&m.scope!=='person-b'||a.fields.person_id.value===m.scope);
  const item={id:randomUUID(),type,title:TITLES[type],at:new Date().toISOString(),revision:state.revision,scope:m.scope,
    data:{accounts,total:totals(accounts),requests:view.requests,goal:m.goal,followup:m.followup}};
  if (type==='summary') item.data.titles=m.artifacts.map(a=>a.title);
  m.artifacts.push(item);
  return item;
}
function reply(state,text,type,engine='guided-demo') {
  const item=type?artifact(state,type):null;
  return addMessage(meeting(state),'assistant',text,{engine,artifactId:item?.id??null});
}
export function validateTurn(input) {
  if (!input || typeof input.text!=='string' || !input.text.trim() || input.text.length>3000) throw new Error('אפשר לשלוח הודעה של 1–3,000 תווים.');
  if (input.action && !['scope-self','scope-household','upload','snapshot','tasks','considerations','followup','summary'].includes(input.action)) throw new Error('הפעולה אינה נתמכת.');
  if (typeof input.requestId!=='string'||!/^[\w-]{8,80}$/.test(input.requestId)) throw new Error('מזהה הודעה חסר.');
}
export function guidedTurn(state,input) {
  validateTurn(input);
  const m=meeting(state);
  if(m.messages.some(x=>x.requestId===input.requestId))return {duplicate:true};
  if(m.messages.length>=200)throw new Error('הפגישה ארוכה. אפשר לשמור סיכום ולפתוח פגישה חדשה.');
  const text=input.text.trim();
  addMessage(m,'user',text,{requestId:input.requestId});
  if(!m.goal)m.goal=text;
  const action=input.action;
  if(action==='scope-self'||action==='scope-household') {
    m.scope=action==='scope-self'?'person-a':'household';
    return reply(state,'נתחיל ממה שכבר יש, בלי לבקש ממך למלא הכול מחדש. אראה לך איזה מסמך עוזר להבין כל חלק. אפשר לשמור מסמך אמיתי באופן מקומי; את הניתוח מדגימים כרגע על נתוני דוגמה בלבד.','upload');
  }
  if(action==='summary'||/סיכום|לסכם|נסיים/.test(text))return reply(state,'הכנתי סיכום קצר, עם מה שאספנו ומה שעדיין פתוח. הוא נשמר כאן, כדי שבפעם הבאה לא תצטרכי להתחיל מהתחלה.','summary');
  if(action==='followup'||/פגישה|תזכיר|תזכורת|קשר|עדכונים/.test(text))return reply(state,'אפשר לשמור מועד להמשך ולהוריד תזכורת ליומן. עדיין אין לי אפשרות לעקוב אחר השוק או לשלוח הודעות מחוץ לפגישה הזאת.','followup');
  if(action==='tasks'||/משימות|צעדים|מה לעשות/.test(text))return reply(state,'נרכז את החוסרים לרשימה שאפשר לפעול לפיה. אלו צעדי בירור, לא הוראות לשנות את החיסכון.','tasks');
  if(action==='considerations'||/המלצ|מסלול|להעביר|כדאי|הכי טוב/.test(text))return reply(state,'כדי להגיד מה מתאים לך, צריך לחבר את המטרות שלך למספרים ולתנאי המוצר. עוד אין כאן בדיקת התאמה מקצועית; אני יכולה להראות מה חסר לפני שנבחר כיוון.','considerations');
  if(action==='snapshot'||/תמונ|מצב|טבלה|גרף|כמה|דמי ניהול|עמלות/.test(text)) {
    if(!project(state).accounts.length)return reply(state,'אפשר להתחיל בזה. כדי להבין את היתרות ודמי הניהול צריך קודם מידע מהמסמכים. הנה דרך קצרה להתנסות בלי להשתמש במידע אישי.','upload');
    return reply(state,'הנה מה שעולה מהנתונים שנקלטו. אציג לכל אדם בנפרד וגם יחד, ואסמן מה חסר. זו תמונה חלקית של נתוני הניסוי, לא אישור שכל החסכונות נכללו.','snapshot');
  }
  if(action==='upload'||/קובץ|קבצים|אקסל|מסלקה|דוח|דוחות|תלוש/.test(text))return reply(state,'לא צריך לדעת מראש איזה שדה נמצא איפה. אפשר להתחיל במסמך אחד. כרגע אפשר לשמור מסמכים אמיתיים בתיק; קריאת התוכן שלהם עדיין לא מחוברת. את תמונת המצב אפשר להדגים על נתוני דוגמה.','upload');
  if(!m.scope)return reply(state,'נעים להכיר, אני פני. המטרה שלנו היא לצאת מהפגישה עם תמונה ברורה ועם הצעד הבא. קודם נדייק דבר אחד: נסתכל על החיסכון שלך בלבד, או גם על התמונה המשותפת של הבית?','intake');
  return reply(state,'אני במצב הדגמה מונחית, ולכן עדיין לא יכולה להבין כל שאלה חופשית. אפשר להתקדם עם המסמכים, לראות את תמונת המצב, או לשמור צעדים להמשך. כשיחובר מודל שיחה, נוכל לנהל כאן שיחה טבעית.','upload');
}
export function afterImport(state) {
  meeting(state).scope ??='household';
  return reply(state,'קיבלתי את קובץ הדוגמה. הנה התמונה הראשונית; בלחיצה על חשבון אפשר לבדוק את המקור ולתקן מידע עם הסבר. לא הסקתי מהנתונים האלה איזה מוצר מתאים לך.','snapshot');
}
export function saveFollowup(state,input) {
  const today=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Jerusalem',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
  if(!validDate(input.date)||input.date<today)throw new Error('בחרי תאריך תקין מהיום והלאה.');
  if(!['in-app','email-later'].includes(input.channel))throw new Error('בחרי דרך להמשך.');
  const m=meeting(state);
  m.followup={date:input.date,channel:input.channel,status:'planned-only'};
  return reply(state,'שמרתי את התאריך להמשך. אפשר להוריד תזכורת ולייבא אותה ליומן שלך. לא נשלחה הודעה ולא נוצרה פגישה ביומן באופן אוטומטי.','followup');
}
export function calendar(state) {
  const followup=meeting(state).followup;
  if(!followup)throw new Error('עדיין לא נשמר מועד להמשך.');
  const date=followup.date.replaceAll('-','');
  return ['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Penny//Meeting POC//HE','BEGIN:VEVENT',`UID:${meeting(state).id}-${date}@penny.local`,`DTSTAMP:${new Date().toISOString().replace(/[-:]/g,'').replace(/\.\d{3}/,'')}`,`DTSTART;VALUE=DATE:${date}`,'SUMMARY:פגישת המשך עם פני — ניסוי','DESCRIPTION:תזכורת אישית בלבד. לא נשלחת הודעה אוטומטית.','END:VEVENT','END:VCALENDAR',''].join('\r\n');
}
export function newMeeting(state) {
  state.archivedMeetings ??=[];
  if(state.meeting?.messages.length){if(state.archivedMeetings.length>=20)throw new Error('הגעת למגבלת פגישות הניסוי.');state.archivedMeetings.push(state.meeting);}
  delete state.meeting;
  return meeting(state);
}
export function publicMeeting(state,capabilities) {
  const m=state.meeting??{messages:[],artifacts:[],scope:null,goal:'',followup:null};
  return {...m,revision:state.revision,capabilities,archived:(state.archivedMeetings??[]).map(x=>({id:x.id,goal:x.goal,artifacts:x.artifacts,messages:x.messages}))};
}
