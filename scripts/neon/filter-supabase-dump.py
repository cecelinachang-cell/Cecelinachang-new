"""Turn a Supabase cluster dump into plain SQL that loads into Neon (or any Postgres).

Usage:
  python3 -I scripts/neon/filter-supabase-dump.py <db_cluster-*.backup> > public.sql

Keeps only the `public` schema of the `postgres` database: tables, data,
constraints, indexes and the analytics_* functions. Drops what only exists on
Supabase: roles, grants, RLS policies, the auth/storage/realtime schemas, the
is_admin()/require_admin() checks (admin access is enforced by the app now),
public.users rows (Supabase Auth accounts) and psql 17 meta-commands.
"""
import re
import sys

KEEP_TYPES = {"TABLE", "TABLE DATA", "CONSTRAINT", "FK CONSTRAINT", "INDEX", "FUNCTION", "SEQUENCE", "SEQUENCE SET", "DEFAULT"}
SKIP_NAMES = {"is_admin()", "require_admin()"}
SKIP_DATA = {"users"}  # Supabase Auth admin accounts; replaced by ADMIN_PASSWORD

HEADER = re.compile(r"^-- (?:Data for )?Name: (?P<name>[^;]+); Type: (?P<type>[^;]+); Schema: (?P<schema>[^;]+);")


def blocks(lines):
    """Yield (header_match_or_None, block_lines) for each pg_dump object block."""
    current, header = [], None
    for i, line in enumerate(lines):
        # A block starts at "--\n-- Name: ...". Flush the previous one there.
        if line.startswith("-- ") and HEADER.match(line) and i > 0 and lines[i - 1] == "--\n":
            if current and current[-1] == "--\n":
                current.pop()
            yield header, current
            current, header = ["--\n"], HEADER.match(line)
        current.append(line)
    yield header, current


def clean(text):
    text = text.replace("extensions.uuid_generate_v4()", "gen_random_uuid()")
    text = re.sub(r"^\s*PERFORM public\.require_admin\(\);\n", "", text, flags=re.M)
    text = re.sub(r"^ALTER .* OWNER TO .*;\n", "", text, flags=re.M)
    return text


def main():
    raw = open(sys.argv[1], encoding="utf-8").read().splitlines(keepends=True)
    start = next(i for i, l in enumerate(raw) if l.strip() == "\\connect postgres")
    out = ["SET client_encoding = 'UTF8';\nSET standard_conforming_strings = on;\nSET check_function_bodies = false;\n"]
    kept = {}
    for header, body in blocks(raw[start + 1 :]):
        if not header or header["schema"] != "public" or header["type"] not in KEEP_TYPES:
            continue
        name = header["name"].strip()
        if header["type"] == "FUNCTION" and name in SKIP_NAMES:
            continue
        if header["type"] == "TABLE DATA" and name in SKIP_DATA:
            continue
        # e.g. users.id -> auth.users(id): the target schema doesn't exist outside Supabase.
        if header["type"] == "FK CONSTRAINT" and re.search(r"REFERENCES (auth|storage)\.", "".join(body)):
            continue
        out.append(clean("".join(body)))
        kept[header["type"]] = kept.get(header["type"], 0) + 1
    sys.stdout.write("".join(out))
    print("kept: " + ", ".join(f"{k} {v}" for k, v in sorted(kept.items())), file=sys.stderr)


if __name__ == "__main__":
    main()
