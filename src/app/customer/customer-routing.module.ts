import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CustomerLayoutPageComponent } from './layout/customer-layout-page/customer-layout-page.component';
import { VerCatalogoPageComponent } from './pages/vercatalogo/vercatalogo.component';
import { DetallesProductoPageComponent } from './pages/detalles-producto/detalles-producto.component';
import { CarritoPageComponent } from './pages/carrito/carrito.component';
import { FavoritosPageComponent } from './pages/favoritos/favoritos.component';
import { PerfilPageComponent } from '../shared/home/pages/perfil/perfil.component';
import { ResumenCompraPageComponent } from './pages/resumen-compra-page/resumen-compra-page.component';

const routes: Routes = [
  {
    path: '',
    component: CustomerLayoutPageComponent,
    children: [
      { path: 'ver-catalogo', component: VerCatalogoPageComponent },
      {
        path: 'producto-detallesuser/:id',
        component: DetallesProductoPageComponent,
      },
      { path: 'carrito', component: CarritoPageComponent },
      // { path: 'resumen-compra/:ordenId', component: ResumenCompraPageComponent },

      { path: 'resumen-compra/:ordenId', component: ResumenCompraPageComponent }, // Ruta para resumen de compra
      { path: 'favoritos', component: FavoritosPageComponent },
      { path: 'perfil', component: PerfilPageComponent },
      { path: '**', redirectTo: 'ver-catalogo'}
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CustomerRoutingModule {}
