import fs from 'fs';
import * as xlsx from 'xlsx';

function readCollaresDataSheet(path: string) {
    const XLSX: any = (xlsx as any).default || xlsx;
    const workbook = XLSX.readFile(path);
    for (let i = 0; i < workbook.SheetNames.length; i++) {
        const name = workbook.SheetNames[i].toUpperCase();
        if (name.includes('INICIO') || name.includes('PRESUPUESTO')) continue;
        const sheet = workbook.Sheets[workbook.SheetNames[i]];
        const data = XLSX.utils.sheet_to_json(sheet, { header: 1, blankrows: true });
        return { sheetName: workbook.SheetNames[i], data: data.slice(0, 50) };
    }
    return null;
}

const collares = readCollaresDataSheet('c:\\Users\\alexr\\github\\tienda-kora\\src\\content\\products\\6-11 Lista Precios Collares WAW 2025.xlsx');
fs.writeFileSync('c:\\Users\\alexr\\github\\tienda-kora\\tmp-out-collares2.json', JSON.stringify(collares, null, 2), 'utf8');
