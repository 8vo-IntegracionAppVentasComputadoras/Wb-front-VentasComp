import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Producto } from '../models/interfaces/producto.interface';
import baserUrl from '../environments/develop.environment';

@Injectable({
  providedIn: 'root'
})
export class ProductoService {

  constructor(private http: HttpClient) { }

  listarProductos(): Observable<Producto[]> {
    return this.http.get<Producto[]>(`${baserUrl}/productos/listar`);
  }

  registrarProducto(producto: Producto): Observable<Producto> {
    return this.http.post<Producto>(`${baserUrl}/productos/registrar`, producto);
  }

  eliminarProducto(id: number): Observable<any> {
    return this.http.delete(`${baserUrl}/productos/${id}`);
  }

  obtenerCatalogoCompleto(): Observable<Producto[]> {
    return this.http.get<Producto[]>(`${baserUrl}/api/productos/listar`);
  }

  obtenerDetallesDelProducto(id: number): Observable<Producto> {
    return this.http.get<Producto>(`${baserUrl}/api/productos/${id}/detalles`);
  }

  actualizarEspecificaciones(id: number, especificaciones: Set<number>): Observable<Producto> {
    return this.http.put<Producto>(`${baserUrl}/productos/${id}/especificaciones`, { especificacionIds: especificaciones });
  }

  editarProducto(id: number, producto: Producto): Observable<Producto> {
    return this.http.put<Producto>(`${baserUrl}/productos/editar/${id}`, producto);
  }

  buscarProductos(nombre: string): Observable<Producto[]> {
    return this.http.get<Producto[]>(`${baserUrl}/productos/buscar`, { params: { nombre } });
  }

  listarEspecificaciones(): Observable<{ id: number, nombre: string, precioAdicional: number }[]> {
    return this.http.get<{ id: number, nombre: string, precioAdicional: number }[]>(`${baserUrl}/especificaciones/listar`);
  }

  buscarEspecificacionesPorNombre(nombre: string): Observable<{ id: number, nombre: string, precioAdicional: number }[]> {
    return this.http.get<{ id: number, nombre: string, precioAdicional: number }[]>(`${baserUrl}/especificaciones/buscar`, { params: { nombre } });
  }

  agregarEspecificacion(productoId: number, especificacionId: number, cantidad: number): Observable<Producto> {
    const url = `${baserUrl}/productos/${productoId}/agregarEspecificacion/${especificacionId}`;
    return this.http.put<Producto>(url, { cantidad });
  }

  eliminarEspecificacion(productoId: number, especificacionId: number): Observable<Producto> {
    return this.http.put<Producto>(`${baserUrl}/productos/${productoId}/eliminarEspecificacion/${especificacionId}`, {});
  }

  obtenerProductos(): Observable<any> {
    return this.http.get(`${baserUrl}/productos/catalogo`);
  }

  filtrarProductos(filtros: any): Observable<any> {
    return this.http.post(`${baserUrl}/productos/filtrar`, filtros);
  }
}
