import { Component, OnInit, ViewChild } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import { MatSlider } from '@angular/material/slider';
import { Router, NavigationEnd } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'shared-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  isLoggedIn: boolean = false;
  isAdmin: boolean = false;
  isUser: boolean = false; // Nueva variable para almacenar si el usuario tiene rol "USER"
  userName: string = '';  // Nueva variable para almacenar el nombre del usuario

  constructor(private authService: AuthService, private router: Router) {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        const url = this.router.url.split('#')[1];
        if (url) {
          this.scrollToSection(url);
        }
      }
    });
  }

  ngOnInit(): void {
    this.authService.isLoggedIn().subscribe(isLoggedIn => {
      this.isLoggedIn = isLoggedIn;
    });

    // Obtener el rol del usuario actual
    this.authService.getRole().subscribe(role => {
      this.isAdmin = role === 'ADMIN'; // Verificar si el rol es 'admin'
      this.isUser = role === 'USER'; // Verificar si el rol es 'user'
    });

    // Obtener el nombre del usuario actual
    this.authService.getUserName().subscribe(userName => {
      this.userName = userName;  // Almacenar el nombre del usuario
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/home']);
  }

  navigateToProfile(): void {
    if (this.isAdmin) {
      this.router.navigate(['/admin/perfil']);
    } else {
      this.router.navigate(['/user/perfil']);
    }
  }

  scrollToSection(section: string): void {
    setTimeout(() => {
      document.getElementById(section)?.scrollIntoView({ behavior: 'smooth' });
    }, 0);
  }

  goHome(){

    if(this.isUser)
      this.router.navigateByUrl('user/ver-catalogo')
      return
    this.router.navigateByUrl('home')
  }

  navigateAndScroll(section: string): void {

    if (this.router.url === '/home') {
      this.scrollToSection(section);
    } else {
      this.router.navigate(['/home'], { fragment: section });
    }
  }

  @ViewChild('drawer') drawer!: MatSidenav; // Referencia al Sidenav

  toggleDrawer() {
    this.drawer.toggle(); // Alterna entre abrir/cerrar el Sidenav
  }
}
