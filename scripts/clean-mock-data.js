const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);
const readFile = promisify(fs.readFile);

const mockImportRegex = /import\s+{([^}]*)}\s+from\s+['"]@\/app\/data\/mockdatas['"]/g;

// Dizindeki tüm .js ve .jsx dosyalarını bul
async function findFiles(dir, fileList = []) {
  const files = await readdir(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stats = await stat(filePath);
    
    if (stats.isDirectory()) {
      // node_modules veya .next dizinlerini atla
      if (file !== 'node_modules' && file !== '.next') {
        fileList = await findFiles(filePath, fileList);
      }
    } else if (file.endsWith('.js') || file.endsWith('.jsx')) {
      fileList.push(filePath);
    }
  }
  
  return fileList;
}

// Dosyadaki mock veri kullanımlarını bul
async function findMockUsage(filePath) {
  const content = await readFile(filePath, 'utf8');
  const imports = [];
  let match;
  
  while ((match = mockImportRegex.exec(content)) !== null) {
    imports.push({
      fullImport: match[0],
      importedItems: match[1].split(',').map(item => item.trim()),
      lineNumber: content.substring(0, match.index).split('\n').length
    });
  }
  
  return imports.length > 0 ? { filePath, imports } : null;
}

// Ana fonksiyon
async function findAllMockUsage() {
  try {
    console.log('Mock veri kullanımları taranıyor...');
    
    // Uygulama dizinindeki tüm dosyaları bul
    const srcDir = path.join(process.cwd(), 'src');
    const files = await findFiles(srcDir);
    
    console.log(`Toplam ${files.length} dosya tarandı.`);
    
    // Her dosyada mock veri kullanımını kontrol et
    const results = [];
    
    for (const file of files) {
      const usage = await findMockUsage(file);
      if (usage) {
        results.push(usage);
      }
    }
    
    console.log('\n==== Mock Veri Kullanım Raporu ====');
    console.log(`Toplam ${results.length} dosyada mock veri kullanımı bulundu:\n`);
    
    // Sonuçları göster
    results.forEach(result => {
      console.log(`Dosya: ${path.relative(process.cwd(), result.filePath)}`);
      result.imports.forEach(imp => {
        console.log(`  Satır ${imp.lineNumber}: ${imp.fullImport}`);
        console.log(`  İçe Aktarılan Öğeler: ${imp.importedItems.join(', ')}`);
      });
      console.log('');
    });
    
    // Otomatik temizleme için rehber
    console.log('\n==== Temizleme Rehberi ====');
    console.log('1. Her dosyada mock veri importlarını `import api from \'@/lib/api\';` ile değiştirin.');
    console.log('2. Veri yükleme kodunu async/await yapısına dönüştürün.');
    console.log('3. mockData referanslarını api.* çağrıları ile değiştirin.');
    console.log('4. Detaylı adımlar için README-SUPABASE-MIGRATION.md dosyasına bakın.');
    
  } catch (error) {
    console.error('Hata:', error);
  }
}

// Betiği çalıştır
findAllMockUsage();