#!/usr/bin/env bash
set -euo pipefail
cd /workspace/KWIS
node -e 'const [major,minor]=process.versions.node.split(".").map(Number); if(major<22||(major===22&&minor<12)||major>=26)throw new Error("Use Node 24 (see .nvmrc)")'
npm ci --cache /tmp/kwis-npm-cache --no-audit --no-fund
node --input-type=module <<'NODE'
import {existsSync,writeFileSync} from 'node:fs';
import {randomBytes} from 'node:crypto';
const path='server/.env';
if(!existsSync(path))writeFileSync(path,`NODE_ENV=development\nPORT=5000\nMONGODB_URI=mongodb://127.0.0.1:27017/kwis\nFRONTEND_ORIGIN=http://localhost:5173,http://127.0.0.1:5173\nJWT_SECRET=${randomBytes(48).toString('hex')}\nCOOKIE_SAME_SITE=lax\n`,{mode:0o600,flag:'wx'});
NODE
npm run db:prepare
