import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Orden } from '../models/interfaces/orden.interface';
import baserUrl from '../environments/develop.environment';

@Injectable({
  providedIn: 'root'
})
export class OrdenService {
  constructor(private http: HttpClient) {}

  crearOrden(usuarioId: number, productoIds: Set<number>): Observable<Orden> {
    return this.http.post<Orden>(`${baserUrl}/ordenes/crear?usuarioId=${usuarioId}`, { productoIds });
  }

  agregarProductoAlCarrito(usuarioId: number, productoId: number): Observable<Orden> {
    return this.http.post<Orden>(`${baserUrl}/ordenes/agregarProducto`, { usuarioId, productoId });
  }

  obtenerOrdenActiva(usuarioId: number): Observable<Orden> {
    return this.http.get<Orden>(`${baserUrl}/ordenes/usuario/${usuarioId}/activa`);
  }

  procesarOrden(ordenId: number): Observable<Orden> {
    return this.http.post<Orden>(`${baserUrl}/ordenes/procesar/${ordenId}`, {});
  }

  eliminarProductoDeLaOrden(ordenId: number, productoId: number): Observable<Orden> {
    return this.http.delete<Orden>(`${baserUrl}/ordenes/${ordenId}/producto/${productoId}`);
  }


  obtenerResumenDeCompra(ordenId: number): Observable<any> {
    return this.http.get<any>(`${baserUrl}/ordenes/${ordenId}/resumen`);
  }

  listarOrdenesPorUsuario(usuarioId: number): Observable<Orden[]> {
    return this.http.get<Orden[]>(`${baserUrl}/ordenes/usuario/${usuarioId}`);
  }

  eliminarOrden(ordenId: number): Observable<void> {
    return this.http.delete<void>(`${baserUrl}/ordenes/${ordenId}`);
  }

  realizarPago(pago: any): Observable<any> {
    return this.http.post<any>(`${baserUrl}/pagos/realizar`, pago);
  }

  
  descargarComprobantePorOrden(ordenId: number): Observable<Blob> {
    return this.http.get(`${baserUrl}/pagos/comprobante/orden/${ordenId}`, { responseType: 'blob' });
  }


}
