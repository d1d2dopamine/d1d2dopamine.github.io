#!/usr/bin/env python3
"""Refresh public GitHub activity, commit times, releases, and optional Now text."""
from __future__ import annotations

import json
import os
import sys
import urllib.error
import urllib.parse
import urllib.request
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA_PATH = ROOT / "data" / "site-data.json"
USERNAME = os.environ.get("GITHUB_USERNAME", "d1d2dopamine")
TOKEN = os.environ.get("GH_TOKEN", "")
API_ROOT = "https:" + "//api.github.com"


def request_json(url: str):
    headers = {
        "Accept": "application/vnd.github+json",
        "User-Agent": "d1d2dopamine-site-refresh",
        "X-GitHub-Api-Version": "2022-11-28",
    }
    if TOKEN:
        headers["Authorization"] = f"Bearer {TOKEN}"
    request = urllib.request.Request(url, headers=headers)
    with urllib.request.urlopen(request, timeout=25) as response:
        return json.load(response)


def latest_release(full_name: str):
    try:
        release = request_json(f"{API_ROOT}/repos/{full_name}/releases/latest")
        return {"name": release["tag_name"], "url": release["html_url"]}
    except urllib.error.HTTPError as error:
        if error.code == 404:
            return None
        raise


def latest_commit(full_name: str, default_branch: str):
    """Return the latest commit on the repository's default branch."""
    branch = urllib.parse.quote(default_branch, safe="")
    try:
        item = request_json(f"{API_ROOT}/repos/{full_name}/commits/{branch}")
    except urllib.error.HTTPError as error:
        # Empty repositories and repositories whose commits are unavailable
        # should not prevent all other activity from being refreshed.
        if error.code in (404, 409, 422):
            return None
        raise

    commit = item.get("commit") or {}
    committer = (commit.get("committer") or {}).get("date")
    author = (commit.get("author") or {}).get("date")
    message = str(commit.get("message") or "").splitlines()[0].strip()
    return {
        "title": message or str(item.get("sha") or "")[:7],
        "url": item.get("html_url"),
        "sha": str(item.get("sha") or "")[:7],
        "date": committer or author,
    }


def incoming_now():
    values = {
        "en": os.environ.get("NOW_EN", "").strip(),
        "ru": os.environ.get("NOW_RU", "").strip(),
    }
    raw_payload = os.environ.get("EVENT_PAYLOAD", "").strip()
    if raw_payload:
        try:
            payload = json.loads(raw_payload)
            values["en"] = str(payload.get("now_en") or values["en"]).strip()
            values["ru"] = str(payload.get("now_ru") or values["ru"]).strip()
        except json.JSONDecodeError:
            print("Warning: EVENT_PAYLOAD is not valid JSON", file=sys.stderr)
    return values


def main():
    data = json.loads(DATA_PATH.read_text(encoding="utf-8"))
    now_values = incoming_now()
    if now_values["en"]:
        data["now"]["en"] = now_values["en"]
    if now_values["ru"]:
        data["now"]["ru"] = now_values["ru"]
    if now_values["en"] or now_values["ru"]:
        data["now"]["updated"] = date.today().isoformat()

    try:
        repos = request_json(
            f"{API_ROOT}/users/{USERNAME}/repos"
            "?sort=pushed&direction=desc&per_page=100&type=owner"
        )
        works = []
        for repo in repos:
            if (
                repo.get("fork")
                or repo.get("archived")
                or repo["name"].lower() == f"{USERNAME}.github.io".lower()
            ):
                continue
            commit = latest_commit(repo["full_name"], repo.get("default_branch") or "main")
            if not commit or not commit["date"]:
                continue
            works.append(
                {
                    "name": (
                        "The Allostatic Sprint Hypothesis"
                        if repo["name"] == "the-Allosteric-Sprint-hypothesis"
                        else repo["name"].replace("-", " ")
                    ),
                    "description": repo.get("description") or "",
                    "url": repo["html_url"],
                    "updatedAt": repo["updated_at"],
                    "lastCommitAt": commit["date"],
                    "latestCommit": {
                        "title": commit["title"],
                        "url": commit["url"],
                        "sha": commit["sha"],
                    },
                    "release": latest_release(repo["full_name"]),
                }
            )
        works.sort(key=lambda work: work["lastCommitAt"], reverse=True)
        works = works[:5]
        if works:
            data["latestWorks"] = works
        data["updated"] = date.today().isoformat()
    except (urllib.error.URLError, TimeoutError, KeyError) as error:
        print(
            f"Warning: GitHub refresh failed; preserving existing work data: {error}",
            file=sys.stderr,
        )

    DATA_PATH.write_text(
        json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )
    print(f"Updated {DATA_PATH.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
