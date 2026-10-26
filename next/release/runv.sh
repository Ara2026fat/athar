#!/bin/bash
cd /tmp/r9/visual/r3
export NODE_PATH=$(npm root -g)
run(){ for c in "$@"; do ids=$(paste -sd, logs/idchunk_$c); ENTRY=1 timeout 2400 node tools/seq_all.js 450x900 http://localhost:8977/valley/index.html 0.2 "$ids" > /tmp/rc_test/logs/v_$c.log 2>&1; done; echo finished > /tmp/rc_test/logs/DONE_$1; }
run 00 01 02 03 &
run 04 05 06 07 &
wait
