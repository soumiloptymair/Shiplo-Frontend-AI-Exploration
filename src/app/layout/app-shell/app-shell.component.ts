import { Component, signal, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { NavSidebarComponent } from '../nav-sidebar/nav-sidebar.component';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [CommonModule, RouterOutlet, NavSidebarComponent],
  templateUrl: './app-shell.component.html',
})
export class AppShellComponent {
  isCollapsed = signal(false);

  @HostListener('window:resize')
  onResize() {
    this.isCollapsed.set(window.innerWidth < 1024);
  }

  ngOnInit() {
    this.isCollapsed.set(window.innerWidth < 1024);
  }
}
