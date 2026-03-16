import { Routes } from '@angular/router';
import { adminAuthGuard } from './guards/admin-auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'listings',
    loadComponent: () => import('./pages/listings/listings.component').then(m => m.ListingsComponent)
  },
  {
    path: 'property/:id',
    loadComponent: () => import('./pages/property-detail/property-detail.component').then(m => m.PropertyDetailComponent)
  },
  {
    path: 'sold',
    loadComponent: () => import('./pages/sold/sold.component').then(m => m.SoldComponent)
  },
  {
    path: 'sell',
    loadComponent: () => import('./pages/sell/sell.component').then(m => m.SellComponent)
  },
  {
    path: 'contact',
    loadComponent: () => import('./pages/contact/contact.component').then(m => m.ContactComponent)
  },
  {
    path: 'admin/login',
    loadComponent: () => import('./pages/admin/login/login.component').then(m => m.AdminLoginComponent)
  },
  {
    path: 'admin',
    loadComponent: () => import('./pages/admin/admin-layout/admin-layout.component').then(m => m.AdminLayoutComponent),
    canActivate: [adminAuthGuard],
    children: [
      { path: '', redirectTo: 'leads', pathMatch: 'full' },
      {
        path: 'leads',
        loadComponent: () => import('./pages/admin/leads/leads.component').then(m => m.AdminLeadsComponent)
      },
      {
        path: 'leads/new',
        loadComponent: () => import('./pages/admin/leads/create-lead/create-lead.component').then(m => m.CreateLeadComponent)
      },
      {
        path: 'leads/:id',
        loadComponent: () => import('./pages/admin/leads/lead-detail/lead-detail.component').then(m => m.LeadDetailComponent)
      },
    ]
  },
  {
    path: '**',
    redirectTo: ''
  }
];
