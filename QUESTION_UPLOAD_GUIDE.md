# ExamPrep mein questions add, edit aur remove karne ki guide

Is guide mein GitHub website se question files aur catalog update karne ke steps hain. Aapko JavaScript ya CSS likhne ki zaroorat nahi hai. GitHub par `main` branch mein changes commit karne ke baad GitHub Actions website ko automatically update karta hai.

## Pehle yeh samjhein: do tarah ke tests

- **Practice questions:** `questions/` folder ki JSON files. Inka subject, chapter aur topic `questions/index.json` mein listed hota hai.
- **Mock tests:** `mock-tests/` folder ki alag JSON files. Inka exam aur test `mock-tests/index.json` mein listed hota hai.

Practice topic ya mock test ko app mein dikhane ke liye uski JSON file ke saath sahi index file bhi update honi chahiye. GitHub par folder khud se add nahi hota: file banate waqt uska poora path likhne se folder bhi ban jata hai.

## GitHub par changes kaise karein

1. Repository kholen: [github.com/Khushdil380/ExamPrep](https://github.com/Khushdil380/ExamPrep).
2. Sahi file tak jaakar **Edit** (pencil) par click karein. Nayi file ke liye **Add file → Create new file** use karein. File computer par taiyar ho to **Add file → Upload files** use karein.
3. Changes ke baad neeche **Commit changes** karein. Aam taur par `main` branch par seedha commit karna theek hai.
4. Deployment dekhne ke liye repository ke **Actions** tab mein **Deploy ExamPrep to GitHub Pages** run dekhein. Successful hone par website kuch hi der mein update ho jayegi: [khushdil380.github.io/ExamPrep](https://khushdil380.github.io/ExamPrep/).
5. Website kholne ke baad refresh karein. Purana page khula ho to hard refresh bhi karein.

## 1. Maujooda topic mein questions add, edit, replace ya delete karna

Pehle topic ki file `questions/index.json` mein uske `file` path se dhoondhein. Misal ke liye Hindi ke विलोम शब्द questions yahan hain:

`questions/hindi/vilom-shabd/competitive.json`

Is case mein subject, chapter ya topic ka naam/path nahi badal raha ho to `questions/index.json` ko edit karne ki zaroorat nahi.

- **Questions add karna:** topic JSON file edit karein aur naye question objects array ke andar add karein. Har object ke beech comma ho; aakhri object ke baad comma na ho.
- **Ek question ka text, option ya answer sudharna:** usi object mein zaroori field badlein. Agar sawal ka matlab/pehchan badal gayi hai to naya unique `id` dein; sirf typo sudharne par purana ID rakh sakte hain.
- **Ek question replace karna:** purana object naye object se badlein. Bilkul naya sawal ho to naya unique `id` use karein.
- **Puri topic file replace karna:** file edit karke uska poora content naye valid JSON array se replace karein. Pehle purani file ka backup rakhna achha hai. Isse us topic ke purane saare questions hat jayenge.
- **Kuch questions delete karna:** jin question objects ko hatana hai unhein poora remove karein; bache hue objects ke darmiyan commas sahi karein.
- **Topic ke saare questions hatana, topic rakhte hue:** file ka content `[]` kar sakte hain. Is topic se test ke liye koi question nahi milega.

GitHub editor mein kisi question ko dhoondhne ke liye uska `id` search karein. Badi file mein galat object delete na ho, isliye commit se pehle aas-paas ka JSON aur commas zaroor check karein.

## 2. Naya topic add karna

1. Nayi practice file banayein. Path ka format:

   `questions/<subject-id>/<chapter-id>/<topic-id>.json`

   Misal: `questions/general-science/human-body/digestive-system.json`
2. File mein Section 5 wala question array rakhein.
3. `questions/index.json` kholen. Sahi subject aur chapter ke `chapters` / `categories` array mein yeh jaisi entry add karein:

   ```json
   {
     "categoryId": "digestive-system",
     "categoryName": "Digestive System",
     "file": "questions/general-science/human-body/digestive-system.json"
   }
   ```
4. Save/commit karke website refresh karein.

`file` path aur asli filename bilkul same hone chahiye. Index path mein forward slash `/` use karein. IDs chhoti, English, unique aur bina spaces ke rakhein; display names Hindi ya English mein ho sakte hain.

## 3. Naya chapter ya subject add karna

`questions/index.json` mein existing entries ko rehne dein; sirf sahi array mein nayi entry add karein:

- **Maujooda subject mein chapter:** us subject ke `chapters` array mein chapter object add karein. Uske andar `chapterId`, `chapterName`, aur `categories` array honi chahiye. `categories` mein upar jaisi topic entries hoti hain.
- **Maujooda chapter mein topic:** Section 2 wala category object us chapter ke `categories` array mein add karein.
- **Naya subject:** top-level `subjects` array mein subject object add karein. Uske andar `subjectId`, `subjectName`, aur `chapters` array rakhein. Chapter aur topic entries ka format is tarah hai:

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

JSON arrays mein do entries ke beech comma hota hai, lekin aakhri entry ke baad nahi. Sirf naya object add karein—poori `questions/index.json` ko example se replace na karein.

## 4. Topic, chapter ya subject remove/rename karna

Pehle decide karein ki questions ko baad mein dobara use karna hai ya hamesha ke liye hatana hai.

- **Topic ko list se hatana, questions sambhal kar rakhna:** `questions/index.json` se us topic ka poora category object remove karein, lekin uski JSON file na delete karein. App ab us file ko load nahi karega; baad mein topic entry dobara add karke wapas la sakte hain.
- **Topic aur uske questions hamesha ke liye delete karna:** pehle index se category object remove karein aur phir us topic ki JSON file delete karein. GitHub par file kholkar **Delete this file** use karein.
- **Chapter remove karna:** us chapter ka poora object `chapters` array se remove karein. Isse uske andar ke saare topics app ki list se hat jayenge. Agar questions nahi chahiye, to unki files bhi alag se delete karein.
- **Subject remove karna:** us subject ka poora object top-level `subjects` array se remove karein. Isse uske saare chapters/topics app se hat jayenge. Files ko rakhna ya delete karna aapki zaroorat par hai.
- **Sirf naam badalna:** object ka `subjectName`, `chapterName`, ya `categoryName` badlein; IDs aur file path na badlein. Isse maujooda questions wahi rahenge, sirf app mein dikhne wala naam badlega.
- **ID ya file path badalna:** sirf tab karein jab zaroori ho. Naya ID ya path rakhne par catalog references, file path, aur IDs ko aapas mein match karna hoga. Aasaan aur kam-risk tareeqa display name badalna hai.

Same `chapterId` ko alag subjects mein dobara use na karein; app chapters ko ID se pehchanta hai.

## 5. Practice question JSON format

Practice file ka poora content square brackets wala JSON **array** hona chahiye—kisi wrapper object mein nahi:

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

- `id`: har question ka unique ID rakhein—behtar hai poore project mein kisi doosre question ka ID na ho.
- `question`: sawal. Hindi Unicode text allowed hai.
- `options`: chaar alag options rakhein; IDs `A`, `B`, `C`, `D` rakhna aasaan hai.
- `correctAnswer`: sahi option ka ID, jaise `"B"`; option ka text nahi.
- `explanation`: optional hai, lekin answer review ke liye dena behtar hai.
- `difficulty`: `easy`, `medium`, ya `hard` use karein.
- `source`: optional. Source confirm na ho to kisi purane exam ka naam/year na likhein.

Ek file mein kai questions hon to har object ke beech comma rakhein, lekin aakhri object ke baad nahi. Ready template ke liye app mein **Settings → Sample JSON** ya repository ki `data/sample.json` file dekhein.

## 6. Mock test add, edit ya remove karna

Mock test practice category se alag hai. Ismein question array `questions` naam ki property ke andar hota hai.

- **Maujooda mock test edit/replace karna:** `mock-tests/index.json` se test ka `file` path dhoondhein, us JSON file ko edit karein, aur commit karein.
- **Naya mock test:** `mock-tests/<exam-id>/<test-id>.json` path par file banayein, phir `mock-tests/index.json` mein sahi exam ke `tests` array mein `testId`, `testName`, aur `file` ke saath entry add karein.
- **Naya exam:** pehle mock JSON file banayein, phir `mock-tests/index.json` ke `exams` array mein `examId`, `examName`, aur `tests` array wala object add karein.
- **Mock test ko list se temporarily hatana:** `mock-tests/index.json` se us test ki entry remove karein, file ko rakh sakte hain.
- **Mock test permanently hatana:** index se test entry aur uski JSON file dono delete karein. Exam mein koi test na bache to us exam ka object bhi remove kar sakte hain.
- **Naam badalna:** index aur mock file dono ke `examName` / `testName` update karein, taaki test par sahi naam dikhe.

Mock file ka example:

```json
{
  "examName": "General Science",
  "testName": "Mock Test 01",
  "durationMinutes": 60,
  "instructions": "60 questions | 60 minutes",
  "questions": [
    {
      "id": "gs-mock01-001",
      "question": "Sample question?",
      "options": [
        { "id": "A", "text": "Option A" },
        { "id": "B", "text": "Option B" },
        { "id": "C", "text": "Option C" },
        { "id": "D", "text": "Option D" }
      ],
      "correctAnswer": "A",
      "explanation": "Short explanation.",
      "difficulty": "easy"
    }
  ]
}
```

Mock file mein `durationMinutes` minute mein dein. Har question ka format practice question jaisa hi hai. **Sample JSON** practice topic ke liye hai, mock test ke liye nahi.

## 7. Commit ke baad test aur verify karein

1. GitHub commit successful hua ho aur changes `main` branch par hon.
2. Repository ke **Actions** tab mein latest **Deploy ExamPrep to GitHub Pages** run successful hone ka intezar karein.
3. [Live website](https://khushdil380.github.io/ExamPrep/) refresh karein. Practice ke liye Settings mein sahi subject/topic select karein; mock test ke liye sahi exam/test select karein.
4. Chhota test shuru karke sawal, chaar options, correct answer, explanation aur timer check karein.
5. Mixed topics ke sawal default **Shuffled** order mein aate hain. Catalog ke order mein chahiye tab **Sequential** chunein.

App pehle load hui files ko us page ke dauran cache kar sakta hai; changes dekhne ke liye page reload zaroor karein. Deploy fail ho to **Actions** mein error dekhein; run successful na ho to live site purani reh sakti hai.

## 8. Common problems

- **Subject/topic list mein nahi:** `questions/index.json` ke sahi `subjects` / `chapters` / `categories` array mein entry hai ya nahi dekhein.
- **Mock test list mein nahi:** `mock-tests/index.json` ke exam ke `tests` array mein test entry check karein.
- **Question file load nahi hui:** catalog ka `file` path, filename, `.json` extension aur valid JSON check karein.
- **Deploy failed:** GitHub ke **Actions** tab mein latest run kholkar error dekhein; failed deployment par site update nahi hogi.
- **Answer galat dikh raha hai:** `correctAnswer` kisi option ke `id` se bilkul match hona chahiye.
- **Combined practice test mein answers mix ho rahe hain:** duplicate question IDs dhoondhkar unique karein.
- **Chapter selection galat/mix ho rahi hai:** har chapter ka `chapterId` poore catalog mein unique rakhein.
- **JSON save nahi ho raha:** quotes double (`"`), commas sahi, aur aakhri item ke baad extra comma nahi hona chahiye. JSON validator se check karna madadgar hai.
- **Galti se file/entry delete ya replace ho gayi:** GitHub file ke **History** se purana version dekhein aur restore karne se pehle sahi file/index ko verify karein.
