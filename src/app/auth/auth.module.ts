import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AuthRoutingModule } from './auth-routing.module';

// Angular Material Modules
import { MatTabsModule } from '@angular/material/tabs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatToolbarModule } from '@angular/material/toolbar'; // Faltante para <mat-toolbar>
import { MatDialogModule } from '@angular/material/dialog'; // Faltante para <mat-dialog-content>

// Components
import { LoginRegisterPageComponent } from './pages/login-register/login-register-page/login-register-page.component';
import { AuthLayoutPageComponent } from './layout/auth-layout-page/auth-layout-page.component';
import { RecuperarContraComponent } from './pages/modal/recuperar-contra/recuperar-contra.component';

@NgModule({
  imports: [
    RouterModule,
    ReactiveFormsModule,
    FormsModule,
    CommonModule,
    AuthRoutingModule,
    MatTabsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatToolbarModule, // Añadido para la toolbar
    MatDialogModule, // Añadido para el diálogo
  ],
  declarations: [
    LoginRegisterPageComponent,
    AuthLayoutPageComponent,
    RecuperarContraComponent,
  ],
})
export class AuthModule {}
