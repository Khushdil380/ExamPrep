#!/usr/bin/env python3
"""Rebuild practice subject indexes from questions/<subject>/<chapter>/*.json."""

import json
import os
from pathlib import Path
import sys
import tempfile


ROOT = Path(__file__).resolve().parent.parent
QUESTIONS_DIR = ROOT / "questions"
MASTER_INDEX = QUESTIONS_DIR / "index.json"


def read_json(path):
    with path.open(encoding="utf-8-sig") as file:
        return json.load(file)


def read_order(item, position, label):
    order = item.get("order", position + 1)
    if type(order) is not int or order < 1:
        raise ValueError(f"{label} order must be a positive integer.")
    return order


def existing_names():
    subject_names = {}
    subject_order = {}
    chapter_names = {}
    chapter_order = {}
    categories_by_file = {}
    category_order = {}

    if not MASTER_INDEX.exists():
        return (
            subject_names,
            subject_order,
            chapter_names,
            chapter_order,
            categories_by_file,
            category_order,
        )

    master = read_json(MASTER_INDEX)
    subject_orders = set()
    for subject_position, subject in enumerate(master.get("subjects", [])):
        subject_id = subject.get("subjectId")
        if not subject_id:
            continue
        order = read_order(subject, subject_position, f"Subject '{subject_id}'")
        if order in subject_orders:
            raise ValueError(f"Duplicate subject order: {order}.")
        subject_orders.add(order)
        subject_names[subject_id] = subject.get("subjectName", subject_id)
        subject_order[subject_id] = order

        subject_index_path = ROOT / subject.get(
            "file", f"questions/{subject_id}/index.json"
        )
        if not subject_index_path.exists():
            continue

        subject_index = read_json(subject_index_path)
        chapter_orders = set()
        for chapter_position, chapter in enumerate(
            subject_index.get("chapters", subject.get("chapters", []))
        ):
            chapter_id = chapter.get("chapterId")
            if not chapter_id:
                continue
            order = read_order(
                chapter, chapter_position, f"Chapter '{chapter_id}'"
            )
            if order in chapter_orders:
                raise ValueError(
                    f"Duplicate chapter order {order} in subject '{subject_id}'."
                )
            chapter_orders.add(order)
            chapter_names[(subject_id, chapter_id)] = chapter.get(
                "chapterName", chapter_id
            )
            chapter_order[(subject_id, chapter_id)] = order
            category_orders = set()
            for category_position, category in enumerate(chapter.get("categories", [])):
                category_file = category.get("file")
                if category_file:
                    order = read_order(
                        category,
                        category_position,
                        f"Topic '{category.get('categoryId', category_file)}'",
                    )
                    if order in category_orders:
                        raise ValueError(
                            f"Duplicate topic order {order} in chapter '{chapter_id}'."
                        )
                    category_orders.add(order)
                    category_key = (
                        subject_id,
                        chapter_id,
                        Path(category_file).as_posix(),
                    )
                    categories_by_file[category_key] = (
                        category.get("categoryId", Path(category_file).stem),
                        category.get(
                            "categoryName",
                            category.get("categoryId", Path(category_file).stem),
                        ),
                    )
                    category_order[category_key] = order

    return (
        subject_names,
        subject_order,
        chapter_names,
        chapter_order,
        categories_by_file,
        category_order,
    )


def atomic_write_json(path, data):
    path.parent.mkdir(parents=True, exist_ok=True)
    temporary_path = None
    try:
        with tempfile.NamedTemporaryFile(
            "w", encoding="utf-8", newline="\n", dir=path.parent, delete=False
        ) as file:
            temporary_path = Path(file.name)
            json.dump(data, file, ensure_ascii=False, indent=2)
            file.write("\n")
        os.replace(temporary_path, path)
    finally:
        if temporary_path and temporary_path.exists():
            temporary_path.unlink()


def build_indexes():
    (
        subject_names,
        subject_order,
        chapter_names,
        chapter_order,
        categories_by_file,
        category_order,
    ) = existing_names()
    subjects = []
    subject_indexes = []
    errors = []
    seen_chapters = {}
    next_subject_order = max(subject_order.values(), default=0) + 1

    for subject_dir in sorted(
        (path for path in QUESTIONS_DIR.iterdir() if path.is_dir()),
        key=lambda path: (
            path.name not in subject_order,
            subject_order.get(path.name, 0),
            path.name.casefold(),
        ),
    ):
        subject_id = subject_dir.name
        direct_json_files = sorted(subject_dir.glob("*.json"))
        direct_json_files = [
            path for path in direct_json_files if path.name.casefold() != "index.json"
        ]
        if direct_json_files:
            errors.append(
                f"{subject_dir.relative_to(ROOT)} has question JSON files directly "
                "inside it. Put each file under a chapter folder."
            )

        chapters = []
        next_chapter_order = max(
            (
                order
                for (saved_subject_id, _), order in chapter_order.items()
                if saved_subject_id == subject_id
            ),
            default=0,
        ) + 1
        for chapter_dir in sorted(
            (path for path in subject_dir.iterdir() if path.is_dir()),
            key=lambda path: (
                (subject_id, path.name) not in chapter_order,
                chapter_order.get((subject_id, path.name), 0),
                path.name.casefold(),
            ),
        ):
            categories = []
            next_category_order = max(
                (
                    order
                    for (saved_subject_id, saved_chapter_id, _), order
                    in category_order.items()
                    if saved_subject_id == subject_id
                    and saved_chapter_id == chapter_dir.name
                ),
                default=0,
            ) + 1
            for question_file in sorted(
                chapter_dir.glob("*.json"),
                key=lambda path: (
                    (
                        subject_id,
                        chapter_dir.name,
                        path.relative_to(ROOT).as_posix(),
                    )
                    not in category_order,
                    category_order.get(
                        (
                            subject_id,
                            chapter_dir.name,
                            path.relative_to(ROOT).as_posix(),
                        ),
                        0,
                    ),
                    path.name.casefold(),
                ),
            ):
                if question_file.name.casefold() == "index.json":
                    errors.append(
                        f"{question_file.relative_to(ROOT)} is inside a chapter "
                        "folder. Keep index.json only in the subject folder."
                    )
                    continue
                try:
                    questions = read_json(question_file)
                except (OSError, json.JSONDecodeError) as error:
                    errors.append(
                        f"{question_file.relative_to(ROOT)} is not valid JSON: {error}"
                    )
                    continue
                if not isinstance(questions, list):
                    errors.append(
                        f"{question_file.relative_to(ROOT)} must contain a question array."
                    )
                    continue

                category_id = question_file.stem
                category_key = (
                    subject_id,
                    chapter_dir.name,
                    question_file.relative_to(ROOT).as_posix(),
                )
                saved_category = categories_by_file.get(
                    category_key,
                    (category_id, category_id),
                )
                order = category_order.get(category_key)
                if order is None:
                    order = next_category_order
                    next_category_order += 1
                categories.append(
                    {
                        "categoryId": saved_category[0],
                        "categoryName": saved_category[1],
                        "file": question_file.relative_to(ROOT).as_posix(),
                        "order": order,
                    }
                )

            if categories:
                chapter_id = chapter_dir.name
                previous_subject = seen_chapters.get(chapter_id)
                if previous_subject and previous_subject != subject_id:
                    errors.append(
                        f"Chapter ID '{chapter_id}' is used by both "
                        f"'{previous_subject}' and '{subject_id}'. Chapter IDs "
                        "must be unique across subjects."
                    )
                seen_chapters[chapter_id] = subject_id
                order = chapter_order.get((subject_id, chapter_id))
                if order is None:
                    order = next_chapter_order
                    next_chapter_order += 1
                chapters.append(
                    {
                        "chapterId": chapter_id,
                        "chapterName": chapter_names.get(
                            (subject_id, chapter_id), chapter_id
                        ),
                        "order": order,
                        "categories": categories,
                    }
                )

        if chapters:
            order = subject_order.get(subject_id)
            if order is None:
                order = next_subject_order
                next_subject_order += 1
            subjects.append(
                {
                    "subjectId": subject_id,
                    "subjectName": subject_names.get(subject_id, subject_id),
                    "file": f"questions/{subject_id}/index.json",
                    "order": order,
                }
            )
            subject_indexes.append(
                (
                    subject_dir / "index.json",
                    {"chapters": chapters},
                )
            )

    if errors:
        raise ValueError("\n".join(errors))

    master_index = {
        "_comment": "Master subject index. Each subject has its own index.json containing its chapters and topics.",
        "_howToAdd": "Create question files under questions/<subject>/<chapter>/. Run scripts/sync_question_indexes.py to update all indexes.",
        "subjects": subjects,
    }
    return master_index, subject_indexes


def main():
    try:
        master_index, subject_indexes = build_indexes()
    except (OSError, json.JSONDecodeError, ValueError) as error:
        print(f"Could not update question indexes:\n{error}", file=sys.stderr)
        return 1

    for path, index in subject_indexes:
        atomic_write_json(path, index)
    atomic_write_json(MASTER_INDEX, master_index)

    topic_count = sum(
        len(chapter["categories"])
        for _, index in subject_indexes
        for chapter in index["chapters"]
    )
    print(
        f"Updated question indexes: {len(subject_indexes)} subjects, "
        f"{sum(len(index['chapters']) for _, index in subject_indexes)} chapters, "
        f"{topic_count} topics."
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
