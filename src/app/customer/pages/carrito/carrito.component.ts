import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { OrdenService } from 'src/app/services/orden.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-carrito',
  templateUrl: './carrito.component.html',
  styleUrls: ['./carrito.component.css']
})
export class CarritoPageComponent implements OnInit {
  ordenes: any[] = [];
  isLoading: boolean = false;
  tarjetaCredito: string = '';
  tarjetaCreditoError: string = '';
  cvv: string = '';
  cvvError: string = '';
  fechaExpiracion: string = '';
  fechaExpiracionError: string = '';
  metodoPago: string = 'Tarjeta de Crédito';
  montoTotal: number = 0;
  ordenIdParaPago: number | null = null;

  constructor(private ordenService: OrdenService, private authService: AuthService, private router: Router) { }


  ngOnInit(): void {
    this.cargarOrdenes();
  }

  cargarOrdenes(): void {
    const usuarioId = this.authService.getUsuarioId();
    if (!usuarioId) {
      Swal.fire('Error', 'No se pudo obtener el ID del usuario. Por favor, inicie sesión nuevamente.', 'error');
      return;
    }

    this.ordenService.listarOrdenesPorUsuario(usuarioId).subscribe({
      next: (data) => {
        console.log('Ordenes:', data);
        this.ordenes = data.reverse().map(orden => ({ ...orden, expandir: false }));
      },
      error: (error) => {
        Swal.fire('Error', 'No se pudo cargar los datos del carrito. Intente de nuevo más tarde.', 'error');
      }
    });
  }

  formatDate(fecha: string): string {
    const date = new Date(fecha);
    return date.toLocaleDateString('en-CA'); // Formato YYYY-MM-DD
  }

  validarNumeroTarjeta(event: any): void {
    let input = event.target.value.replace(/\D/g, ''); // Eliminar todos los caracteres que no sean dígitos
    if (input.length > 16) {
      input = input.substring(0, 16); // Limitar a 16 caracteres
    }
    this.tarjetaCredito = input.replace(/(.{4})/g, '$1 ').trim(); // Añadir espacio cada 4 dígitos
    if (input.length !== 16) {
      this.tarjetaCreditoError = 'El número de tarjeta debe tener 16 dígitos.';
    } else {
      this.tarjetaCreditoError = '';
    }
  }

  validarCVV(event: any): void {
    const input = event.target.value.replace(/\D/g, '').substring(0, 4); // Solo permite números y limita a 4 caracteres
    this.cvv = input;
    if (input.length < 3 || input.length > 4) {
      this.cvvError = 'El CVV debe tener 3 o 4 dígitos.';
    } else {
      this.cvvError = '';
    }
  }

  validarFechaExpiracion(event: any): void {
    let input = event.target.value.replace(/\D/g, ''); // Elimina cualquier carácter que no sea número
    if (input.length > 4) {
      input = input.substring(0, 4);
    }
    if (input.length > 2) {
      input = `${input.substring(0, 2)}/${input.substring(2, 4)}`;
    }
    this.fechaExpiracion = input;
    const regex = /^(0[1-9]|1[0-2])\/([0-9]{2})$/;
    if (!regex.test(input)) {
      this.fechaExpiracionError = 'La fecha de expiración debe tener el formato MM/AA.';
    } else {
      const currentYear = new Date().getFullYear() % 100;
      const [month, year] = input.split('/').map(Number);
      if (year < currentYear || (year === currentYear && month < new Date().getMonth() + 1)) {
        this.fechaExpiracionError = 'La fecha de expiración no puede ser menor a 2024.';
      } else {
        this.fechaExpiracionError = '';
      }
    }
  }

  esFormularioValido(): boolean {
    return !this.tarjetaCreditoError && !this.cvvError && !this.fechaExpiracionError &&
           this.tarjetaCredito.replace(/\s/g, '').length === 16 && this.cvv.length >= 3 && this.cvv.length <= 4 &&
           /^[0-9]{2}\/[0-9]{2}$/.test(this.fechaExpiracion);
  }

  cerrarModal(): void {
    const pagoModal = document.getElementById('pagoModal');
    if (pagoModal) {
      pagoModal.style.display = 'none';
    }
  }

  realizarPago(): void {
    if (!this.ordenIdParaPago || !this.tarjetaCredito || !this.cvv || !this.fechaExpiracion) {
      Swal.fire('Error', 'Debe ingresar todos los datos de la tarjeta.', 'error');
      return;
    }

    const pago = {
      orden: { id: this.ordenIdParaPago },
      metodoPago: this.metodoPago
    };

    this.ordenService.realizarPago(pago).subscribe({
      next: (response) => {
        console.log('Pago realizado:', response);
        Swal.fire('Pago realizado', 'El pago se ha completado exitosamente.', 'success').then(() => {
          this.cerrarModal();
          this.cargarOrdenes();
        });
      },
      error: (error) => {
        console.error('Error al realizar el pago:', error);
        Swal.fire('Error de Pago', 'Hubo un problema al procesar tu pago. Por favor, inténtalo de nuevo.', 'error');
      }
    });
  }

  removerProductoDeLaOrden(ordenId: number, productoId: number): void {
    if (!ordenId || !productoId) {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'El ID de la orden o del producto está indefinido.',
      });
      return;
    }

    Swal.fire({
      title: '¿Estás seguro?',
      text: "No podrás revertir esta acción!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar!',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.ordenService.eliminarProductoDeLaOrden(ordenId, productoId).subscribe({
          next: (response) => {
            console.log('Producto eliminado:', response);
            Swal.fire(
              'Eliminado!',
              'El producto ha sido eliminado del carrito.',
              'success'
            );
            this.cargarOrdenes();
          },
          error: (error) => {
            console.error('Error al eliminar el producto:', error);
            Swal.fire({
              icon: 'error',
              title: 'Error al eliminar',
              text: 'No se pudo eliminar el producto del carrito.',
            });
          }
        });
      }
    });
  }

  eliminarOrden(ordenId: number): void {
    Swal.fire({
      title: '¿Estás seguro?',
      text: "No podrás revertir esta acción!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar!',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.ordenService.eliminarOrden(ordenId).subscribe({
          next: () => {
            console.log('Orden eliminada');
            Swal.fire(
              'Eliminado!',
              'La orden ha sido eliminada.',
              'success'
            );
            this.cargarOrdenes();
          },
          error: (error) => {
            console.error('Error al eliminar la orden:', error);
            Swal.fire({
              icon: 'error',
              title: 'Error al eliminar',
              text: 'No se pudo eliminar la orden.',
            });
          }
        });
      }
    });
  }

  mostrarFormularioPago(ordenId: number, montoTotal: number): void {
    this.ordenIdParaPago = ordenId;
    this.montoTotal = montoTotal;

    // Redirigir a la página de Resumen Compra
    this.router.navigate(['user/resumen-compra' , ordenId]);
  }

  descargarComprobante(ordenId: number): void {
    if (!ordenId) {
      Swal.fire('Error', 'El ID de la orden no es válido.', 'error');
      return;
    }
    console.log(`Descargando comprobante para la orden ID: ${ordenId}`); // Log para verificar el ID
    this.ordenService.descargarComprobantePorOrden(ordenId).subscribe({
      next: (response: Blob) => {
        const url = window.URL.createObjectURL(response);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'comprobante_pago.pdf';
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: (error) => {
        console.error('Error al descargar el comprobante:', error);
        Swal.fire('Error', 'Hubo un problema al descargar el comprobante. Por favor, inténtalo de nuevo.', 'error');
      }
    });
  }
}
