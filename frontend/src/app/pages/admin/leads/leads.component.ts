import { Component, inject, signal, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { environment } from '../../../../environments/environment';

type LeadStatus = 'new' | 'contacted' | 'qualified' | 'closed' | 'lost';

interface Lead {
  id: string;
  createdAt: string;
  type: string;
  name: string;
  email: string;
  phone: string | null;
  message: string | null;
  source: string | null;
  origin: string;
  status: LeadStatus;
  notes: string | null;
  propertyId: string | null;
  address: string | null;
}

@Component({
  selector: 'app-admin-leads',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="p-4 md:p-8">

      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="text-xl md:text-2xl font-bold text-gray-900">Leads</h1>
          @if (!loading()) {
            <p class="text-sm text-gray-500 mt-0.5">{{ total() }} total</p>
          }
        </div>
        <a routerLink="/admin/leads/new"
          class="inline-flex items-center gap-2 px-4 py-2.5 bg-[#0f1e45] text-white rounded-xl text-sm font-semibold hover:bg-[#1a2f5e] transition active:scale-[0.98] shrink-0">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
          </svg>
          <span class="hidden sm:inline">Add Lead</span>
        </a>
      </div>

      <!-- Filter tabs — scrollable on mobile -->
      <div class="flex gap-1 mb-5 bg-white border border-gray-200 rounded-xl p-1 shadow-sm overflow-x-auto w-full">
        @for (s of statusOptions; track s.value) {
          <button (click)="setStatus(s.value)"
            [class]="selectedStatus() === s.value
              ? 'bg-[#0f1e45] text-white shadow-sm'
              : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'"
            class="px-3 md:px-4 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap shrink-0">
            {{ s.label }}
          </button>
        }
      </div>

      <!-- Loading -->
      @if (loading()) {
        <div class="flex flex-col items-center justify-center py-32 gap-3">
          <div class="w-8 h-8 border-2 border-[#0f1e45]/20 border-t-[#0f1e45] rounded-full animate-spin"></div>
          <span class="text-sm text-gray-400">Loading leads…</span>
        </div>

      <!-- Error -->
      } @else if (error()) {
        <div class="bg-red-50 border border-red-100 text-red-700 rounded-xl p-4 text-sm flex items-start gap-3">
          <svg class="w-4 h-4 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
          </svg>
          {{ error() }}
        </div>

      <!-- Empty -->
      } @else if (leads().length === 0) {
        <div class="text-center py-32">
          <svg class="w-12 h-12 mx-auto mb-3 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>
          </svg>
          <p class="text-gray-400 font-medium">No leads found</p>
        </div>

      } @else {

        <!-- Mobile: card list -->
        <div class="md:hidden space-y-3">
          @for (lead of leads(); track lead.id) {
            <button (click)="viewLead(lead.id)"
              class="w-full text-left bg-white rounded-2xl border border-gray-200 shadow-sm p-4 hover:shadow-md hover:border-gray-300 transition-all active:scale-[0.99]">
              <div class="flex items-start justify-between gap-3 mb-3">
                <div class="flex items-center gap-3 min-w-0">
                  <div class="w-10 h-10 rounded-xl bg-[#0f1e45]/8 flex items-center justify-center shrink-0">
                    <span class="text-[#0f1e45] font-bold text-sm">{{ lead.name[0] }}</span>
                  </div>
                  <div class="min-w-0">
                    <div class="font-semibold text-gray-900 truncate">{{ lead.name }}</div>
                    <div class="text-gray-400 text-xs truncate">{{ lead.email }}</div>
                  </div>
                </div>
                <svg class="w-4 h-4 text-gray-300 shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                </svg>
              </div>
              <div class="flex items-center gap-2 flex-wrap">
                <span [class]="statusBadge(lead.status)"
                  class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold capitalize">
                  <span [class]="statusDot(lead.status)" class="w-1.5 h-1.5 rounded-full"></span>
                  {{ lead.status }}
                </span>
                <span [class]="typeBadge(lead.type)"
                  class="inline-flex px-2 py-0.5 rounded-full text-xs font-semibold capitalize">
                  {{ lead.type }}
                </span>
                <span [class]="originBadge(lead.origin)"
                  class="inline-flex px-2 py-0.5 rounded-full text-xs font-semibold">
                  {{ originLabel(lead.origin) }}
                </span>
                <span class="text-gray-400 text-xs ml-auto">{{ formatDate(lead.createdAt) }}</span>
              </div>
              @if (lead.phone) {
                <div class="text-gray-400 text-xs mt-1.5">{{ lead.phone }}</div>
              }
            </button>
          }
        </div>

        <!-- Desktop: table -->
        <div class="hidden md:block bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <table class="w-full text-sm">
            <thead>
              <tr class="bg-gray-50 border-b border-gray-200">
                <th class="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide w-36">Date</th>
                <th class="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Lead</th>
                <th class="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide w-28">Type</th>
                <th class="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide w-32">Status</th>
                <th class="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide w-32">Origin</th>
                <th class="px-5 py-3.5 w-16"></th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              @for (lead of leads(); track lead.id) {
                <tr class="hover:bg-blue-50/30 transition-colors cursor-pointer group"
                    (click)="viewLead(lead.id)">
                  <td class="px-5 py-4 text-gray-400 text-xs whitespace-nowrap">{{ formatDate(lead.createdAt) }}</td>
                  <td class="px-5 py-4">
                    <div class="font-semibold text-gray-900">{{ lead.name }}</div>
                    <div class="text-gray-400 text-xs mt-0.5">{{ lead.email }}</div>
                    @if (lead.phone) {
                      <div class="text-gray-400 text-xs">{{ lead.phone }}</div>
                    }
                  </td>
                  <td class="px-5 py-4">
                    <span [class]="typeBadge(lead.type)"
                      class="inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize">
                      {{ lead.type }}
                    </span>
                  </td>
                  <td class="px-5 py-4">
                    <span [class]="statusBadge(lead.status)"
                      class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize">
                      <span [class]="statusDot(lead.status)" class="w-1.5 h-1.5 rounded-full"></span>
                      {{ lead.status }}
                    </span>
                  </td>
                  <td class="px-5 py-4">
                    <span [class]="originBadge(lead.origin)"
                      class="inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold">
                      {{ originLabel(lead.origin) }}
                    </span>
                  </td>
                  <td class="px-5 py-4 text-right">
                    <span class="text-[#0f1e45] opacity-0 group-hover:opacity-100 transition text-xs font-semibold">
                      Open →
                    </span>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        @if (total() > limit) {
          <div class="flex items-center justify-between mt-5">
            <span class="text-xs text-gray-400">
              {{ offset() + 1 }}–{{ offset() + leads().length }} of {{ total() }}
            </span>
            <div class="flex gap-2">
              <button (click)="prevPage()" [disabled]="offset() === 0"
                class="px-4 py-2 text-xs font-medium border border-gray-200 rounded-lg bg-white text-gray-600 disabled:opacity-40 hover:bg-gray-50 transition">
                ← Prev
              </button>
              <button (click)="nextPage()" [disabled]="offset() + leads().length >= total()"
                class="px-4 py-2 text-xs font-medium border border-gray-200 rounded-lg bg-white text-gray-600 disabled:opacity-40 hover:bg-gray-50 transition">
                Next →
              </button>
            </div>
          </div>
        }
      }
    </div>
  `,
})
export class AdminLeadsComponent implements OnInit {
  private http = inject(HttpClient);
  private auth = inject(AuthService);
  private router = inject(Router);

  leads = signal<Lead[]>([]);
  total = signal(0);
  loading = signal(false);
  error = signal('');
  selectedStatus = signal<string>('');
  offset = signal(0);
  limit = 25;

  statusOptions = [
    { value: '', label: 'All' },
    { value: 'new', label: 'New' },
    { value: 'contacted', label: 'Contacted' },
    { value: 'qualified', label: 'Qualified' },
    { value: 'closed', label: 'Closed' },
    { value: 'lost', label: 'Lost' },
  ];

  ngOnInit() { this.load(); }

  setStatus(s: string) { this.selectedStatus.set(s); this.offset.set(0); this.load(); }
  prevPage() { this.offset.update(o => Math.max(0, o - this.limit)); this.load(); }
  nextPage() { this.offset.update(o => o + this.limit); this.load(); }
  viewLead(id: string) { this.router.navigate(['/admin/leads', id]); }

  private load() {
    this.loading.set(true);
    this.error.set('');
    const params: Record<string, string> = { limit: String(this.limit), offset: String(this.offset()) };
    if (this.selectedStatus()) params['status'] = this.selectedStatus();
    const qs = new URLSearchParams(params).toString();
    const headers = new HttpHeaders({ Authorization: `Bearer ${this.auth.getAccessToken()}` });

    this.http.get<{ data: Lead[], total: number }>(`${environment.apiBaseUrl}/api/admin/leads?${qs}`, { headers })
      .subscribe({
        next: res => { this.leads.set(res.data); this.total.set(res.total); this.loading.set(false); },
        error: err => {
          this.error.set(err.status === 403 ? 'Your account does not have admin access.' : 'Failed to load leads.');
          this.loading.set(false);
        },
      });
  }

  formatDate(iso: string) {
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
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
