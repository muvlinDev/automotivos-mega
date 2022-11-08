export interface Kardex {
    codigo: string,
    clasificacion: string,
    descrcipcion: string,
    marca: string,
    tipo: string,
    /*costo: number,
    cantidad: number,
    precio: number,
    total: number,
    fecha: any,
    date: Date,
    cantTotal: number,
    costoTotal: number*/
    precioCompra: number,
    costoCompra: number,
    cantidad: number,
    total: number,
    totalFac: number,
    precioVenta: number,
    precioFinal: number,
    inventario: number,
    totalAcumulado: number,
    costoUnitario: number,
    fecha: any,
    date: Date,
    corr: number
}
