#!/usr/bin/env node
// Clears ELECTRON_RUN_AS_NODE before launching electron-vite dev.
// VS Code's terminal sets this to '1' which makes Electron run as plain Node.js.
'use strict';
const { spawn } = require('child_process');
const path = require('path');

const env = { ...process.env };
delete env.ELECTRON_RUN_AS_NODE;

const evBin = path.join(__dirname, '..', 'node_modules', 'electron-vite', 'bin', 'electron-vite.js');

const child = spawn(process.execPath, [evBin, 'dev'], { stdio: 'inherit', env });
child.on('close', (code) => process.exit(code ?? 0));
