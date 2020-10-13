/**
 * This script will update components to live components if they use a force update.
 * @type {any}
 */

let isWin = process.platform === "win32";

let fs = require( 'fs' );
let path = require( 'path' );
let startPath = "./dist";
let sourcePath = "./src";

let requireList = ''
let exportContent = []

let declarations = ''
let references = ''

let separator = isWin ? "\\" : "/"

let parsePath = function(dirPath) {
  let files = fs.readdirSync( dirPath )
  for (let i = 0; i < files.length; i++) {
    let file = files[i];

    // Make one pass and make the file complete
    let elementPath = path.join( dirPath, file );
    let stat = fs.statSync(elementPath)
    let ext = elementPath.substr(elementPath.length - 2);

    if (stat.isFile() && (ext === "js")) {
      parseFile(elementPath);
    }
    else if (stat.isDirectory()) {
      // console.log( "'%s' is a directory.", elementPath );
      parsePath(elementPath)
    }
  };
}

let parsePathDeclarations = function(dirPath) {
  let files = fs.readdirSync( dirPath )
  for (let i = 0; i < files.length; i++) {
    let file = files[i];

    // Make one pass and make the file complete
    let elementPath = path.join( dirPath, file );
    let stat = fs.statSync(elementPath)
    let ext = elementPath.substr(elementPath.length - 4);

    if (stat.isFile() && (ext === "d.ts")) {
      references += "/// <reference path=\"" + elementPath.replace("src",".") + "\" />\n"
      parseFileDeclarations(elementPath);
    }
    else if (stat.isDirectory()) {
      // console.log( "'%s' is a directory.", elementPath );
      parsePathDeclarations(elementPath)
    }
  };
}


let parseFileDeclarations = function(filePath) {
  let filenameArr = filePath.split(separator);
  let filename = filenameArr[filenameArr.length-1].replace(".d.ts","").replace(/[^0-9a-zA-Z]/g,'_');
  declarations += fs.readFileSync(filePath) + '\n\n'
}

let parseFile = function(filePath) {
  let filenameArr = filePath.split(separator);
  let filename = filenameArr[filenameArr.length-1].replace(".js","").replace(/[^0-9a-zA-Z]/g,'_');
  if (filename === "index") { return }

  console.log("Checking", filePath, '...')

  let requires = require("./" + filePath);
  if (Object.keys(requires).length == 0) { return }

  let tsPath= filePath.replace('dist' + separator,'./')
  tsPath= tsPath.replace('.js','')
  // catch for windows..
  tsPath= tsPath.replace(/(\\)/g,'/')

  let importString = 'import {';
  Object.keys(requires).forEach((item) => {
    importString += `${item}, `
  })
  importString += `} from "${tsPath}"\n`

  requireList   += importString;
  // requireList   += "const " + filename + " = require('" + filePath + "');\n";
  // let requires = require("./" + filePath);
  Object.keys(requires).forEach((item) => {
    exportContent.push(`${item}`)
  })
}

parsePath(startPath)
parsePathDeclarations(sourcePath)

let result = ''

exportContent.sort()
let exportString = "";
exportContent.forEach((str) => {
  exportString += "  " + str + ",\n";
})

result += references;
result += requireList;
result += "\n\n\n";
// result += declarations;
result += `export {\n${exportString}}`;

fs.writeFileSync('./src/index.ts', result);