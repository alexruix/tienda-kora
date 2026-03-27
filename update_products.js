
const fs = require('fs');
const path = require('path');

const directoryPath = path.join(process.cwd(), 'src', 'content', 'products');

try {
    const files = fs.readdirSync(directoryPath);
    files.forEach((file) => {
        if (file.startsWith('waw-') && file.endsWith('.json')) {
            const filePath = path.join(directoryPath, file);
            const content = fs.readFileSync(filePath, 'utf8');
            const data = JSON.parse(content);

            // Normalize category
            data.category = "ropa";

            // Determine subcategory
            const name = (data.name || "").toLowerCase();
            if (name.includes('buzo')) {
                data.subcategory = "Buzos";
            } else if (name.includes('remera')) {
                data.subcategory = "Remeras";
            } else if (name.includes('manta')) {
                data.subcategory = "Mantas";
            } else {
                data.subcategory = "Otros";
            }

            fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
            console.log(`Updated ${file}: ${data.subcategory}`);
        }
    });
    console.log('Bulk update completed successfully.');
} catch (err) {
    console.error('Error during update:', err);
    process.exit(1);
}
