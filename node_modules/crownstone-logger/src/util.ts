import fs from "fs";
import path from "path";

function validatePath(targetPath) {
  if (fs.existsSync(targetPath)) {
    return true;
  }
  else {
    let previousPath = path.join(targetPath, '../');
    if (validatePath(previousPath)) {
      // create
      fs.mkdirSync(targetPath);
      return true;
    }
  }
}

export {
  validatePath
}