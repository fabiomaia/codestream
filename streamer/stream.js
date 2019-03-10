const chokidar = require('chokidar')
const fs = require('fs')
const WebSocket = require('ws')
const ArgumentParser = require('argparse').ArgumentParser;
const utils = require('./utils')

function error() {
  utils.error(`Server is not reachable.`)
  process.exit(1)
}

function stream(ws, path) {
  if (ws.readyState === WebSocket.OPEN) {
    utils.info(`File ${path} changed on disk, streaming to server...`)
    fs.readFile(path, 'utf8', (err, contents) => {
      ws.send(contents)
    })
  } else {
    error()
  }
}


const parser = new ArgumentParser({ version: '0.0.1', addHelp: true, description: 'Stream a file to viewers' })
parser.addArgument( [ '-f', '--file' ], { required: true, help: 'filename' })
parser.addArgument( [ '-u', '--url' ], { required: true, help: 'central server URL' })
const args = parser.parseArgs()

const ws = new WebSocket(args.url)
ws.on('error', () => error())
chokidar.watch(args.file).on('change', (path) => stream(ws, path))
