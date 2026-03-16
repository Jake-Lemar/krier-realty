import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="min-h-screen bg-[#F5F0E8] flex flex-col">

      <!-- Header -->
      <header class="px-6 py-4">
        <a routerLink="/" class="inline-flex items-center gap-2.5 group">
          <div class="w-8 h-8 bg-[#1B2B5E] rounded-lg flex items-center justify-center shrink-0">
            <svg class="w-4 h-4 text-[#C9A84C]" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"/>
            </svg>
          </div>
          <div>
            <div class="text-[#1B2B5E] font-semibold text-sm leading-tight group-hover:text-[#C9A84C] transition-colors">Aaron Krier</div>
            <div class="text-gray-400 text-xs">REALTOR®</div>
          </div>
        </a>
      </header>

    <div class="flex-1 flex items-center justify-center p-4">
      <div class="bg-white rounded-2xl shadow-xl w-full max-w-sm p-8">
        <!-- Logo / Brand -->
        <div class="text-center mb-8">
          <div class="w-14 h-14 bg-[#1B2B5E] rounded-xl flex items-center justify-center mx-auto mb-4">
            <span class="text-[#C9A84C] text-2xl">🏠</span>
          </div>
          <h1 class="text-2xl font-bold text-[#1B2B5E]">Krier Realty</h1>
          <p class="text-gray-500 text-sm mt-1">Admin Portal</p>
        </div>

        @if (error()) {
          <div class="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm mb-4">
            {{ error() }}
          </div>
        }

        @if (emailSent()) {
          <!-- Success state -->
          <div class="text-center py-2">
            <div class="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg class="w-6 h-6 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
              </svg>
            </div>
            <p class="text-gray-800 font-semibold text-sm mb-1">Check your email</p>
            <p class="text-gray-400 text-xs">We sent a login link to <span class="font-medium text-gray-600">{{ emailInput }}</span></p>
            <button (click)="emailSent.set(false)" class="mt-4 text-xs text-gray-400 hover:text-gray-600 transition">
              Use a different email
            </button>
          </div>
        } @else {
          <div class="space-y-3">

            <!-- Email magic link -->
            <div>
              <label class="block text-xs font-medium text-gray-500 mb-1.5">Email address</label>
              <input [(ngModel)]="emailInput" type="email" placeholder="you@example.com"
                (keydown.enter)="signInEmail()"
                class="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#1B2B5E]/20 focus:border-[#1B2B5E]"/>
            </div>
            <button (click)="signInEmail()" [disabled]="loading() || !emailInput"
              class="w-full flex items-center justify-center gap-2 bg-[#1B2B5E] text-white rounded-lg px-4 py-3 text-sm font-medium hover:bg-[#152247] transition disabled:opacity-50">
              @if (loading()) {
                <div class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              }
              Send Login Link
            </button>

            <div class="relative flex items-center gap-3 py-1">
              <div class="flex-1 border-t border-gray-200"></div>
              <span class="text-xs text-gray-400 shrink-0">or</span>
              <div class="flex-1 border-t border-gray-200"></div>
            </div>

            <!-- Google -->
            <button (click)="signInGoogle()" [disabled]="loading()"
              class="w-full flex items-center justify-center gap-3 border border-gray-300 rounded-lg px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition disabled:opacity-50">
              <svg class="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>
          </div>

          <p class="text-center text-xs text-gray-400 mt-5">
            Access restricted to authorized users
          </p>
        }
      </div>
    </div>
    </div>
  `,
})
export class AdminLoginComponent {
  private auth = inject(AuthService);
  private router = inject(Router);

  loading = signal(false);
  error = signal('');
  emailSent = signal(false);
  emailInput = '';

  async signInEmail() {
    if (!this.emailInput) return;
    this.loading.set(true);
    this.error.set('');
    const { error } = await this.auth.signInWithEmail(this.emailInput);
    if (error) {
      this.error.set(error.message);
    } else {
      this.emailSent.set(true);
    }
    this.loading.set(false);
  }

  async signInGoogle() {
    this.loading.set(true);
    this.error.set('');
    const { error } = await this.auth.signInWithGoogle();
    if (error) {
      this.error.set(error.message);
      this.loading.set(false);
    }
  }
}
