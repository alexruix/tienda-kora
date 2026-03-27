import { getCollection } from 'astro:content';

/**
 * Script de Auditoría de Stock/Pedidos (Waw Pets)
 * 
 * Este script simula la suma de productos de Waw Pets que deberían 
 * procesarse en el próximo batch.
 */

async function runReport() {
    console.log("--- Reporte de Auditoría: Waw Pets ---");
    
    // En una implementación real con DB, buscaríamos órdenes con estado 'paid' y 'brand === Waw Pets'
    // Aquí simulamos el cálculo basado en el catálogo para demostrar la lógica.
    
    const products = await getCollection('products');
    const wawProducts = products.filter(p => p.data.brand === "Waw Pets");
    
    console.log(`Total de productos Waw Pets en catálogo: ${wawProducts.length}`);
    
    const target = 150000;
    console.log(`Objetivo de batch: $${target.toLocaleString('es-AR')}`);
    
    // Ejemplo hipotético de órdenes
    const mockOrders = [
        { id: '101', totalWaw: 33580 },
        { id: '102', totalWaw: 45000 },
        { id: '103', totalWaw: 12000 },
    ];
    
    const currentTotal = mockOrders.reduce((acc, o) => acc + o.totalWaw, 0);
    const progress = (currentTotal / target) * 100;
    
    console.log(`\nProgreso del Batch Actual:`);
    console.log(`Acumulado: $${currentTotal.toLocaleString('es-AR')}`);
    console.log(`Restante:  $${(target - currentTotal).toLocaleString('es-AR')}`);
    console.log(`Completado: ${progress.toFixed(2)}%`);
    
    if (progress >= 100) {
        console.log("\n✅ ¡LITO! Ya se puede realizar el pedido al proveedor.");
    } else {
        console.log("\n⏳ Faltan más pedidos para llegar al mínimo del proveedor.");
    }
}

// Nota: Para correr esto en Astro, usualmente se haría vía un endpoint de API o script externo.
console.log("Para ejecutar este reporte se requiere acceso a la base de datos de órdenes.");
