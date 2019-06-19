var fs = require('fs');
var easyfile = require('easyfile');
var path = require('path');

module.exports = function(args) {
  var projectDir = args.root;
  var projectName = args.projectName;
  var projectAuthor = args.projectAuthor;
  var projectType = args.projectType;
  var projectFeatures = args.projectFeatures;

  var templates = path.join(__dirname, projectType);
  var pkgPath = path.join(projectDir, 'package.json');
  var readmePath = path.join(projectDir, 'README.md');
  easyfile.copy(templates, projectDir, {
    force: true,
    backup: true
  });

  // Rename files start with '_'
  var files = easyfile.readdir(projectDir);
  files.forEach(function(filename) {
    if (filename[0] === '_') {
      easyfile.rename(
        path.join(projectDir, filename),
        path.join(projectDir, filename.replace(/^_/, '.'))
      );
    }
  });

  var replacedPkg = fs
    .readFileSync(pkgPath, 'utf-8')
    .replace('__YourProjectName__', projectName)
    .replace('__AuthorName__', projectAuthor);
  fs.writeFileSync(pkgPath, replacedPkg);

  var replaceReadme = fs
    .readFileSync(readmePath, 'utf-8')
    .replace(/__YourProjectName__/g, projectName);
  fs.writeFileSync(readmePath, replaceReadme);

  if (projectType === 'webapp' && projectFeatures && projectFeatures.length) {
    fs.unlinkSync(path.join(projectDir, 'src/index.js'));
    fs.unlinkSync(path.join(projectDir, 'public/index.html'));
    fs.rmdirSync(path.join(projectDir, 'public'));

    var appJSONPath = path.join(projectDir, 'app.json');
    var appJSONContent = fs.readFileSync(appJSONPath, 'utf-8');
    var appJSON = JSON.parse(appJSONContent);

    projectFeatures.forEach((feature) => {
      appJSON[feature] = true;
    });

    var jsonString = JSON.stringify(appJSON, null, 2);
    fs.writeFileSync(appJSONPath, jsonString, 'utf-8');
  }

  process.chdir(projectDir);
  return Promise.resolve(projectDir);
};
