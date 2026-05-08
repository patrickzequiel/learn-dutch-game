#!/usr/bin/env python3
"""
Refresh src/data/agenda.json from the teacher's Google Docs agenda.

Runs every Friday via GitHub Actions. Reads the agenda doc, calls Claude to
parse any changes, then writes the updated JSON — preserving homework done-states.

Required environment variables:
  GOOGLE_SERVICE_ACCOUNT_KEY  — JSON string of a Google service account key
  ANTHROPIC_API_KEY           — Anthropic API key
"""

import json
import os
import re
import sys
from datetime import date
from pathlib import Path

import anthropic
from google.oauth2 import service_account
from googleapiclient.discovery import build

AGENDA_DOC_ID = "17T82cnJedobIDPOjl21nGT4CLDzyZf9m3nbBPiD5KR0"
AGENDA_JSON = Path("src/data/agenda.json")
SCOPES = [
    "https://www.googleapis.com/auth/documents.readonly",
    "https://www.googleapis.com/auth/drive.readonly",
]


def get_credentials():
    raw = os.environ.get("GOOGLE_SERVICE_ACCOUNT_KEY", "")
    if not raw:
        print("ERROR: GOOGLE_SERVICE_ACCOUNT_KEY not set", file=sys.stderr)
        sys.exit(1)
    key_data = json.loads(raw)
    return service_account.Credentials.from_service_account_info(key_data, scopes=SCOPES)


def export_doc_text(doc_id: str, creds) -> str:
    drive = build("drive", "v3", credentials=creds)
    data = drive.files().export(fileId=doc_id, mimeType="text/plain").execute()
    return data.decode("utf-8")


def load_agenda() -> dict:
    return json.loads(AGENDA_JSON.read_text(encoding="utf-8"))


def preserve_done_states(new_agenda: dict, old_agenda: dict) -> dict:
    """Copy homework done=true from old agenda into new one by hw id."""
    done_ids: set[str] = set()

    for lesson in old_agenda.get("lessons", []):
        for hw in lesson.get("homework", []):
            if isinstance(hw, dict) and hw.get("done"):
                done_ids.add(hw["id"])

    for hw in old_agenda.get("nextLesson", {}).get("homework", []):
        if isinstance(hw, dict) and hw.get("done"):
            done_ids.add(hw["id"])

    for lesson in new_agenda.get("lessons", []):
        for hw in lesson.get("homework", []):
            if isinstance(hw, dict) and hw["id"] in done_ids:
                hw["done"] = True

    for hw in new_agenda.get("nextLesson", {}).get("homework", []):
        if isinstance(hw, dict) and hw["id"] in done_ids:
            hw["done"] = True

    return new_agenda


def refresh_with_claude(doc_text: str, current_agenda: dict) -> dict:
    client = anthropic.Anthropic()
    today = date.today().isoformat()
    current_json = json.dumps(current_agenda, ensure_ascii=False, indent=2)

    system = (
        "You are a data-transformation assistant. "
        "You receive a Dutch language course agenda document and an existing JSON file. "
        "You output ONLY valid JSON — no markdown, no explanation, no code fences."
    )

    user = f"""Update the agenda JSON based on the latest teacher agenda document.

TODAY: {today}

CURRENT agenda.json:
{current_json}

TEACHER'S AGENDA DOCUMENT (plain text export):
{doc_text}

RULES:
1. Set `lastUpdated` to "{today}".
2. Set `currentLesson` to the highest lesson number whose date is on or before today.
3. Find the next lesson after today and set `nextLesson` with:
   - number, date (ISO), dateDisplay, homework (array of objects with id/description/type/done).
   - If there is a "GEEN LES" or cancelled class notice before the next class, set `noClassBefore`.
4. Update the `lessons` array: add/update homework for any lesson that has new or corrected homework in the doc.
   - Homework in `lessons[].homework` stays as plain strings (existing format).
5. Preserve ALL other existing fields exactly.
6. Do NOT reset any `done` flags — they will be restored separately.
7. Return the complete updated agenda.json object."""

    message = client.messages.create(
        model="claude-opus-4-7",
        max_tokens=8192,
        system=[
            {
                "type": "text",
                "text": system,
                "cache_control": {"type": "ephemeral"},
            }
        ],
        messages=[{"role": "user", "content": user}],
    )

    response = message.content[0].text.strip()
    # Strip markdown code fences if model adds them despite instructions
    response = re.sub(r"^```(?:json)?\n?", "", response)
    response = re.sub(r"\n?```$", "", response)

    return json.loads(response)


def main():
    print(f"[{date.today()}] Starting agenda refresh...")

    print("Authenticating with Google...")
    creds = get_credentials()

    print(f"Exporting doc {AGENDA_DOC_ID}...")
    doc_text = export_doc_text(AGENDA_DOC_ID, creds)
    print(f"  Got {len(doc_text):,} characters.")

    print("Loading current agenda.json...")
    current = load_agenda()

    print("Calling Claude to parse updates...")
    updated = refresh_with_claude(doc_text, current)

    print("Restoring homework done-states...")
    updated = preserve_done_states(updated, current)

    print("Writing src/data/agenda.json...")
    AGENDA_JSON.write_text(
        json.dumps(updated, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )

    print("Done.")


if __name__ == "__main__":
    main()
