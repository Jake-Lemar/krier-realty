import { Component, signal } from '@angular/core';
import { Router, NavigationEnd, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs/operators';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { ChatWindowComponent } from './components/chat-window/chat-window.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, FooterComponent, ChatWindowComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'real-estate';
  isAdminRoute = signal(false);

  constructor(router: Router) {
    router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe((e) => {
        this.isAdminRoute.set((e as NavigationEnd).urlAfterRedirects.startsWith('/admin'));
      });
  }
}
