#!/usr/bin/env node

// Simple test script to verify MCP server functionality
const { spawn } = require('child_process');
const path = require('path');

console.log('🧪 Testing StashDog MCP Server...');

// Check if dist directory exists
const distPath = path.join(__dirname, 'dist');
const fs = require('fs');

if (!fs.existsSync(distPath)) {
    console.error('❌ dist directory not found. Please run: npm run build');
    process.exit(1);
}

// Check if main file exists
const mainFile = path.join(distPath, 'index.js');
if (!fs.existsSync(mainFile)) {
    console.error('❌ Main server file not found. Please run: npm run build');
    process.exit(1);
}

console.log('✅ Server files found');

// Test that the server can start
const serverProcess = spawn('node', [mainFile], {
    stdio: ['pipe', 'pipe', 'pipe'],
    cwd: __dirname
});

let serverOutput = '';
let serverError = '';

serverProcess.stdout.on('data', (data) => {
    serverOutput += data.toString();
});

serverProcess.stderr.on('data', (data) => {
    serverError += data.toString();
});

// Send a simple MCP message to test
setTimeout(() => {
    const initMessage = JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'tools/list',
        params: {}
    }) + '\n';

    serverProcess.stdin.write(initMessage);
}, 100);

// Check response
setTimeout(() => {
    serverProcess.kill();
    
    if (serverError.includes('StashDog MCP Server running')) {
        console.log('✅ Server started successfully');
    } else {
        console.log('⚠️  Server may have issues. Check error output:');
        console.log(serverError);
    }
    
    if (serverOutput.includes('tools') || serverOutput.includes('manage_inventory_items')) {
        console.log('✅ Server responded to tools/list request');
    } else {
        console.log('⚠️  Server may not be responding properly');
        console.log('Output:', serverOutput);
    }
    
    console.log('🎉 Basic test completed');
    process.exit(0);
}, 2000);