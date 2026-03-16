import { Component, inject, signal } from '@angular/core';
import { Router, RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="flex h-screen bg-gray-50 overflow-hidden">

      <!-- Mobile backdrop -->
      @if (drawerOpen()) {
        <div class="fixed inset-0 bg-black/50 z-20 lg:hidden"
          (click)="drawerOpen.set(false)"></div>
      }

      <!-- Sidebar (desktop: always visible | mobile: slide-in drawer) -->
      <aside [class]="drawerOpen()
          ? 'translate-x-0'
          : '-translate-x-full lg:translate-x-0'"
        class="fixed lg:relative z-30 w-64 h-full bg-[#0f1e45] flex flex-col shrink-0 shadow-xl transition-transform duration-200 ease-in-out lg:transition-none">

        <!-- Brand -->
        <div class="px-5 py-5 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 bg-[#C9A84C] rounded-lg flex items-center justify-center shrink-0">
              <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"/>
              </svg>
            </div>
            <div>
              <div class="text-white font-semibold text-sm leading-tight">Krier Realty</div>
              <div class="text-[#C9A84C] text-xs font-medium">Admin</div>
            </div>
          </div>
          <!-- Close drawer (mobile only) -->
          <button (click)="drawerOpen.set(false)"
            class="lg:hidden text-white/50 hover:text-white p-1">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <div class="mx-5 border-t border-white/10"></div>

        <!-- Nav -->
        <nav class="flex-1 px-3 py-4 space-y-0.5">
          <p class="px-3 pt-2 pb-1 text-xs font-semibold text-white/30 uppercase tracking-widest">CRM</p>
          <a routerLink="/admin/leads" routerLinkActive="bg-white/10 text-white"
            (click)="drawerOpen.set(false)"
            class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-all text-sm font-medium">
            <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75"
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>
            </svg>
            Leads
          </a>
        </nav>

        <div class="mx-5 border-t border-white/10"></div>
        <!-- User -->
        <div class="px-4 py-4">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center shrink-0">
              <span class="text-white/70 text-xs font-semibold">
                {{ auth.currentUser?.email?.[0]?.toUpperCase() }}
              </span>
            </div>
            <div class="flex-1 min-w-0">
              <div class="text-white/70 text-xs truncate">{{ auth.currentUser?.email }}</div>
            </div>
            <button (click)="signOut()" title="Sign out"
              class="text-white/40 hover:text-white/80 transition p-1 rounded shrink-0">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75"
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
              </svg>
            </button>
          </div>
        </div>
      </aside>

      <!-- Main -->
      <div class="flex-1 flex flex-col min-w-0 overflow-hidden">

        <!-- Mobile top bar -->
        <header class="lg:hidden flex items-center justify-between px-4 py-3 bg-[#0f1e45] shadow-md shrink-0">
          <button (click)="drawerOpen.set(true)"
            class="text-white/70 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
            </svg>
          </button>
          <div class="flex items-center gap-2">
            <div class="w-6 h-6 bg-[#C9A84C] rounded flex items-center justify-center">
              <svg class="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"/>
              </svg>
            </div>
            <span class="text-white text-sm font-semibold">Admin</span>
          </div>
          <button (click)="signOut()"
            class="text-white/60 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75"
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
            </svg>
          </button>
        </header>

        <main class="flex-1 overflow-auto">
          <router-outlet/>
        </main>
      </div>
    </div>
  `,
})
export class AdminLayoutComponent {
  auth = inject(AuthService);
  private router = inject(Router);
  drawerOpen = signal(false);

  async signOut() {
    await this.auth.signOut();
    this.router.navigate(['/admin/login']);
  }
}
