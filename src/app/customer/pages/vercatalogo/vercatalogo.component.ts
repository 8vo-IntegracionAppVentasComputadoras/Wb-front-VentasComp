import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { ProductoService } from '../../../services/producto.service';
import { Producto } from 'src/app/models/interfaces/producto.interface';
import Swal from 'sweetalert2';
import { OrdenService } from 'src/app/services/orden.service';
import { FavoritoService } from 'src/app/services/favorito.service';

@Component({
  selector: 'app-vercatalogo',
  templateUrl: './vercatalogo.component.html',
  styleUrls: ['./vercatalogo.component.css']
})
export class VerCatalogoPageComponent implements OnInit {

  productos: Producto[] = [];
  filteredProductos: Producto[] = [];
  searchQuery: string = '';
  favoritosIds: number[] = [];
  mostrandoFavoritos: boolean = false;
  ramBusqueda: string = '';
  procesadorBusqueda: string = '';
  tarjetaGraficaBusqueda: string = '';
  precioMin: number | null = 0;
  enStock: boolean = false;

  constructor(
    private router: Router,
    private productoService: ProductoService,
    private authService: AuthService,
    private ordenService: OrdenService,
    private favoritoService: FavoritoService
  ) {}

  ngOnInit() {
    this.cargarProductos();
    this.cargarFavoritos();
  }

  cargarProductos(): void {
    this.productoService.obtenerCatalogoCompleto().subscribe({
      next: (productos) => {
        console.log('Productos recibidos:', productos);
        this.productos = this.filteredProductos = productos;
        this.filtrarProductos();
      },
      error: (error) => {
        console.error('Error al cargar los productos:', error);
      }
    });
  }


  cargarFavoritos(): void {
    const usuarioId = this.authService.getUsuarioId();
    if (usuarioId) {
      this.favoritoService.listarFavoritosPorUsuario(usuarioId).subscribe({
        next: (favoritos) => {
          this.favoritosIds = favoritos.map(favorito => favorito.id!); // Aseguramos que el id no sea undefined
        },
        error: (error) => {
          console.error('Error al cargar los favoritos:', error);
        }
      });
    }
  }

  agregarAlCarrito(productoId: number): void {
    const usuarioId = this.authService.getUsuarioId();
    if (!usuarioId) {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Debes iniciar sesión para agregar productos al carrito.',
      });
      return;
    }

    this.ordenService.agregarProductoAlCarrito(usuarioId, productoId).subscribe({
      next: (respuesta) => {
        Swal.fire({
          title: '¡Éxito!',
          text: 'Producto añadido al carrito exitosamente.',
          icon: 'success',
          confirmButtonText: 'Ok'
        });
      },
      error: (error) => {
        if (error.status === 409) {
          Swal.fire({
            title: '¡Conflicto!',
            text: 'El producto ya está en el carrito.',
            icon: 'warning',
            confirmButtonText: 'Entendido'
          });
        } else {
          Swal.fire({
            title: 'Error',
            text: 'Error al agregar al carrito: ' + error.message,
            icon: 'error',
            confirmButtonText: 'Cerrar'
          });
          console.error('Error al agregar producto al carrito:', error);
        }
      }
    });
  }

  agregarAFavoritos(productoId: number): void {
    const usuarioId = this.authService.getUsuarioId();
    if (!usuarioId) {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Debes iniciar sesión para agregar productos a favoritos.',
      });
      return;
    }

    this.favoritoService.agregarAFavoritos(usuarioId, productoId).subscribe({
      next: (respuesta) => {
        Swal.fire({
          title: '¡Éxito!',
          text: 'Producto añadido a favoritos exitosamente.',
          icon: 'success',
          confirmButtonText: 'Ok'
        });
        this.favoritosIds.push(productoId);
      },
      error: (error) => {
        Swal.fire({
          title: 'Error',
          text: 'Error al agregar producto a favoritos: ' + error.message,
          icon: 'error',
          confirmButtonText: 'Cerrar'
        });
        console.error('Error al agregar producto a favoritos:', error);
      }
    });
  }

  eliminarDeFavoritos(productoId: number): void {
    const usuarioId = this.authService.getUsuarioId();
    if (!usuarioId) {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Debes iniciar sesión para eliminar productos de favoritos.',
      });
      return;
    }

    Swal.fire({
      title: '¿Estás seguro?',
      text: "No podrás revertir esto",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.favoritoService.eliminarDeFavoritos(usuarioId, productoId).subscribe({
          next: () => {
            Swal.fire({
              title: 'Eliminado',
              text: 'Producto eliminado de tus favoritos.',
              icon: 'success',
              confirmButtonText: 'Ok'
            });
            this.favoritosIds = this.favoritosIds.filter(id => id !== productoId);
            if (this.mostrandoFavoritos) {
              this.filteredProductos = this.filteredProductos.filter(producto => producto.id !== productoId);
            }
          },
          error: (error) => {
            Swal.fire({
              title: 'Error',
              text: 'Error al eliminar producto de favoritos: ' + error.message,
              icon: 'error',
              confirmButtonText: 'Cerrar'
            });
            console.error('Error al eliminar producto de favoritos:', error);
          }
        });
      }
    });
  }

  mostrarFavoritos(): void {
    if (this.mostrandoFavoritos) {
      this.filteredProductos = this.productos;
    } else {
      this.filteredProductos = this.productos.filter(producto => this.favoritosIds.includes(producto.id || -1));
    }
    this.mostrandoFavoritos = !this.mostrandoFavoritos;
  }

  onSearch(): void {
    this.filtrarProductos();
  }

  private filtrarProductos(): void {
    this.filteredProductos = this.productos.filter(producto => {
      const cumpleRam = this.ramBusqueda === '' || producto.especificacionesDisponibles?.some(e => e.nombre.toLowerCase().includes(this.ramBusqueda.toLowerCase()));
      const cumpleProcesador = this.procesadorBusqueda === '' || producto.especificacionesDisponibles?.some(e => e.nombre.toLowerCase().includes(this.procesadorBusqueda.toLowerCase()));
      const cumpleTarjetaGrafica = this.tarjetaGraficaBusqueda === '' || producto.especificacionesDisponibles?.some(e => e.nombre.toLowerCase().includes(this.tarjetaGraficaBusqueda.toLowerCase()));
      const cumplePrecioMin = this.precioMin === null || producto.precio >= this.precioMin;
      const cumpleStock = !this.enStock || (this.enStock && producto.stock > 0);
      const cumpleBusqueda = this.searchQuery === '' || producto.nombre.toLowerCase().includes(this.searchQuery.toLowerCase()) || producto.descripcion?.toLowerCase().includes(this.searchQuery.toLowerCase());

      return cumpleRam && cumpleProcesador && cumpleTarjetaGrafica && cumplePrecioMin && cumpleStock && cumpleBusqueda;
    });

  }

  verDetalles(productoId: number): void {
    this.router.navigate(['/user/producto-detallesuser', productoId]);
  }

  limpiarBase64(imagen: string): string {
    if (!imagen) {
      return 'assets/placeholder-image.png'; // Imagen por defecto si no hay datos
    }

    // Eliminar prefijos redundantes
    const base64Regex = /^data:image\/(jpeg|png|gif|bmp|webp);base64,/;
    if (base64Regex.test(imagen)) {
      return imagen; // Si ya tiene el formato correcto
    }

    // Si el prefijo falta, lo añadimos
    return `data:image/jpeg;base64,${imagen}`;
  }

}
