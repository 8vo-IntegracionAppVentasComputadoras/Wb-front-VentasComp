import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Producto } from 'src/app/models/interfaces/producto.interface';
import { ProductoService } from 'src/app/services/producto.service';
import { AuthService } from 'src/app/services/auth.service';
import { ComentarioService } from 'src/app/services/comentario.service';
import { Comentario } from 'src/app/models/interfaces/comentario.interface';
import Swal from 'sweetalert2';
import * as moment from 'moment';
import { Location } from '@angular/common';
import { OrdenService } from 'src/app/services/orden.service'; // Importar OrdenService

@Component({
  selector: 'app-detalles-productoo',
  templateUrl: './detalles-producto.component.html',
  styleUrls: ['./detalles-producto.component.css'],
})
export class DetallesProductoPageComponent implements OnInit {
  producto: Producto = {
    nombre: '',
    precio: 0,
    descripcion: '',
    imagen: '',
    stock: 0,
  };
  comentarios: Comentario[] = [];
  nuevoComentario: string = '';
  editandoComentario: Comentario | null = null;
  usuarioId: number | null = null;

  constructor(
    private route: ActivatedRoute,
    private productoService: ProductoService,
    public authService: AuthService,
    private comentarioService: ComentarioService,
    private ordenService: OrdenService, // Inyectar OrdenService
    private location: Location
  ) {}

  ngOnInit() {
    this.usuarioId = this.authService.getUsuarioId();
    console.log('Usuario autenticado ID:', this.usuarioId);
    this.route.params.subscribe((params) => {
      const id = +params['id'];
      this.cargarDetallesProducto(id);
      this.cargarComentarios(id);
    });
  }

  cargarDetallesProducto(id: number) {
    this.productoService.obtenerDetallesDelProducto(id).subscribe({
      next: (producto) => (this.producto = producto),
      error: (error) => console.error('Error al cargar el producto:', error),
    });
  }

  cargarComentarios(id: number) {
    this.comentarioService.listarComentariosPorProducto(id).subscribe({
      next: (comentarios) => {
        this.comentarios = comentarios.reverse(); // Invertir el orden de los comentarios
        console.log('Comentarios cargados:', this.comentarios);
      },
      error: (error) =>
        console.error('Error al cargar los comentarios:', error),
    });
  }

  agregarComentario() {
    if (this.nuevoComentario.trim() === '') return;

    const comentario: Comentario = {
      contenido: this.nuevoComentario,
      usuarioId: this.usuarioId!,
      productoId: this.producto.id!,
    };

    this.comentarioService
      .agregarComentario(comentario, this.producto.id!)
      .subscribe({
        next: (comentario) => {
          this.comentarios.unshift(comentario); // Agregar el nuevo comentario al principio de la lista
          this.nuevoComentario = '';
          console.log('Comentario agregado:', comentario);
        },
        error: (error) =>
          console.error('Error al agregar el comentario:', error),
      });
  }

  editarComentario(comentario: Comentario) {
    this.editandoComentario = { ...comentario };
    console.log('Editando comentario:', comentario);
  }

  guardarComentarioEditado() {
    if (this.editandoComentario) {
      const contenido = this.editandoComentario.contenido;
      this.comentarioService
        .editarComentario(
          this.editandoComentario.id!,
          this.usuarioId!,
          contenido
        )
        .subscribe({
          next: (comentarioActualizado) => {
            const index = this.comentarios.findIndex(
              (c) => c.id === comentarioActualizado.id
            );
            if (index !== -1) {
              this.comentarios[index].contenido =
                comentarioActualizado.contenido;
            }
            this.editandoComentario = null;
            console.log('Comentario editado:', comentarioActualizado);
          },
          error: (error) =>
            console.error('Error al editar el comentario:', error),
        });
    }
  }

  cancelarEdicion() {
    console.log('Edición cancelada');
    this.editandoComentario = null;
  }

  confirmarEliminarComentario(id: number) {
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'No podrás revertir esto',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        this.eliminarComentario(id);
      }
    });
  }

  eliminarComentario(id: number) {
    this.comentarioService.eliminarComentario(id, this.usuarioId!).subscribe({
      next: () => {
        this.comentarios = this.comentarios.filter((c) => c.id !== id);
        Swal.fire('Eliminado', 'El comentario ha sido eliminado', 'success');
        console.log('Comentario eliminado:', id);
      },
      error: (error) =>
        console.error('Error al eliminar el comentario:', error),
    });
  }

  isOwner(usuarioId: number): boolean {
    const isOwner = this.usuarioId === usuarioId;
    console.log(
      `Verificando propiedad del comentario: ${usuarioId} con usuario autenticado: ${this.usuarioId} - Resultado: ${isOwner}`
    );
    return isOwner;
  }

  formatearFecha(fecha: string): string {
    return moment(fecha).fromNow();
  }

  volverAtras() {
    this.location.back();
  }

  agregarAlCarrito(productoId: number) {
    if (!this.usuarioId) {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Debes iniciar sesión para agregar productos al carrito.',
      });
      return;
    }

    this.ordenService
      .agregarProductoAlCarrito(this.usuarioId, productoId)
      .subscribe({
        next: (respuesta) => {
          Swal.fire({
            title: '¡Éxito!',
            text: 'Producto añadido al carrito exitosamente.',
            icon: 'success',
            confirmButtonText: 'Ok',
          });
        },
        error: (error) => {
          if (error.status === 409) {
            Swal.fire({
              title: '¡Conflicto!',
              text: 'El producto ya está en el carrito.',
              icon: 'warning',
              confirmButtonText: 'Entendido',
            });
          } else {
            Swal.fire({
              title: 'Error',
              text: 'Error al agregar al carrito: ' + error.message,
              icon: 'error',
              confirmButtonText: 'Cerrar',
            });
            console.error('Error al agregar producto al carrito:', error);
          }
        },
      });
  }
  limpiarBase64(imagen: string): string {
    if (!imagen) {
      ; // Ruta a una imagen por defecto si la imagen no existe
    }

    // Regex para verificar si la imagen ya tiene el prefijo correcto
    const base64Regex = /^data:image\/(jpeg|png|gif|bmp|webp);base64,/;

    if (base64Regex.test(imagen)) {
      return imagen; // La imagen ya está en el formato correcto
    }

    // Si el prefijo falta o es incorrecto, añadimos uno por defecto
    return `data:image/jpeg;base64,${imagen}`;
  }
}
