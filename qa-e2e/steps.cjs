const assert = require('node:assert/strict');
const { Given, When, Then, setDefaultTimeout } = require('@cucumber/cucumber');
setDefaultTimeout(60000);
const base = process.env.BASE_URL || 'http://localhost:30080';
async function json(path, options) {
  const response = await fetch(base + path, options);
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(`${response.status} ${path}: ${JSON.stringify(body)}`);
  return body;
}
Given('que el ecosistema local de Happy Donut está disponible', async function () {
  const response = await fetch(base + '/api/ventas/productos');
  assert.equal(response.ok, true, 'La API de Ventas no esta disponible');
});
Given('existe un producto de venta con stock', async function () {
  const catalogo = await json('/api/ventas/productos');
  assert.ok(catalogo.productos.length > 0);
  this.producto = catalogo.productos[0];
  const inventario = await json(`/api/inventario/stock/${this.producto.id}`);
  assert.ok(inventario.stock_disponible > 0);
  this.stockInicial = inventario.stock_disponible;
  const periodo = new Date().toISOString().slice(0, 7);
  this.periodo = periodo;
  this.rusInicial = (await json(`/api/finanzas/rus/${periodo}`)).acumulado;
});
When('realizo y pago una venta en efectivo con boleta', async function () {
  const orden = await json('/api/ventas/ordenes', {method:'POST',headers:{'Content-Type':'application/json','Accept':'application/json'},body:JSON.stringify({items:[{producto_id:this.producto.id,nombre_producto:this.producto.nombre,cantidad:1,precio_unitario:this.producto.precio}]})});
  const monto = Number(this.producto.precio) + 10;
  this.pago = await json(`/api/ventas/ordenes/${orden.orden_id}/pagar`, {method:'POST',headers:{'Content-Type':'application/json','Accept':'application/json'},body:JSON.stringify({monto_recibido:monto,metodo_pago:'EFECTIVO',tipo_comprobante:'BOLETA'})});
  this.vueltoEsperado = 10;
});
Then('el vuelto calculado es correcto', function () { assert.equal(Number(this.pago.vuelto), this.vueltoEsperado); });
Then('el inventario descuenta la cantidad vendida', async function () {
  for (let i=0;i<20;i++) { const actual=await json(`/api/inventario/stock/${this.producto.id}`); if(actual.stock_disponible===this.stockInicial-1) return; await new Promise(r=>setTimeout(r,1000)); }
  assert.fail('Inventario no proceso VentaFinalizada dentro de 20 segundos');
});
Then('Finanzas aumenta el acumulado RUS', async function () {
  for (let i=0;i<20;i++) { const actual=await json(`/api/finanzas/rus/${this.periodo}`); if(Number(actual.acumulado)>Number(this.rusInicial)) return; await new Promise(r=>setTimeout(r,1000)); }
  assert.fail('Finanzas no proceso VentaFinalizada dentro de 20 segundos');
});