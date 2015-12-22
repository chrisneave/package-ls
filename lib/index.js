var fs = require('fs');
var path = require('path');
var packages = {};

function exists(fileOrDir) {
  try { fs.statSync(fileOrDir) } catch(e) { return false; }
  return true;
}

function searchForPackages(dir) {
  if (!exists(path.join(dir, 'package.json'))) {
    return;
  }

  var pjson = require(path.join(dir, 'package.json'));
  var nodeModules = path.join(dir, 'node_modules');

  for (var dep in pjson.dependencies) {
    var depDir = path.join(nodeModules, dep);

    if (!exists(path.join(depDir, 'package.json'))) {
      break;
    }

    var depPjson = require(path.join(depDir, 'package.json'));
    var license = depPjson.license || '';
    var repository = '';

    if (!license && depPjson.licenses) {
      license = depPjson.licenses[0].type || '';
    }

    if (license && license.type) {
      license = license.type || '';
    }

    if (depPjson.repository) {
      repository = depPjson.repository.url;
    }

    packages[dep + '@' + pjson.dependencies[dep]] = {
      name: dep,
      dependedVersion: pjson.dependencies[dep],
      installedVersion: depPjson.version,
      license: license,
      repository: repository
    };

    searchForPackages(depDir);
  }
}

module.exports = function(program) {
  if (program.args.length === 0) {
    console.log('\nMust provide a dir to search.');
    program.outputHelp();
    process.exit(1);
  }

  searchForPackages(path.join(process.cwd(), program.args[0]));

  if (program.format === 'csv') {
    console.log('Name,DependedVersion,InstalledVersion,License,Repository');

    for (var p in packages) {
      var pp = packages[p];
      console.log('%s,%s,%s,%s,%s', pp.name, pp.dependedVersion, pp.installedVersion, pp.license, pp.repository);
    }
  }

  if (program.format === 'json') {
    console.log(JSON.stringify(packages, null, 2));
  }
}
