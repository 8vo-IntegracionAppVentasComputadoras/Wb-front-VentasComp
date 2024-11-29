import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { OrdenService } from 'src/app/services/orden.service';
import { AuthService } from 'src/app/services/auth.service';  // Si es necesario obtener el usuarioId
import Swal from 'sweetalert2';

@Component({
  selector: 'app-resumen-compra',
  templateUrl: './resumen-compra-page.component.html',
  styleUrls: ['./resumen-compra-page.component.css']
})
export class ResumenCompraPageComponent implements OnInit {
  ordenId: number = 0;
  montoTotal: number = 0;
  productos: any[] = [];
  nombreApellido: string = '';
  numeroTarjeta: string = '';
  fechaExpiracion: string = '';
  codigoSeguridad: string = '';
  dni: string = '';
  tarjetaCreditoError: string = '';
  cvvError: string = '';
  fechaExpiracionError: string = '';

  constructor(
    private route: ActivatedRoute,
    private ordenService: OrdenService,
    private authService: AuthService  // Si es necesario
  ) { }

  ngOnInit(): void {
    // Obtenemos el parámetro de la URL 'ordenId'
    this.route.queryParams.subscribe(params => {
      this.ordenId = params['ordenId'];
      console.log('Orden ID recibido:', this.ordenId);  // Verifica qué valor está tomando

      // Verificamos que el ordenId esté presente
      if (!this.ordenId) {
        Swal.fire('Error', 'ID de orden no válido.', 'error');
        return;
      }

      this.montoTotal = params['montoTotal'];
      this.cargarResumenDeCompra();
    });
  }


  cargarResumenDeCompra(): void {
    // Asegúrate de que el ordenId esté definido
    if (!this.ordenId) {
      Swal.fire('Error', 'ID de orden no válido.', 'error');
      return;
    }

    // Obtener el resumen de la compra usando el ordenId
    this.ordenService.obtenerResumenDeCompra(this.ordenId).subscribe({
      next: (resumen) => {
        // Asignar los productos y monto total a las variables
        this.productos = resumen.productos;
        this.montoTotal = resumen.montoTotal;
      },
      error: (error) => {
        Swal.fire('Error', 'No se pudo cargar el resumen de la compra.', 'error');
      }
    });
  }

  validarNumeroTarjeta(event: any): void {
    let input = event.target.value.replace(/\D/g, '');
    if (input.length > 16) {
      input = input.substring(0, 16);
    }
    this.numeroTarjeta = input.replace(/(.{4})/g, '$1 ').trim();
  }

  validarCVV(event: any): void {
    const input = event.target.value.replace(/\D/g, '').substring(0, 4);
    this.codigoSeguridad = input;
  }

  validarFechaExpiracion(event: any): void {
    let input = event.target.value.replace(/\D/g, '');
    if (input.length > 4) {
      input = input.substring(0, 4);
    }
    if (input.length > 2) {
      input = `${input.substring(0, 2)}/${input.substring(2, 4)}`;
    }
    this.fechaExpiracion = input;
  }

  esFormularioValido(): boolean {
    return this.numeroTarjeta.replace(/\s/g, '').length === 16 && this.codigoSeguridad.length >= 3 && this.codigoSeguridad.length <= 4 && /^[0-9]{2}\/[0-9]{2}$/.test(this.fechaExpiracion);
  }

  realizarPago(): void {
    if (!this.numeroTarjeta || !this.codigoSeguridad || !this.fechaExpiracion || !this.dni) {
      Swal.fire('Error', 'Debe ingresar todos los datos de la tarjeta.', 'error');
      return;
    }

    const pago = {
      orden: { id: this.ordenId },
      metodoPago: 'Tarjeta de Crédito',
      nombreApellido: this.nombreApellido,
      dni: this.dni
    };

    this.ordenService.realizarPago(pago).subscribe({
      next: (response) => {
        Swal.fire('Pago realizado', 'El pago se ha completado exitosamente.', 'success');
      },
      error: (error) => {
        Swal.fire('Error de Pago', 'Hubo un problema al procesar tu pago. Por favor, inténtalo de nuevo.', 'error');
      }
    });
  }
}
