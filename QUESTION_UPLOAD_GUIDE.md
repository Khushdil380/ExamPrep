# Questions add/update karne ka short guide

## Practice subject/topic

Practice JSON template app ke **Settings → Sample JSON → Practice / Subject** se download karein.

### Naya subject

1. Subject ID se folder aur uske andar `index.json` banayein:

   `questions/<subject-id>/index.json`

2. Is subject ke chapters/topics isi index file mein add karein.
3. `questions/index.json` ke `"subjects"` array mein subject register karein:

   ```json
   {
     "subjectId": "general-science",
     "subjectName": "General Science",
     "file": "questions/general-science/index.json"
   }
   ```

`subjectId` folder ka naam aur ID hai; `subjectName` app mein dikhne wala naam; `file` subject index ka path hai.

### Naya chapter ya topic

1. Question file banayein:

   `questions/<subject-id>/<chapter-id>/<topic-id>.json`

   Example: `questions/general-science/human-body/digestive-system.json`
2. Practice template ka question array file mein rakhein.
3. `questions/<subject-id>/index.json` ke chapter ke `categories` array mein topic register karein:

   ```json
   {
     "categoryId": "digestive-system",
     "categoryName": "Digestive System",
     "file": "questions/general-science/human-body/digestive-system.json"
   }
   ```

Chapter nahi hai to subject index ke `"chapters"` array mein chapter add karein (`chapterId`, `chapterName`, `categories`). Naya chapter/topic usi subject ke `index.json` mein add hota hai—main `questions/index.json` mein nahi.

### Maujooda practice questions

Question add/edit/delete karne ke liye us topic ki JSON file badlein. Sirf question badal rahe hain to index files edit nahi karni. Naya topic ho to us topic ki entry subject index mein bhi add karni hogi.

## Mock test

Mock template ke liye **Settings → Sample JSON → Mock Test** chunein.

1. File banayein:

   `mock-tests/<exam-id>/<test-id>.json`

   Example: `mock-tests/bihar-stet/mock-10.json`
2. Mock template mein `examName`, `testName`, `durationMinutes`, `totalQuestions` aur questions bharein. `totalQuestions` question count ke barabar ho.
3. `mock-tests/index.json` mein exam ke `"tests"` array mein test add karein:

   ```json
   {
     "testId": "stet-10",
     "testName": "Mock Test 10",
     "file": "mock-tests/bihar-stet/mock-10.json"
   }
   ```

Naya exam ho to isi `mock-tests/index.json` ke `"exams"` array mein exam object add karein. Maujooda mock ke questions badalne par uski JSON file edit karein; naya test ho tabhi index update karein.

## Naam ya file hatana

- App mein dikhne wala naam badlein: `subjectName`, `chapterName`, `categoryName`, `examName` ya `testName` edit karein.
- File/folder path badlein: index mein uska `"file"` path bhi badlein.
- Subject ko app se hatayein: `questions/index.json` se subject entry delete karein.
- Chapter/topic ko hatayein: us subject ke `index.json` se entry delete karein.
- Mock test ko hatayein: `mock-tests/index.json` se test entry delete karein.
- JSON file bhi delete karni ho to Git se alag se remove karein.

Har question ka `id` alag rakhein; `correctAnswer` option ID (`A`, `B`, `C`, `D`) se match hona chahiye. JSON mein double quotes use karein aur aakhri item ke baad comma na lagayein.

## Changes live karna

CMD kholkar yeh commands chalayein:

```cmd
cd /d D:\StudyNotes\TestSeries
git add questions mock-tests && git commit -m "Update questions" && git push origin main
```

GitHub Actions deploy complete hone par site update ho jayegi: https://khushdil380.github.io/ExamPrep/
