/**
 * Copies definition files from `dist-types` to `dist-src`.
 *
 * This allows TypeScript to resolve definition files for non-`index.js`
 * modules.
 * 
 * See relevant issue:
 *  - https://github.com/octokit/graphql.js/issues/52
 */
const fs = require('fs');
const path = require('path');

const pkgDir = path.join(__dirname, '..', 'pkg');
const pikaDirs = {
  node: path.join(pkgDir, 'dist-node'),
  src: path.join(pkgDir, 'dist-src'),
  types: path.join(pkgDir, 'dist-types')
};
const definitionPaths = fs.readdirSync(pikaDirs.types);

definitionPaths.forEach(definitionPath => {
  fs.copyFile(
    path.join(pikaDirs.types, definitionPath),
    path.join(pikaDirs.src, definitionPath), 
    (err) => {
      if (err) throw err;
    }
  );
});
