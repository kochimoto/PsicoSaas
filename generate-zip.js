const fs = require('fs');
const archiver = require('archiver');
const path = require('path');

const outputPath = path.join(__dirname, '..', 'PsicoGestao.v1.zip');
const output = fs.createWriteStream(outputPath);
const archive = archiver('zip', {
  zlib: { level: 9 }
});

output.on('close', function() {
  console.log('✅ PROJETO ZIPADO! ' + (archive.pointer() / 1024 / 1024).toFixed(2) + ' MB');
  console.log('📦 Arquivo salvo em: ' + outputPath);
});

archive.on('error', function(err) {
  throw err;
});

archive.pipe(output);

archive.glob('**/*', {
  cwd: __dirname,
  ignore: ['node_modules/**', '.next/**', '.git/**', '.vscode/**', 'dev.db', 'dev.db-journal', '*.zip']
});
archive.glob('.*', {
  cwd: __dirname,
  ignore: ['.next/**', '.git/**', '.vscode/**']
});

archive.finalize();
