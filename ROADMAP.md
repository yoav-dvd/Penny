# Current product decision — Hebrew meeting with Penny

The founder's later direction replaces the dashboard entry point with a Hebrew, right-to-left meeting with Penny (פני). The user starts by typing or dictating. A conversation introduces relevant document requests, tables, visuals, next steps and summaries; a collapsible side inventory preserves the outputs. The trial label and limits must be visible. This authorizes the customer-facing Penny experience without restoring the retired development-agent team.

Current delivery: interface first; connect the conversational model afterward, as explicitly selected by the founder. The first actual user trial is intended to use real documents. Local receipt of PDF/XLSX/XML is implemented separately from extraction: a receipt is not an analysis. All repository fixtures and software tests remain synthetic. No real document content is sent to a model in this increment.

The new gates are: (1) founder review of the Hebrew meeting interface, (2) connect and evaluate one conversation model and voice input on the target browser, (3) validate extraction and reconciliation for the actual private document formats, (4) a supervised trial producing an evidence-backed current view, useful next steps, bounded recommendations and a saved return visit. A guided UI demo does not satisfy gates 2–4. Calendar download is available; proactive monitoring and external contact remain unimplemented.

The fee-comparison increment remains in the backlog after the conversation and intake foundations. No production launch or professional qualification is claimed.

# Earlier execution decision — 10 October 2026

The founder has directed a move to a working desktop POC with one development executor. Penny, Tanya and Shelly are no longer required agents or approval stages. Their reviewed evidence, product requirements and engineering decisions remain useful inputs, with their original limits intact. Historical material below is preserved and superseded where it conflicts with this decision.

Build now: a local synthetic-data desktop flow for two individually owned portfolios, Excel intake, source review, explicit missing/conflicting information, audited corrections, evidence-request tracking and saved return visits. External XML semantic research no longer blocks this bounded POC. This does not declare the previous broad M0 complete, turn research notes into verified business rules, or authorize real-data deployment or financial recommendations. No agent orchestration or paid model service is required. The next gate is a working, tested POC, followed by product feedback and a bounded professional-rule increment.

## Active delivery sequence

1. **Working evidence POC — implemented:** synthetic Excel intake, household/individual views, source cells, explicit conflicts, audited corrections, manual evidence requests and local persistence. See [run instructions](poc/README.md). Automated software checks and a browser walkthrough passed; founder usability acceptance is still pending.
2. **Decision POC — next:** connect one bounded, sourced fee comparison to the reviewed account data. Show individual and household effects, conditions, missing evidence and what would change the result. Accept only when exact arithmetic, blocked cases and a plain-language explanation pass the same scenarios. This is a scenario comparison before any suitability recommendation.
3. **Private pilot readiness:** validated real-format adapters, identity/consent, safe local data handling and an independently checked professional-rule scope. The unresolved XML and payroll work gates these specific features.
4. **Deployment:** only after the private pilot demonstrates a useful decision and return visit, with operational/security controls and the relevant professional requirements resolved.

# Penny — מפת הדרכים והתחייבות הפיילוט
עודכן: 10.10.2026. בעל האחריות הכוללת: מנהל הפרויקט.
מסמך זה הוא מקור העבודה המרכזי ליעד, להיקף, לסדר הביצוע ולסטטוס. מסמכי מחקר ותפקידים הם חומר תומך; שינוי בהם אינו משנה אוטומטית את התכנית.

## היעד
לבנות ולבחון מוצר דסקטופ לבית אב אחד, עם שני תיקים אישיים נפרדים, שמחבר מידע פנסיוני לתכנית פעולה מובנת, מנומקת ונשמרת.
המשתמשת תוכל להכניס מידע קיים, לאשר תמונת מצב, להבין מה כדאי לעשות ולמה, להבין עלות/תועלת/סיכונים וחוסרים, ולנהל את ההמשך בלי לנתח בעצמה פלט צ'אט או להרכיב תהליך מכלים שונים.
השירות מתמשך, השימוש לפי צורך. בדיקה חוזרת של נתונים ושינוי רלוונטי היא חלק מהפיילוט; ניטור אוטומטי רציף אינו יכולת קיימת.

## מה צריך להוכיח
ההשערה היא שהשילוב של נתונים עקיבים, כללים מקצועיים מאומתים, חישוב דטרמיניסטי, תוצאה מעשית והמשכיות נותן ערך מעבר לצ'אט כללי.
עדיין לא הוכחנו זאת. מספר הסוכנים, אורך הפרומפטים ומספר המבחנים אינם מדד הצלחה.
שלי מנהלת מוצר ומחקר; פני אחראית למקצוע; טניה לטכנולוגיה ולמתמטיקה; מנהל הפרויקט לתעדוף הביצוע, תלויות, בדיקה ושמירת הכיוון.
אין דרישה לשלושה סוכנים בכל בקשה. נשתמש בקוד, כללים או קריאת מודל יחידה היכן שהם מספיקים. ריבוי סוכנים דורש תרומה מדידה ביחס לעלות ולזמן.
אפיון קול, אישיות ודמות שירות נדחה; אין הנחה ששלי תהיה סוכנת השירות.

## המצב המאומת
ב-10.10.2026 נבדק PR #1: פתוח, לא מוזג, ראש 8f9ab67f8f90fbe8deecbd14034d5ad899c87e68 לפני הוספת מסמך זה.
קיימים חישובי עמלות מוגבלים ונתונים סינתטיים, רישום מקורות מצומצם, הכנת מקרי הערכה והגדרות תפקידים/העברות עבודה.
תוצאת CI מתועדת לאותו ראש: 78 בדיקות תוכנה; זו אינה הוכחת מומחיות או התאמה ללקוח.
אין ממשק לקוח פעיל, אחסון לקוחות והרשאות מלאים, השוואת איכות מודלים שבוצעה או ניטור פועל.
https://github.com/yoav-dvd/Penny/pull/1
https://github.com/yoav-dvd/Penny/actions/runs/37981104933

## גבולות הפיילוט
כלול: פנסיה תחילה; בעלות ושיוך אישיים לצד השפעה על בית האב; קליטת Excel ומסמכים בפורמטים מוגדרים; מקורות ותאריכים; תוצאה קצרה עם פירוט זמין; החלטות ופעולות שנשמרות; בדיקה חוזרת.
לא כלול כעת: מובייל, כלל תחומי הפיננסים, קול/דמות שירות, אינטגרציה לכל ספק, גישה אוטונומית לחשבונות או ביצוע עסקאות.
המלצה להשאיר מצב קיים היא תוצאה תקפה. כשחסר נתון מכריע, התוצאה היא בקשה ממוקדת והסבר, ולא ניחוש.
יש להעריך את כל ההשפעות המהותיות להחלטה הנתמכת. השפעה שטרם נבדקה מסומנת כחסם להמלצה, ולא כאפס. הפיילוט אינו מתיימר לכסות את כל ההחלטות הפנסיוניות.
נתוני לקוחות ותשובות מבחן חסויות אינם נשמרים במאגר הציבורי.

## אבני דרך וסדר ביצוע
### M0 — חוזה פיילוט ומקרי קבלה
אחריות: שלי; מנהל הפרויקט מכריע בהיקף. סטטוס: מסגרת מוגדרת כאן; מפרט בדיקה מפורט טרם הושלם.
תוצר: מסלול שימוש אחד מקצה לקצה, שדות/ראיות נדרשים, מצבים נתמכים ושאינם נתמכים, סדר עדיפויות ומקרי בדיקה סינתטיים.
תרחיש המועמד: בירור האפשרויות להסדרת הפקדות כשיש מוצר פנסיוני קודם. זהו מקרה סינתטי מוצע, לא פרסום מקרה לקוח או התחייבות להמלצה מסוימת.
שער מעבר: לכל תוצאה המוצר יודע להגדיר מה חייבים לדעת, מה חייבים לבדוק, מה מותר להציג ואיך מזהים כישלון. פני בודקת כיסוי מקצועי וטניה היתכנות; אישור מנהל הפרויקט מתועד.

### M1 — קליטה ותמונת מצב שאפשר לסמוך עליה
אחריות: טניה, עם אפיון ובדיקת שימושיות של שלי. תלוי ב-M0.
תוצר ראשון עובד: מסך דסקטופ בסיסי לקליטת קובץ סינתטי, שיוך לשני לקוחות, מקור ותאריך לכל שדה, זיהוי סתירות וחוסרים ואישור/תיקון פשוט.
שער מעבר: כל שדה שמשפיע על התרחיש עקיב לקלט, אין החלפה בין בעלים, והמשתמש יכול לתקן טעות בלי להבין פורמט טכני. פורמט לא נתמך נעצר בהסבר ברור.
לפני מידע אמיתי: גישה מאומתת, הרשאות לכל אדם ולניהול משותף, אחסון מתאים, מחיקה ופרטיות לוגים. עד אז משתמשים בנתונים סינתטיים בלבד.

### M2 — החלטה מקצועית שניתן לבדוק
אחריות: פני לכללים ולמקורות; טניה למימוש; בודק נפרד להערכה. תלוי ב-M0 ובנתונים המובנים של M1.
תוצר: כללים עם מקור/תחולה/תאריך, חישובים משוחזרים, הבחנה בין עובדות והנחות, השוואת חלופות וסיבות להמלצה/להישארות/לעצירה.
שער מעבר: כל מקרי הקבלה הקריטיים עוברים ללא שגיאה מהותית ידועה; מקרים חסרים וסתירות נעצרים נכון; תועלת לבית אב אינה מסתירה פגיעה באדם.
בודק מבוסס מודל יכול לסייע, אך אינו לבדו אישור מקצועי עצמאי. נדרשות ראיות חיצוניות ניתנות לאימות לתשובות ולחישובים; מחלוקת מקצועית לא פתורה נשארת חסם בתחום הרלוונטי.
נערכת השוואה לצ'אט בסיס על אותן ראיות ובתקציב מוגדר מראש, כולל נכונות, חוסרים, בהירות, עלות וזמן. אין טענת עליונות כללית ממדגם קטן. אם ריבוי סוכנים אינו מועיל, מפשטים אותו.

### M3 — חוויית מוצר והמשכיות
אחריות: שלי לקבלה מוצרית, טניה לביצוע; מנהל הפרויקט לאינטגרציה. נשען על M1; החלטות נתמכות דורשות M2.
תוצר: המשתמש מגיע לתוצאה, מבין את ההמלצה והחלופה העיקרית, שומר פעולה, מעדכן סטטוס וחוזר להמשך בלי להסביר מחדש.
תצוגת ההחלטה כוללת מה לעשות, למה, עלות/תועלת, סיכון מהותי, מה חסר והצעד הבא.
שער מעבר: במסלול שנבדק המשתמשת מבינה במילותיה את התוצאה ואת השלב הבא, ושומרת/מעדכנת פעולה ללא עזרה תפעולית מהמפתח. עזרה או הבנה שגויה מתועדות כליקוי.

### M4 — פיילוט מבוקר ובדיקה חוזרת
אחריות: מנהל הפרויקט להחלטת שחרור, שלי לניסוי; פני וטניה לסגירת ממצאים. תלוי ב-M1–M3 ובתנאי הנתונים האמיתיים.
תוצר: תהליך אמיתי אחד בשימוש, חזרה לתיק השמור ובדיקה של שינוי רלוונטי. ניתן להזריק שינוי סינתטי מסומן כדי לבדוק יוזמה כשאין שינוי אמיתי.
שער מעבר: התוצאה המקצועית נבדקה בתחום הנתמך; המשתמשת משלימה את התהליך; ההיסטוריה נשמרת; שינוי רלוונטי מוביל להסבר מה השתנה ומה נדרש, ושינוי שאינו רלוונטי אינו יוצר התראה מיותרת.
פיילוט מוצלח אינו שקול להסמכה, למוכנות לכל הציבור או לעליונות על כל יועץ.
בסיום: החלטת המשך מתועדת — הרחבה, תיקון ממוקד או עצירה של רכיב שלא הוכיח ערך. אחר כך מחברים מקורות נוספים ויוזמה אמיתית, ורק בהמשך תחומי פיננסים נוספים.

## מקרי קבלה שחייבים להיכלל במפרט
1. מידע מספיק: תוצאה מקצועית מנומקת וצעד מעשי.
2. חוסר מכריע: עצירה ובקשה ממוקדת; אין השלמת עובדות מומצאת.
3. הטבה לבית אב עם פגיעה באחד: תצוגה אישית ומשותפת והימנעות מהכרזה על שיפור כולל שאינו מוצדק.
4. מקור מיושן או שני מקורות סותרים: זיהוי וחסימה מתאימה.
5. ראיות תומכות בהשארת מצב קיים: אין דחיפה לשינוי.
6. חזרה עם נתון חדש: זיהוי שינוי, שמירת ההחלטה הקודמת ועדכון הפעולה, בלי להתחיל מאפס.
אלה מקרי קבלה ראשונים; בדיקות מקצועיות של התרחיש יפורטו ב-M0 ולא יוחלפו בשש דוגמאות בלבד.

## ניהול ההתקדמות
מנהל הפרויקט מחזיק את המפה; שלי מחזיקה את מפרט המוצר והעדויות; פני וטניה מחזיקות כללים ומימוש עם בדיקות.
לכל משימה: אבן דרך, תוצר, בעל אחריות, תלות, תנאי קבלה, ראיית בדיקה וסטטוס. סטטוסים: מתוכנן, בביצוע, לבדיקה, הושלם, חסום.
אין 'הושלם' על סמך הודעת סוכן בלבד. מסמך, דמו סינתטי, בדיקת תוכנה וניסוי אמיתי מסומנים בנפרד.
כל דיווח התקדמות מציין: מה הושלם מול תנאי הקבלה, מה עדיין לא הוכח, מה חוסם ומה יגיע בהמשך.
רעיון חדש נרשם ברשימת המשך. שינוי יעד/היקף דורש החלטה מפורשת והצגת ההשפעה על סדר הביצוע; שינוי בשיחה אינו גורר סיבוב פיתוח אוטומטי.
כרגע העבודה הפעילה היא M0, והתוצר ההנדסי הבא הוא M1. לא מפעילים מסלול מקביל של אישיות או 'הכשרה' פתוחה ללא מדד.
לא נקבע מועד מסירה ללא אומדן המבוסס על M0, זמינות ביצוע וגישה לכלים. אומדן מאמץ ותלויות הוא תוצר חובה בסיום M0, לפני התחייבות לספרינט.

## מה נדרש מהמייסד ומתי
כעת: אין צורך בנתון נוסף כדי להשלים M0 ולהתחיל M1 עם נתונים סינתטיים.
לפני פיילוט אמיתי: קובץ מקור וגישה/הסכמה מתאימה לשני התיקים דרך ערוץ פרטי.
לפני ריצות מודל בתשלום: בחירת תצורה והצגת תקרת עלות קונקרטית לאישור, אם אין הרשאה קיימת.
לפני ניסוי משתמש נוסף: משימה מוגדרת, מוצר/דמו שנבדק פנימית ומפגש קצר שהמשתמשת מסכימה לו.
לא מבקשים מהמייסד לבחור טכנולוגיה או לנהל את סדר המשימות במקום מנהל הפרויקט.

## החלטת צוות — ידע מקצועי וממשקי קלט לפני מידע פרטי (10.10.2026)
התקיים דיון דרישות בין פני, טניה ושלי, וסוכמו ההחלטות הבאות בידי מנהל הפרויקט. אין כאן הסמכה מקצועית או מפרט ממשקים שכבר אומת במלואו.

1. אין תלות בקובצי לקוחות כדי ללמוד את המקצוע, את מבנה הדיווח ואת דרישות ההחלטה. הקבצים האישיים ישמשו בהמשך לבדיקת וריאנט ולהתאמה למקרה, לא כתחליף לידע מוקדם.
2. M0 כולל מפת עבודה מקצועית: בירור צרכים, מיפוי מוצרים ומצב קיים, ביקורת נתונים, בחינת חלופות וסיכונים, הנמקה, ביצוע מורשה ומעקב. היקף מימוש הפיילוט ייבחר מתוך המפה; עצם המיפוי אינו מחייב לממש הכול.
3. פני אחראית לטבלת החלטה–מידע: עבור כל החלטה נתמכת, אילו נתונים ומסמכים נדרשים, מדוע, כיצד מאמתים, ומה חוסם. השוואת עלות מוגבלת וניוד אינם דורשים בהכרח אותו מידע.
4. טניה אחראית לקטלוג ממשקים וגרסאות, מילון שדות וסכמות מאומתות ודוגמאות בדיקה רשמיות/סינתטיות. XML הוא פורמט; יש לזהות תוכן, סוג ממשק וגרסה. אין לבנות קורא אוניברסלי או להניח שכל XML מכיל אחזקות.
5. שלי אחראית למסלול שבו המשתמש מביא את החומר הקיים ואינו נדרש להבין פורמטים או להקליד מחדש מידע שאומת. Excel אישי דורש מיפוי; אין לו מבנה קבוע שאפשר לדעת מראש.
6. M1 מציג בנפרד תקינות קליטה וכיסוי מידע להחלטה. כל שדה שומר מקור, מיקום, יחידה, בעלים ומועד תקפות. אפס מדווח, חסר, לא ידוע ולא רלוונטי אינם אותה משמעות. סתירה לא נפתרת רק לפי סוג הקובץ.
7. תוקף הטבת בית אב ומנגנון חישובה דורשים אסמכתה לתנאים. אין להסיק מהצבירה המשותפת שהטבה כזו קיימת, ואין להניח שקובץ אחזקות מכיל הצעות מסחריות עתידיות.
8. קריאת קבצים, חיבור מורשה לקבלת מידע וחיבור לביצוע פעולות הם שלוש יכולות שונות. בפיילוט מתחילים בקליטה וניתוח; לא מובטחת גישה ישירה למערכות מוסדיות.
9. דיון צוות מתקיים בהחלטות חוצות תחומים ובשערי מעבר. כל משתתף מספק עמדה, ראיות, הסתייגות והשלכת יישום; מנהל הפרויקט מכריע ושומר את ההחלטה. אין צורך בכינוס כל הסוכנים לכל תיקון קטן.
10. פני היא תפקיד מקצועי בבנייה; שמה, הגדרתה ותשובתה בדיון אינם הוכחת מומחיות. ביקורת בין סוכנים אינה לבדה אימות מקצועי עצמאי. החזון נשאר שירות ללקוח קצה; המגבלות הנוכחיות אינן שינוי סמוי למוצר שמיועד רק לאנשי מקצוע.

תוצרי M0 הנדרשים להשלמת סעיף זה: מפת תהליך מקצועית; טבלת החלטה–מידע; קטלוג קלט ומילון נתונים; דוגמאות סינתטיות עם תוצאות צפויות; מפרט חוסרים/סתירות ומבחני קבלה. הם מתוכננים, לא מוצגים כהושלמו.

מקורות שאותרו למחקר:
- קטלוג קבצי הדיווח של רשות שוק ההון: https://www.gov.il/he/Departments/DynamicCollectors/gufimmosadiimfiles
- חוזר מבנה אחיד 2026-9-3: https://www.gov.il/BlobFolder/dynamiccollectorresultitem/regulation-legislation26326/he/uniform_protocol_update_26.3.2026%20%5BPDF%5D.pdf
- הסבר ממשלתי לדוח פנסיה: https://haotzarsheli.mof.gov.il/Calculators/Pages/Pension-Fund-Report-Popup.aspx

מגבלת המחקר: חלק מהמידע נקרא מתוך אינדקס החיפוש של המקורות הרשמיים; הגישה הישירה למסמכי הרשות נחסמה. טרם נפתח ואומת XSD. אין להשתמש במועדי תחילה או בשדות מסוימים כדרישת מימוש סופית לפני אימות המסמך המלא וגרסתו. קובצי לקוח לא נבדקו ולא פורסמו.
