import { Component, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../../services/auth.service';
import { environment } from '../../../../../environments/environment';

type LeadStatus = 'new' | 'contacted' | 'qualified' | 'closed' | 'lost';
type LeadOrigin = 'website' | 'manual' | 'zillow' | 'realtor_com' | 'facebook' | 'referral' | 'cold_call' | 'other';

interface Lead {
  id: string;
  createdAt: string;
  updatedAt: string;
  type: string;
  name: string;
  email: string;
  phone: string | null;
  message: string | null;
  source: string | null;
  origin: LeadOrigin;
  status: LeadStatus;
  notes: string | null;
  propertyId: string | null;
  address: string | null;
  preferredContact: string | null;
}

@Component({
  selector: 'app-lead-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="p-4 md:p-8 max-w-5xl">

      <!-- Back -->
      <a routerLink="/admin/leads"
        class="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-400 hover:text-gray-700 mb-6 transition-colors uppercase tracking-wide">
        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
        </svg>
        All Leads
      </a>

      @if (loading()) {
        <div class="flex items-center justify-center py-32">
          <div class="w-8 h-8 border-2 border-[#0f1e45]/20 border-t-[#0f1e45] rounded-full animate-spin"></div>
        </div>
      } @else if (loadError()) {
        <div class="bg-red-50 border border-red-100 text-red-700 rounded-xl p-4 text-sm">{{ loadError() }}</div>
      } @else if (lead()) {

        <!-- lg: 2-col grid | mobile: single column -->
        <div class="flex flex-col lg:grid lg:grid-cols-3 gap-4">

          <!-- Left col — identity + message -->
          <div class="lg:col-span-2 space-y-4">

            <!-- Identity -->
            <div class="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 md:p-6">
              <!-- Name + badges row -->
              <div class="flex items-start gap-4 mb-5">
                <div class="w-11 h-11 md:w-12 md:h-12 bg-[#0f1e45]/8 rounded-xl flex items-center justify-center shrink-0">
                  <span class="text-[#0f1e45] font-bold text-base md:text-lg">{{ lead()!.name[0] }}</span>
                </div>
                <div class="flex-1 min-w-0">
                  <div class="flex flex-wrap items-center gap-2 mb-1">
                    <h1 class="text-lg md:text-xl font-bold text-gray-900 leading-tight">{{ lead()!.name }}</h1>
                  </div>
                  <p class="text-gray-500 text-sm truncate">{{ lead()!.email }}</p>
                  @if (lead()!.phone) {
                    <p class="text-gray-500 text-sm">{{ lead()!.phone }}</p>
                  }
                </div>
                <!-- Badges — top right on desktop, below name on mobile -->
                <div class="hidden sm:flex gap-2 shrink-0">
                  <span [class]="typeBadge(lead()!.type)"
                    class="inline-flex px-2.5 py-1 rounded-full text-xs font-semibold capitalize">
                    {{ lead()!.type }}
                  </span>
                  <span [class]="statusBadge(lead()!.status)"
                    class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold capitalize">
                    <span [class]="statusDot(lead()!.status)" class="w-1.5 h-1.5 rounded-full"></span>
                    {{ lead()!.status }}
                  </span>
                </div>
              </div>

              <!-- Mobile badges -->
              <div class="flex sm:hidden gap-2 mb-4">
                <span [class]="typeBadge(lead()!.type)"
                  class="inline-flex px-2.5 py-1 rounded-full text-xs font-semibold capitalize">
                  {{ lead()!.type }}
                </span>
                <span [class]="statusBadge(lead()!.status)"
                  class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold capitalize">
                  <span [class]="statusDot(lead()!.status)" class="w-1.5 h-1.5 rounded-full"></span>
                  {{ lead()!.status }}
                </span>
              </div>

              <!-- Meta grid -->
              <div class="grid grid-cols-2 gap-x-6 gap-y-3 text-sm border-t border-gray-100 pt-4">
                <div>
                  <div class="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-0.5">Submitted</div>
                  <div class="text-gray-700 text-sm">{{ formatDate(lead()!.createdAt) }}</div>
                </div>
                <div>
                  <div class="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-0.5">Updated</div>
                  <div class="text-gray-700 text-sm">{{ formatDate(lead()!.updatedAt) }}</div>
                </div>
                <div>
                  <div class="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-0.5">Origin</div>
                  <span [class]="originBadge(lead()!.origin)"
                    class="inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold">
                    {{ originLabel(lead()!.origin) }}
                  </span>
                </div>
                @if (lead()!.source) {
                  <div>
                    <div class="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-0.5">Source</div>
                    <div class="text-gray-700 text-sm">{{ lead()!.source }}</div>
                  </div>
                }
                @if (lead()!.preferredContact) {
                  <div>
                    <div class="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-0.5">Prefers</div>
                    <div class="text-gray-700 text-sm capitalize">{{ lead()!.preferredContact }}</div>
                  </div>
                }
                @if (lead()!.address) {
                  <div class="col-span-2">
                    <div class="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-0.5">Address</div>
                    <div class="text-gray-700 text-sm">{{ lead()!.address }}</div>
                  </div>
                }
                @if (lead()!.propertyId) {
                  <div class="col-span-2">
                    <div class="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-0.5">Property</div>
                    <div class="text-gray-700 text-sm">{{ lead()!.propertyId }}</div>
                  </div>
                }
              </div>
            </div>

            <!-- Message -->
            @if (lead()!.message) {
              <div class="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 md:p-6">
                <div class="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Message</div>
                <p class="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">{{ lead()!.message }}</p>
              </div>
            }
          </div>

          <!-- Right col — actions + update -->
          <div class="space-y-4">

            <!-- Quick actions -->
            <div class="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
              <div class="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Quick Actions</div>
              <div class="space-y-2">
                <a [href]="'mailto:' + lead()!.email"
                  class="flex items-center gap-2.5 w-full px-4 py-3 bg-[#0f1e45] text-white rounded-xl text-sm font-semibold hover:bg-[#1a2f5e] transition active:scale-[0.98]">
                  <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                  </svg>
                  Send Email
                </a>
                @if (lead()!.phone) {
                  <a [href]="'tel:' + lead()!.phone"
                    class="flex items-center gap-2.5 w-full px-4 py-3 bg-gray-50 text-gray-700 border border-gray-200 rounded-xl text-sm font-semibold hover:bg-gray-100 transition active:scale-[0.98]">
                    <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                    </svg>
                    Call {{ lead()!.phone }}
                  </a>
                }
              </div>
            </div>

            <!-- Update -->
            <div class="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
              <div class="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Update Lead</div>
              <div class="space-y-3">

                <div>
                  <label class="block text-xs font-medium text-gray-600 mb-1.5">Status</label>
                  <div class="relative">
                    <select [ngModel]="editStatus()" (ngModelChange)="editStatus.set($event)"
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
                  <label class="block text-xs font-medium text-gray-600 mb-1.5">Origin</label>
                  <div class="relative">
                    <select [ngModel]="editOrigin()" (ngModelChange)="editOrigin.set($event)"
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
                  <label class="block text-xs font-medium text-gray-600 mb-1.5">Internal Notes</label>
                  <textarea [ngModel]="editNotes()" (ngModelChange)="editNotes.set($event)"
                    rows="5" placeholder="Add notes…"
                    class="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#0f1e45]/20 focus:border-[#0f1e45] resize-none">
                  </textarea>
                </div>

                @if (saveError()) {
                  <div class="text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                    {{ saveError() }}
                  </div>
                }

                <button (click)="save()" [disabled]="saving()"
                  class="w-full py-3 bg-[#0f1e45] text-white rounded-xl text-sm font-semibold hover:bg-[#1a2f5e] transition disabled:opacity-50 flex items-center justify-center gap-2 active:scale-[0.98]">
                  @if (saving()) {
                    <div class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Saving…
                  } @else if (saved()) {
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/>
                    </svg>
                    Saved
                  } @else {
                    Save Changes
                  }
                </button>
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  `,
})
export class LeadDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private http = inject(HttpClient);
  private auth = inject(AuthService);

  lead = signal<Lead | null>(null);
  loading = signal(false);
  loadError = signal('');
  saving = signal(false);
  saved = signal(false);
  saveError = signal('');

  editStatus = signal<LeadStatus>('new');
  editOrigin = signal<LeadOrigin>('website');
  editNotes = signal('');

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

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.loading.set(true);
    const headers = new HttpHeaders({ Authorization: `Bearer ${this.auth.getAccessToken()}` });

    this.http.get<{ data: Lead }>(`${environment.apiBaseUrl}/api/admin/leads/${id}`, { headers })
      .subscribe({
        next: res => {
          this.lead.set(res.data);
          this.editStatus.set(res.data.status);
          this.editOrigin.set(res.data.origin);
          this.editNotes.set(res.data.notes ?? '');
          this.loading.set(false);
        },
        error: () => { this.loadError.set('Failed to load lead.'); this.loading.set(false); },
      });
  }

  save() {
    this.saving.set(true);
    this.saved.set(false);
    this.saveError.set('');

    const id = this.lead()!.id;
    const headers = new HttpHeaders({ Authorization: `Bearer ${this.auth.getAccessToken()}` });

    this.http.patch<{ data: Lead }>(
      `${environment.apiBaseUrl}/api/admin/leads/${id}`,
      { status: this.editStatus(), origin: this.editOrigin(), notes: this.editNotes() },
      { headers }
    ).subscribe({
      next: res => {
        this.lead.set(res.data);
        this.saving.set(false);
        this.saved.set(true);
        setTimeout(() => this.saved.set(false), 3000);
      },
      error: err => {
        this.saveError.set(err.error?.error ?? 'Failed to save. Please try again.');
        this.saving.set(false);
      },
    });
  }

  formatDate(iso: string) {
    return new Date(iso).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' });
  }

  originLabel(o: string): string {
    const m: Record<string, string> = {
      website: 'Website', manual: 'Manual', zillow: 'Zillow',
      realtor_com: 'Realtor.com', facebook: 'Facebook',
      referral: 'Referral', cold_call: 'Cold Call', other: 'Other',
    };
    return m[o] ?? o;
  }

  originBadge(o: string): string {
    const m: Record<string, string> = {
      website:     'bg-slate-50 text-slate-600 ring-1 ring-slate-200',
      manual:      'bg-zinc-50 text-zinc-600 ring-1 ring-zinc-200',
      zillow:      'bg-blue-50 text-blue-700 ring-1 ring-blue-100',
      realtor_com: 'bg-red-50 text-red-700 ring-1 ring-red-100',
      facebook:    'bg-indigo-50 text-indigo-700 ring-1 ring-indigo-100',
      referral:    'bg-teal-50 text-teal-700 ring-1 ring-teal-100',
      cold_call:   'bg-yellow-50 text-yellow-700 ring-1 ring-yellow-100',
      other:       'bg-gray-50 text-gray-600 ring-1 ring-gray-200',
    };
    return m[o] ?? 'bg-gray-50 text-gray-600';
  }

  statusBadge(s: string): string {
    const m: Record<string, string> = {
      new: 'bg-blue-50 text-blue-700 ring-1 ring-blue-100',
      contacted: 'bg-amber-50 text-amber-700 ring-1 ring-amber-100',
      qualified: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100',
      closed: 'bg-gray-100 text-gray-500 ring-1 ring-gray-200',
      lost: 'bg-red-50 text-red-600 ring-1 ring-red-100',
    };
    return m[s] ?? 'bg-gray-100 text-gray-500';
  }

  statusDot(s: string): string {
    const m: Record<string, string> = {
      new: 'bg-blue-500', contacted: 'bg-amber-500',
      qualified: 'bg-emerald-500', closed: 'bg-gray-400', lost: 'bg-red-500',
    };
    return m[s] ?? 'bg-gray-400';
  }

  typeBadge(t: string): string {
    const m: Record<string, string> = {
      buyer: 'bg-sky-50 text-sky-700 ring-1 ring-sky-100',
      seller: 'bg-violet-50 text-violet-700 ring-1 ring-violet-100',
      tour: 'bg-orange-50 text-orange-700 ring-1 ring-orange-100',
      contact: 'bg-gray-50 text-gray-600 ring-1 ring-gray-200',
    };
    return m[t] ?? 'bg-gray-50 text-gray-600';
  }
}
