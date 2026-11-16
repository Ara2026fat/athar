#!/usr/bin/env bash
# Athar — run every QA suite on one port and print a summary. Usage: tools/qa/all.sh [port] [--fast]
# (--fast skips the slow regress run). Exit code 1 if any suite fails.
PORT="${1:-8899}"; FAST=0; [ "$2" = "--fast" ] || [ "$1" = "--fast" ] && FAST=1; [ "$1" = "--fast" ] && PORT=8899
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"; cd "$ROOT" || exit 2
export NODE_PATH="$(npm root -g)"
python3 -m http.server "$PORT" >/dev/null 2>&1 & SRV=$!
trap 'kill $SRV 2>/dev/null' EXIT; sleep 1
OUT="$(mktemp -d)"; declare -a NAMES RES TIMES
run() { # name, cmd...
  local n="$1"; shift; local t0=$SECONDS
  "$@" >"$OUT/$n.log" 2>&1; local rc=$?
  NAMES+=("$n"); RES+=("$rc"); TIMES+=("$((SECONDS-t0))")
  [ $rc -ne 0 ] && { echo "---- $n failed (tail) ----"; tail -n 15 "$OUT/$n.log"; }
}
[ $FAST -eq 1 ] || run regress  node tools/qa/regress.js "$PORT" "$OUT/regress.json"
run contrast node tools/qa/contrast.js "$PORT" "$OUT/contrast.json"
run contrast320 node tools/qa/contrast.js "$PORT" "$OUT/contrast320.json" --vp 320x568
run a11y     node tools/qa/a11y.js "$PORT"
run audio    node tools/qa/audio.js "$PORT"
run migrate  node tools/qa/migrate.js "$PORT"
run family   node tools/qa/family.js "$PORT"
run smoke    node tools/qa/smoke.js "$PORT"
[ -d "${MAIN_WT:-}" ] && run legacy node tools/qa/legacy.js "$MAIN_WT" 8898
echo; echo "=========== QA summary (port $PORT) ==========="
FAIL=0
for i in "${!NAMES[@]}"; do
  if [ "${RES[$i]}" = 0 ]; then s=PASS; else s=FAIL; FAIL=$((FAIL+1)); fi
  printf '%-12s %s  (%ss)\n' "${NAMES[$i]}" "$s" "${TIMES[$i]}"
done
echo "logs: $OUT"
[ $FAIL -eq 0 ] && echo "ALL PASSED" || echo "$FAIL SUITE(S) FAILED"
exit $((FAIL>0))
