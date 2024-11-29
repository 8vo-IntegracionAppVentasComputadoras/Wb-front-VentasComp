import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-recuperar-contra',
  templateUrl: './recuperar-contra.component.html',
  styleUrls: ['./recuperar-contra.component.css']
})
export class RecuperarContraComponent {
  resetPasswordForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<RecuperarContraComponent>
  ) {
    this.resetPasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  onSendResetEmail() {
    if (this.resetPasswordForm.invalid) {
      Swal.fire({
        icon: 'error',
        title: 'Error en el formulario',
        text: 'Por favor, ingresa un correo válido.'
      });
      return;
    }

    const email = this.resetPasswordForm.value.email;
    console.log('Correo para restablecimiento:', email);

    // Aquí iría la lógica para enviar el correo al backend
    Swal.fire({
      icon: 'success',
      title: 'Correo enviado',
      text: 'Revisa tu correo para restablecer tu contraseña.'
    });
    this.dialogRef.close();
  }

  onClose() {
    this.dialogRef.close();
  }
}
