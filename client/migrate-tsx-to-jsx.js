const fs = require('fs');
const path = require('path');

// Función para migrar un archivo .tsx a .jsx
function migrateTsxToJsx(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Remover "use client" directive
    content = content.replace(/"use client"\s*\n\s*/g, '');
    
    // Remover tipos de TypeScript
    content = content.replace(/:\s*React\.ComponentProps<[^>]+>/g, '');
    content = content.replace(/:\s*React\.ElementRef<[^>]+>/g, '');
    content = content.replace(/:\s*React\.ComponentPropsWithoutRef<[^>]+>/g, '');
    content = content.replace(/:\s*React\.ReactElement<[^>]+>/g, '');
    content = content.replace(/:\s*VariantProps<[^>]+>/g, '');
    content = content.replace(/:\s*[A-Za-z][A-Za-z0-9]*\[\]/g, '');
    content = content.replace(/:\s*string/g, '');
    content = content.replace(/:\s*number/g, '');
    content = content.replace(/:\s*boolean/g, '');
    content = content.replace(/:\s*any/g, '');
    content = content.replace(/:\s*void/g, '');
    content = content.replace(/:\s*undefined/g, '');
    content = content.replace(/:\s*null/g, '');
    
    // Remover imports de tipos
    content = content.replace(/import\s*{\s*[^}]*type\s+[^}]*}\s*from\s*["'][^"']*["']/g, '');
    content = content.replace(/,?\s*type\s+[A-Za-z][A-Za-z0-9]*/g, '');
    
    // Remover declaraciones de tipos
    content = content.replace(/type\s+[A-Za-z][A-Za-z0-9]*\s*=\s*[^;]+;/g, '');
    
    // Remover interfaces
    content = content.replace(/interface\s+[A-Za-z][A-Za-z0-9]*\s*{[^}]*}/g, '');
    
    // Limpiar líneas vacías múltiples
    content = content.replace(/\n\s*\n\s*\n/g, '\n\n');
    
    // Escribir el archivo migrado
    const newFilePath = filePath.replace('.tsx', '.jsx');
    fs.writeFileSync(newFilePath, content);
    
    // Eliminar el archivo original
    fs.unlinkSync(filePath);
    
    console.log(`Migrado: ${filePath} -> ${newFilePath}`);
    return true;
  } catch (error) {
    console.error(`Error migrando ${filePath}:`, error.message);
    return false;
  }
}

// Función para buscar archivos .tsx recursivamente
function findTsxFiles(dir) {
  const files = [];
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      files.push(...findTsxFiles(fullPath));
    } else if (item.endsWith('.tsx')) {
      files.push(fullPath);
    }
  }
  
  return files;
}

// Migrar todos los archivos .tsx
const srcDir = path.join(__dirname, 'src');
const tsxFiles = findTsxFiles(srcDir);

console.log(`Encontrados ${tsxFiles.length} archivos .tsx para migrar:`);
tsxFiles.forEach(file => console.log(`  - ${file}`));

let successCount = 0;
let errorCount = 0;

for (const file of tsxFiles) {
  if (migrateTsxToJsx(file)) {
    successCount++;
  } else {
    errorCount++;
  }
}

console.log(`\nMigración completada:`);
console.log(`  - Exitosos: ${successCount}`);
console.log(`  - Errores: ${errorCount}`);
