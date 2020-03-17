import * as fs from "fs";
import {spawn} from "child_process";

export async function verifyCertificate() {
  let pathExists = fs.existsSync('./src/https')
  if (!pathExists) {
    fs.mkdirSync('./src/https');
  }
  let certificateFolderContent = fs.readdirSync('./src/https/')

  if (certificateFolderContent.indexOf("key.pem") == -1 || certificateFolderContent.indexOf("cert.pem") == -1) {
    await generateSelfSignedCertificatePair();
  }
}

async function generateSelfSignedCertificatePair() {
  console.log("Generating self-signed certificate pair...")
  let command = "req -newkey rsa:2048 -nodes -keyout ./src/https/key.pem -x509 -days 18500 -out ./src/https/cert.pem";
  let input = ["NL","Zuid-Holland","Rotterdam","Crownstone","Hub v1","","ask@crownstone.rocks"]
  return new Promise((resolve, reject) => {
    // @ts-ignore
    runOpenSSLCommand(command, input.reverse(), (something, other) => {
      console.log("Generated self-signed certificate pair!")
      resolve();
    })
  });
}

/**
 * The methods below have been taken and adapted from https://github.com/lspiehler/node-openssl-cert
 * @param command
 */

let normalizeCommand = function(command : string) {
  let cmd = command.split(' ');
  let outcmd = [];
  let cmdbuffer = [];
  for(let i = 0; i <= cmd.length - 1; i++) {
    if(cmd[i].charAt(cmd[i].length - 1) == '\\') {
      cmdbuffer.push(cmd[i]);
    } else {
      if(cmdbuffer.length > 0) {
        outcmd.push(cmdbuffer.join(' ') + ' ' + cmd[i]);
        cmdbuffer.length = 0;
      } else {
        outcmd.push(cmd[i]);
      }
    }
  }
  return outcmd;
}

let runOpenSSLCommand = function(cmd : string, input: string[], callback : (err : false | any, result: any) => void) {
  const stdoutbuff: string[] = [];
  const stderrbuff: string[] = [];
  let terminate = false;

  const shell = spawn( 'openssl', normalizeCommand(cmd) );

  let writeTimeout : any = null;
  shell.stderr.on('data', function(data) {
    clearTimeout(writeTimeout)
    writeTimeout = setTimeout(function() {
      if (input.length > 0) {
        shell.stdin.write(input[input.length - 1] + "\r\n");
        input.pop();
      }
      else {
        shell.stdin.write("\r\n");
      }
    }, 300);
    stderrbuff.push(data.toString());
  });

  shell.on('exit', function(code) {
    clearTimeout(writeTimeout)
    if(terminate && code==null) {
      code = 0;
    }
    let out = {
      command: 'openssl ' + cmd,
      stdout: stdoutbuff.join(''),
      stderr: stderrbuff.join(''),
      exitcode: code
    }
    if (code != 0) {
      callback(stderrbuff.join(), out);
    } else {
      callback(false, out);
    }
  });
}
