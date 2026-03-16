import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../../services/auth.service';
import { environment } from '../../../../../environments/environment';

type LeadType   = 'buyer' | 'seller' | 'contact' | 'tour';
type LeadStatus = 'new' | 'contacted' | 'qualified' | 'closed' | 'lost';
type LeadOrigin = 'website' | 'manual' | 'zillow' | 'realtor_com' | 'facebook' | 'referral' | 'cold_call' | 'other';

interface FormState {
  type: LeadType;
  name: string;
  email: string;
  phone: string;
  message: string;
  address: string;
  preferredContact: string;
  origin: LeadOrigin;
  source: string;
  status: LeadStatus;
  notes: string;
}

@Component({
  selector: 'app-create-lead',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="p-4 md:p-8 max-w-2xl">

      <!-- Back -->
      <a routerLink="/admin/leads"
        class="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-400 hover:text-gray-700 mb-6 transition-colors uppercase tracking-wide">
        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
        </svg>
        All Leads
      </a>

      <h1 class="text-xl md:text-2xl font-bold text-gray-900 mb-1">Add Lead</h1>
      <p class="text-sm text-gray-500 mb-7">Manually add a lead from an external platform or referral.</p>

      <form (ngSubmit)="submit()" class="space-y-5">

        <!-- Contact info -->
        <div class="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 md:p-6 space-y-4">
          <h2 class="text-xs font-semibold text-gray-400 uppercase tracking-wide">Contact Info</h2>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="sm:col-span-2">
              <label class="block text-xs font-medium text-gray-600 mb-1.5">Full Name <span class="text-red-400">*</span></label>
              <input [(ngModel)]="form.name" name="name" required
                placeholder="Jane Smith"
                class="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#0f1e45]/20 focus:border-[#0f1e45]"/>
            </div>

            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1.5">Email <span class="text-red-400">*</span></label>
              <input [(ngModel)]="form.email" name="email" type="email" required
                placeholder="jane@example.com"
                class="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#0f1e45]/20 focus:border-[#0f1e45]"/>
            </div>

            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1.5">Phone</label>
              <input [(ngModel)]="form.phone" name="phone" type="tel"
                placeholder="+1-402-555-0100"
                class="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#0f1e45]/20 focus:border-[#0f1e45]"/>
            </div>

            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1.5">Preferred Contact</label>
              <div class="relative">
                <select [(ngModel)]="form.preferredContact" name="preferredContact"
                  class="w-full appearance-none border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#0f1e45]/20 focus:border-[#0f1e45] pr-9">
                  <option value="">No preference</option>
                  <option value="phone">Phone</option>
                  <option value="email">Email</option>
                  <option value="text">Text</option>
                </select>
                <svg class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                </svg>
              </div>
            </div>

            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1.5">Address</label>
              <input [(ngModel)]="form.address" name="address"
                placeholder="123 Main St, Omaha, NE"
                class="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#0f1e45]/20 focus:border-[#0f1e45]"/>
            </div>
          </div>

          <div>
            <label class="block text-xs font-medium text-gray-600 mb-1.5">Message / Notes from Lead</label>
            <textarea [(ngModel)]="form.message" name="message" rows="3"
              placeholder="What did they tell you?"
              class="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#0f1e45]/20 focus:border-[#0f1e45] resize-none">
            </textarea>
          </div>
        </div>

        <!-- Lead classification -->
        <div class="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 md:p-6 space-y-4">
          <h2 class="text-xs font-semibold text-gray-400 uppercase tracking-wide">Classification</h2>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1.5">Type <span class="text-red-400">*</span></label>
              <div class="relative">
                <select [(ngModel)]="form.type" name="type" required
                  class="w-full appearance-none border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#0f1e45]/20 focus:border-[#0f1e45] pr-9">
                  <option value="buyer">Buyer</option>
                  <option value="seller">Seller</option>
                  <option value="contact">General Contact</option>
                  <option value="tour">Tour Request</option>
                </select>
                <svg class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                </svg>
              </div>
            </div>

            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1.5">Status</label>
              <div class="relative">
                <select [(ngModel)]="form.status" name="status"
                  class="w-full appearance-none border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#0f1e45]/20 focus:border-[#0f1e45] pr-9">
                  <option value="new">New</option>
                  <option value="contacted">Contacted</option>
                  <option value="qualified">Qualified</option>
                  <option value="closed">Closed</option>
                  <option value="lost">Lost</option>
                </select>
                <svg class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                </svg>
              </div>
            </div>

            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1.5">Origin <span class="text-red-400">*</span></label>
              <div class="relative">
                <select [(ngModel)]="form.origin" name="origin" required
                  class="w-full appearance-none border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#0f1e45]/20 focus:border-[#0f1e45] pr-9">
                  @for (o of originOptions; track o.value) {
                    <option [value]="o.value">{{ o.label }}</option>
                  }
                </select>
                <svg class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                </svg>
              </div>
            </div>

            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1.5">Source / Campaign</label>
              <input [(ngModel)]="form.source" name="source"
                placeholder="e.g. open-house-march, zillow-ad-q1"
                class="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#0f1e45]/20 focus:border-[#0f1e45]"/>
            </div>
          </div>
        </div>

        <!-- Internal notes -->
        <div class="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 md:p-6">
          <h2 class="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Internal Notes</h2>
          <textarea [(ngModel)]="form.notes" name="notes" rows="3"
            placeholder="Private notes for your records…"
            class="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#0f1e45]/20 focus:border-[#0f1e45] resize-none">
          </textarea>
        </div>

        @if (error()) {
          <div class="bg-red-50 border border-red-100 text-red-700 rounded-xl px-4 py-3 text-sm">{{ error() }}</div>
        }

        <!-- Actions -->
        <div class="flex items-center gap-3 pb-8">
          <button type="submit" [disabled]="submitting()"
            class="px-6 py-3 bg-[#0f1e45] text-white rounded-xl text-sm font-semibold hover:bg-[#1a2f5e] transition disabled:opacity-50 flex items-center gap-2 active:scale-[0.98]">
            @if (submitting()) {
              <div class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              Saving…
            } @else {
              Add Lead
            }
          </button>
          <a routerLink="/admin/leads"
            class="px-6 py-3 bg-gray-100 text-gray-600 rounded-xl text-sm font-semibold hover:bg-gray-200 transition">
            Cancel
          </a>
        </div>
      </form>
    </div>
  `,
})
export class CreateLeadComponent {
  private http = inject(HttpClient);
  private auth = inject(AuthService);
  private router = inject(Router);

  submitting = signal(false);
  error = signal('');

  form: FormState = {
    type: 'buyer',
    name: '',
    email: '',
    phone: '',
    message: '',
    address: '',
    preferredContact: '',
    origin: 'manual',
    source: '',
    status: 'new',
    notes: '',
  };

  originOptions = [
    { value: 'manual',      label: 'Manual Entry' },
    { value: 'referral',    label: 'Referral' },
    { value: 'zillow',      label: 'Zillow' },
    { value: 'realtor_com', label: 'Realtor.com' },
    { value: 'facebook',    label: 'Facebook' },
    { value: 'cold_call',   label: 'Cold Call' },
    { value: 'website',     label: 'Website' },
    { value: 'other',       label: 'Other' },
  ];

  submit() {
    if (!this.form.name.trim() || !this.form.email.trim()) {
      this.error.set('Name and email are required.');
      return;
    }
    this.submitting.set(true);
    this.error.set('');

    // Strip empty optional fields
    const payload = Object.fromEntries(
      Object.entries(this.form).filter(([, v]) => v !== '' && v !== null)
    );

    const headers = new HttpHeaders({ Authorization: `Bearer ${this.auth.getAccessToken()}` });

    this.http.post<{ data: { id: string } }>(
      `${environment.apiBaseUrl}/api/admin/leads`,
      payload,
      { headers }
    ).subscribe({
      next: res => this.router.navigate(['/admin/leads', res.data.id]),
      error: err => {
        this.error.set(err.error?.error ?? 'Failed to create lead.');
        this.submitting.set(false);
      },
    });
  }
}
