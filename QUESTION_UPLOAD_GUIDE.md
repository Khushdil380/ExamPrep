# Questions add karne ki aasaan guide

Is guide ka maksad hai ki aapka dhyan questions taiyar karne par rahe. Question files plain JSON data hain; JavaScript ya CSS code likhne ki zaroorat nahi hai. Naya subject, chapter, ya topic pehli baar add karte waqt us file ko app ke catalog mein ek baar register karna hota hai.

## 1. Sahi question template lein

1. ExamPrep ko local web server se kholen, jaise VS Code ka **Live Server**. `index.html` ko seedha `file://` se kholne par browser JSON files load nahi kar pata.
2. **Settings → Sample JSON** par click karein.
3. Download hui `sample-category.json` ki copy banakar topic ke naam se save karein, jaise `vilom-shabd.json`.

Yahi template project ke `data/sample.json` mein bhi rakha hai. Iska format app ke question loader ke saath match karta hai.

## 2. Jo topic pehle se app mein hai, usmein questions jodein

Agar subject, chapter aur topic Settings mein pehle se dikh rahe hain:

1. `questions/` ke andar us topic ki maujooda `.json` file kholen.
2. Naye question objects usi array mein jodein ya purane questions replace karein.
3. File save karke browser refresh karein.

Is case mein `questions/index.json` badalne ki zaroorat nahi hai. Udaharan ke liye, maujooda Hindi ke विलोम शब्द topic ki file hai:

`questions/hindi/vilom-shabd/competitive.json`

## 3. Naya subject, chapter ya topic pehli baar add karein

Browser computer ke folders ko khud scan nahi kar sakta. Isliye naye question file ko `questions/index.json` catalog mein ek baar register karna zaroori hai. Yeh JSON settings/data edit hai; JavaScript ya CSS code nahi.

### Question file kahan rakhein?

Yeh folder pattern use karein:

`questions/<subject-id>/<chapter-id>/<topic-id>.json`

Udaharan:

`questions/general-science/human-body/digestive-system.json`

Is file mein Section 4 wala question array rakhein.

### Catalog mein kya add karna hai?

`questions/index.json` kholen. Naye subject ke liye neeche wala object us file ke maujooda top-level `"subjects"` array ke andar ek item ke roop mein add karein. Example values ko apne subject/topic ke naam aur file path se badlein:

```json
{
  "subjectId": "general-science",
  "subjectName": "General Science",
  "chapters": [
    {
      "chapterId": "human-body",
      "chapterName": "Human Body",
      "categories": [
        {
          "categoryId": "digestive-system",
          "categoryName": "Digestive System",
          "file": "questions/general-science/human-body/digestive-system.json"
        }
      ]
    }
  ]
}
```

Purane subjects ko delete ya replace na karein. JSON mein do items ke beech comma lagta hai, lekin aakhri item ke baad comma nahi lagta.

- **Naya subject:** `"subjects"` array mein poora subject object add karein.
- **Maujooda subject mein naya chapter:** us subject ke `"chapters"` array mein chapter object add karein.
- **Maujooda chapter mein naya topic:** us chapter ke `"categories"` array mein category object add karein.

`file` ka path project folder ke relative aur actual filename se bilkul match hona chahiye. Is path mein `/` ka istemal karein.

### JSON catalog edit mein madad ke liye AI prompt

Catalog object khud type karna mushkil ho to yeh prompt use karein:

> Mere ExamPrep project ke `questions/index.json` ke liye sirf ek naya subject object banao. Subject name: ___. Subject ID: ___. Chapter name aur ID: ___. Topic name aur ID: ___. Question file path: `questions/.../.../....json`. Existing JSON format follow karo. Sirf valid JSON object do; purane subjects ko replace karne wala poora index mat do.

Object ko `"subjects"` array ke andar sahi jagah add karke save karein.

## 4. Ek question ka sahi format

Har topic file ka top-level content square brackets wala **array** hona chahiye. Har question mein alag `id`, question text, chaar options aur sahi option ka `correctAnswer` ho:

```json
[
  {
    "id": "gs-digestive-001",
    "question": "Which organ produces bile?",
    "options": [
      { "id": "A", "text": "Pancreas" },
      { "id": "B", "text": "Liver" },
      { "id": "C", "text": "Kidney" },
      { "id": "D", "text": "Stomach" }
    ],
    "correctAnswer": "B",
    "explanation": "The liver produces bile.",
    "difficulty": "easy",
    "source": "Exam name and year (optional)"
  }
]
```

- `id`: har question ka alag ID rakhein. Multiple subjects/topics ko ek test mein milane par bhi IDs unique honi chahiye.
- `question`: sawal. Hindi Unicode text allowed hai.
- `options`: chaar alag options; IDs ke liye `A`, `B`, `C`, `D` rakhna aasaan hai.
- `correctAnswer`: sahi option ka ID, jaise `"B"`; option ka text nahi.
- `explanation`: optional hai, lekin practice feedback aur answer review ke liye dena behtar hai.
- `difficulty`: `easy`, `medium`, ya `hard` use karein.
- `source`: optional. Jab tak source confirm na ho, question ko kisi purane exam ka question na batayein.

Ek file mein kai questions hon to har object ke beech comma rakhein, lekin aakhri object ke baad comma na lagayein. Practice question file ko kisi subject/chapter wrapper object mein na rakhein—sirf question array rakhein.

## 5. Save karne ke baad test karein

1. Question file aur, agar naya topic/subject hai, `questions/index.json` save karein.
2. Browser page refresh karein.
3. **Settings** kholkar naya subject aur chapter/topic dikh raha hai ya nahi dekhein.
4. Pehle chhota test shuru karke question, chaar options aur explanation check karein.
5. Multiple subject/topic select karne par default **Shuffled** order unke questions ko mix karta hai. Catalog ke order mein test dena ho tabhi **Sequential** chunein.

Page ko refresh karna zaroori hai, kyunki app pehle se load hui question file ko current page ke dauran cache kar sakta hai.

## 6. Mock test alag format mein hota hai

**Mock Tests** section ke liye file ka format practice category se alag hai: usmein `examName`, `testName`, `durationMinutes` aur `questions` array hote hain. Test ko `mock-tests/index.json` mein bhi register karna padta hai. **Sample JSON** button practice category ke liye hai, mock-test file ke liye nahi.

## Agar questions na dikh rahe hon

- Subject/topic list mein nahi: check karein ki naya entry `questions/index.json` ke sahi array mein add hua hai.
- File load nahi hui: `file` path, filename, `.json` extension aur valid JSON check karein.
- Galat answer dikh raha hai: `correctAnswer` kisi option ke `id` se bilkul match karna chahiye.
- Combined test mein answers mix ho rahe hain: har question ka `id` alag rakhein.
- Same naam ke chapters mix ho rahe hain: har chapter ka `chapterId` bhi alag rakhein, poore catalog mein.
