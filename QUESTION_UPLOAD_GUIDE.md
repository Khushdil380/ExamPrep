# Questions add/update karne ka short guide

Saara kaam project folder ke andar karein. JSON templates app ke **Settings → Sample JSON** se download karein:

- **Practice / Subject** template: ek question array.
- **Mock Test** template: exam details + `questions` array.

## Practice subject/topic ke questions

### Pehle se maujood topic

`questions/index.json` mein us topic ka `file` path dekhein. Wahi JSON file kholkar questions add, edit, replace ya delete karein. Sirf questions badal rahe hain to index edit nahi karna.

### Naya topic

1. Is jagah folder/file banayein:

   `questions/<subject-id>/<chapter-id>/<topic-id>.json`

   Example: `questions/general-science/human-body/digestive-system.json`
2. Practice template ke questions is file mein rakhein.
3. `questions/index.json` mein sahi subject → chapter → `categories` ke andar entry add karein:

   ```json
   {
     "categoryId": "digestive-system",
     "categoryName": "Digestive System",
     "file": "questions/general-science/human-body/digestive-system.json"
   }
   ```

`categoryId` topic ki pehchan hai; `categoryName` app mein dikhne wala naam hai; `file` JSON file ka path hai. Naya chapter ho to us subject ke `chapters` array mein chapter add karein. Naya subject ho to top-level `subjects` array mein subject add karein—existing entries ko delete na karein.

## Mock test ke questions

### Pehle se maujood mock test

`mock-tests/index.json` mein test ka `file` path dekhein aur us JSON file ke `questions` update karein.

### Naya mock test

1. Exam ID ke naam ka folder banayein aur mock template ko is path par save karein:

   `mock-tests/<exam-id>/<test-id>.json`

   Example: `mock-tests/bihar-stet/mock-10.json`
2. JSON mein `examName`, `testName`, `durationMinutes`, `totalQuestions` aur questions bharein. `totalQuestions` ko questions ki ginti ke barabar rakhein.
3. `mock-tests/index.json` mein us exam ke `tests` array mein entry add karein:

   ```json
   {
     "testId": "stet-10",
     "testName": "Mock Test 10",
     "file": "mock-tests/bihar-stet/mock-10.json"
   }
   ```

`testId` test ki pehchan hai; `testName` app mein dikhne wala naam hai; `file` JSON ka path hai. Naya exam ho to `exams` array mein `examId`, `examName` aur `tests` wala exam object add karein.

## Naam, edit aur delete

- File ka naam/path badlein to uska `file` path index mein bhi badlein.
- App mein dikhne wala naam badalne ke liye `categoryName`, `testName` ya `examName` badlein.
- Topic/test ko list se hatane ke liye uski entry index se delete karein. JSON file bhi hatani ho to file alag se delete karein.
- Har question ka alag `id` rakhein. `correctAnswer` option ID (`A`, `B`, `C`, ya `D`) se match hona chahiye.
- JSON mein double quotes use karein; entries ke beech comma ho, aakhri entry ke baad nahi.

## Save karke live site update karein

CMD kholkar project folder mein jaayein:

```cmd
cd /d D:\StudyNotes\TestSeries
```

Changes save karne ke baad yeh command chalayein:

```cmd
git add -A && git commit -m "Update questions" && git push origin main
```

GitHub Actions deploy complete hone par site update ho jayegi: https://khushdil380.github.io/ExamPrep/
