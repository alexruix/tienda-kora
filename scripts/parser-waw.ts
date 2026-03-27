import fs from 'fs';
import path from 'path';
import * as xlsx from 'xlsx';
import slugify from 'slugify';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const OUT_DIR = path.resolve(__dirname, '../src/content/products');

if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

const imagesMapPath = path.resolve(__dirname, 'imagesMap.json');
let imagesMap: Record<string, string> = {};
if (fs.existsSync(imagesMapPath)) {
  imagesMap = JSON.parse(fs.readFileSync(imagesMapPath, 'utf8'));
}

function normalizeTitle(title: string) {
    // Capitalize properly assuming spanish
    if (!title) return '';
    return title.charAt(0).toUpperCase() + title.slice(1).toLowerCase();
}

function parseRopa() {
  const filePath = path.resolve(__dirname, '../src/content/products/1 de Agosto - Lista Precios Ropa - WawPets2025.xlsx');
  const XLSXLib: any = (xlsx as any).default || xlsx;
  const workbook = XLSXLib.readFile(filePath);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows: any[] = XLSXLib.utils.sheet_to_json(sheet, { header: 1, blankrows: true });

  let currentProductName = '';
  let colorHeaders: { index: number; name: string }[] = [];
  let tallesIndex = -1, largoLomoIndex = -1, contPechoIndex = -1, contCuelloIndex = -1;

  let generatedCount = 0;

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    if (!row || row.length === 0) continue;

    if (row[1] === 'Codigo' && row[3] && String(row[3]).includes('$ x unid')) {
      currentProductName = row[2] as string || '';
      colorHeaders = [];
      tallesIndex = -1;
      
      for (let j = 5; j < row.length; j++) {
        const val = row[j] ? String(row[j]).trim() : '';
        if (val === 'Talles' || val.includes('Talles')) {
          tallesIndex = j;
          largoLomoIndex = j + 1;
          contPechoIndex = j + 2;
          contCuelloIndex = j + 3;
          break;
        } else if (val && val !== '') {
          colorHeaders.push({ index: j, name: val });
        }
      }
      continue;
    }

    const codeRaw = row[1];
    if (codeRaw && typeof codeRaw === 'string' && codeRaw.includes('/')) {
      const codeParts = codeRaw.split('/');
      const baseCode = codeParts[0].trim();
      const talle = codeParts[1].trim();
      const idStr = `waw-${slugify(baseCode, { lower: true })}-${slugify(talle, { lower: true })}`;
      
      const priceRaw = parseFloat(row[3]);
      if (isNaN(priceRaw)) continue;
      const price = Math.round(priceRaw * 2.3);
      
      const variants = colorHeaders.map(col => {
         const cellValue = row[col.index] ? String(row[col.index]).trim() : '';
         const available = cellValue !== 'SIN STOCK';
         return {
           label: normalizeTitle(col.name),
           value: slugify(col.name, { lower: true }),
           color: col.name,
           available
         };
      });

      const details = [];
      if (tallesIndex !== -1 && row[largoLomoIndex]) details.push({ label: 'Largo Lomo', value: String(row[largoLomoIndex]).trim() });
      if (tallesIndex !== -1 && row[contPechoIndex]) details.push({ label: 'Cont. Pecho', value: String(row[contPechoIndex]).trim() });
      if (tallesIndex !== -1 && row[contCuelloIndex]) details.push({ label: 'Cont. Cuello', value: String(row[contCuelloIndex]).trim() });

      const nameTalle = row[tallesIndex] ? String(row[tallesIndex]).trim() : talle;
      const finalName = normalizeTitle(currentProductName.trim());

      const product = {
        id: idStr,
        name: `${finalName} - Talle ${nameTalle}`,
        slug: idStr,
        brand: 'Waw Pets',
        category: 'ropa',
        price,
        inStock: variants.some(v => v.available),
        leadTime: "24-72 hs",
        variants,
        details,
        image: imagesMap[idStr] || ""
      };

      fs.writeFileSync(path.join(OUT_DIR, `${idStr}.json`), JSON.stringify(product, null, 2));
      generatedCount++;
    }
  }
  console.log(`- Ropa: Generados ${generatedCount} productos.`);
}

function parseCollares() {
  const filePath = path.resolve(__dirname, '../src/content/products/6-11 Lista Precios Collares WAW 2025.xlsx');
  const XLSXLib: any = (xlsx as any).default || xlsx;
  const workbook = XLSXLib.readFile(filePath);
  
  let generatedCount = 0;

  for (let s = 0; s < workbook.SheetNames.length; s++) {
    const sheetName = workbook.SheetNames[s];
    if (sheetName.toUpperCase().match(/INICIO|INFO|PRESUPUESTO|NOTAS/)) continue;
     
    const sheet = workbook.Sheets[sheetName];
    const rows: any[] = XLSXLib.utils.sheet_to_json(sheet, { header: 1, blankrows: true });
     
    let codigoIndex = -1, productoIndex = -1, precioIndex = -1, coloresIndex = -1;

    for (let i = 0; i < rows.length; i++) {
       const row = rows[i];
       if (!row || row.length === 0) continue;

       // Find header
       let foundCod = -1;
       let foundProd = -1;
       let foundPrecio = -1;
       let foundColores = -1;
       
       for (let j = 0; j < row.length; j++) {
         const cell = row[j] ? String(row[j]).trim().toLowerCase() : '';
         if (cell.includes('cod') || cell.includes('código') || cell.includes('codigo')) foundCod = j;
         else if (cell.includes('producto') || cell.includes('descripc') || cell.includes('modelo')) foundProd = j;
         else if (cell.includes('$') || cell.includes('precio') || cell.includes('x unid')) foundPrecio = j;
         else if (cell.includes('color')) foundColores = j;
       }

       if (foundCod !== -1 && foundProd !== -1 && foundPrecio !== -1) {
         codigoIndex = foundCod;
         productoIndex = foundProd;
         precioIndex = foundPrecio;
         coloresIndex = foundColores;
         continue; 
       }

       if (codigoIndex !== -1 && row[codigoIndex]) {
          const codeRaw = String(row[codigoIndex]).trim();
          if (!codeRaw || codeRaw.toUpperCase().includes('CODIGO') || codeRaw.toUpperCase().includes('COD')) continue;

          let talle = '';
          let baseCode = codeRaw;
          if (codeRaw.includes('/')) {
             const parts = codeRaw.split('/');
             baseCode = parts[0].trim();
             talle = parts[1].trim();
          }

          const idStr = `waw-${slugify(baseCode, { lower: true })}${talle ? '-' + slugify(talle, { lower: true }) : ''}`;
          
          const rawPriceCell = String(row[precioIndex] || '0').replace(/[^0-9,.]/g, '').replace(',', '.');
          const priceRaw = parseFloat(rawPriceCell);
          if (isNaN(priceRaw) || priceRaw <= 0) continue;
          const price = Math.round(priceRaw * 2.3);

          let productName = row[productoIndex] ? String(row[productoIndex]).trim() : `Accesorio ${codeRaw}`;
          productName = normalizeTitle(productName);
          
          const variants: any[] = [];
          if (coloresIndex !== -1 && row[coloresIndex]) {
             const coloresStr = String(row[coloresIndex]);
             const colorList = coloresStr.split(/[-,\/y]/).map((c: string) => c.trim()).filter((c: string) => c);
             colorList.forEach((c: string) => {
                 let rawColor = c;
                 if (c.includes(':')) rawColor = c.split(':')[1].trim();
                 variants.push({
                     label: normalizeTitle(rawColor),
                     value: slugify(rawColor, { lower: true }),
                     color: rawColor,
                     available: true
                 });
             });
          }

          const product = {
            id: idStr,
            name: `${productName}${talle ? ' - Talle ' + talle : ''}`,
            slug: idStr,
            brand: 'Waw Pets',
            category: 'accesorios',
            price,
            inStock: true,
            leadTime: "5 días hábiles (a pedido)",
            variants: variants.length > 0 ? variants : undefined,
            details: talle ? [{ label: 'Talle', value: talle }] : undefined,
            image: imagesMap[idStr] || ""
          };

          fs.writeFileSync(path.join(OUT_DIR, `${idStr}.json`), JSON.stringify(product, null, 2));
          generatedCount++;
       }
    }
  }
  console.log(`- Collares: Generados ${generatedCount} productos.`);
}

console.log("Iniciando generación de JSON...");
try {
  parseRopa();
  parseCollares();
  console.log("¡Proceso completado exitosamente!");
} catch (e) {
  console.error("Error durante el parseo:", e);
}
