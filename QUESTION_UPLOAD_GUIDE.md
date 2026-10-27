# Questions add/update karne ka simple tareeqa

## Practice questions

1. App ke **Settings → Sample JSON → Practice / Subject** se template download karein.
2. Naya subject ho to `questions` ke andar subject ID ka folder banayein. Naya chapter ho to subject folder ke andar chapter ID ka folder banayein.
3. Topic ki JSON file chapter folder mein rakhein:

   `questions/<subject-id>/<chapter-id>/<category-id>.json`

   Example: `questions/general-science/human-body/digestive-system.json`
4. Script chalayen:

   ```cmd
   python scripts\sync_question_indexes.py
   ```

Script folders aur JSON filenames se main aur subject indexes khud update karegi. `subject-id`, `chapter-id`, aur JSON filename ka naam default roop se app mein dikhne wala naam hoga. Naam alag chahiye to script ke baad index mein `subjectName`, `chapterName`, ya `categoryName` badal dein; dobara script chalane par yeh naam preserve rahenge.

Existing topic ke questions badalne par wahi JSON file edit karein. Naya topic add karne par nayi JSON file rakhein aur script chalayen. Kisi topic ki JSON file delete karne par script uski index entry bhi hata degi.

Website shuru mein sirf ek random subject ke questions load karti hai; baaki subject indexes tab load hote hain jab aap Settings mein unhe select karte hain. Selected question files parallel load aur cache hote hain, isliye dobara use karne par phir se download nahi hote. Upload karne ka tareeqa badalne ki zaroorat nahi hai.

## Mock tests

Mock test ke liye **Settings → Sample JSON → Mock Test** template use karein. File yahan banayein:

`mock-tests/<exam-id>/<test-id>.json`

Naye mock test ya exam ko `mock-tests/index.json` mein manually register karna hota hai. Practice index script mock-test index ko nahi badalti.

## Changes live karna

CMD mein project folder kholkar script aur publish commands chalayein:

```cmd
cd /d D:\StudyNotes\TestSeries
python scripts\sync_question_indexes.py
git add questions mock-tests && git commit -m "Update questions" && git push origin main
```

Har question ka unique `id` rakhein. JSON mein `correctAnswer` option ID (`A`, `B`, `C`, `D`) se match hona chahiye. GitHub Actions deploy ke baad site update hogi: https://khushdil380.github.io/ExamPrep/
