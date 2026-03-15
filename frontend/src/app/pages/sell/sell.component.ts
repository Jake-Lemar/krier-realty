import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { LeadService } from '../../services/lead.service';
import { SeoService } from '../../services/seo.service';

@Component({
  selector: 'app-sell',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './sell.component.html',
  styleUrl: './sell.component.css'
})
export class SellComponent implements OnInit {
  valuationForm!: FormGroup;
  submitting = false;
  submitted = false;

  steps = [
    {
      number: '1',
      title: 'Free Home Valuation',
      description: 'Aaron will provide a comprehensive market analysis of your home using the latest comparable sales data in your neighborhood.',
      icon: 'home_work'
    },
    {
      number: '2',
      title: 'Strategic Marketing',
      description: 'Professional photography, 3D virtual tours, MLS listing, social media campaigns, and targeted outreach to qualified buyers.',
      icon: 'campaign'
    },
    {
      number: '3',
      title: 'Expert Negotiation',
      description: "Aaron's small-town persistence and market knowledge consistently deliver above-asking prices. His 98% list-to-sale ratio speaks for itself.",
      icon: 'handshake'
    }
  ];

  whyChoose = [
    { value: '150+', label: 'Homes Sold', icon: 'home' },
    { value: '12 Yrs', label: 'Omaha Expertise', icon: 'military_tech' },
    { value: '18 Days', label: 'Avg Time on Market', icon: 'timer' },
    { value: '98%', label: 'List-to-Sale Ratio', icon: 'trending_up' }
  ];

  constructor(
    private leadService: LeadService,
    private seoService: SeoService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.seoService.updateMeta({
      title: 'Sell Your Home in Omaha or Council Bluffs | Free Valuation | Aaron Krier REALTOR®',
      description: 'Sell your home on either side of the river. Get a free home valuation from Aaron Krier, dual-licensed REALTOR® serving Greater Omaha and Council Bluffs.'
    });

    this.valuationForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      address: ['', Validators.required],
      bedrooms: ['', Validators.required],
      condition: ['', Validators.required],
      notes: ['']
    });
  }

  onSubmit(): void {
    if (this.valuationForm.invalid) return;
    this.submitting = true;
    const v = this.valuationForm.value;
    this.leadService.submitLead({
      type: 'seller',
      name: v.name,
      email: v.email,
      phone: v.phone,
      address: v.address,
      message: `Bedrooms: ${v.bedrooms}, Condition: ${v.condition}. Notes: ${v.notes}`,
      source: 'sell-page'
    }).subscribe(() => {
      this.submitting = false;
      this.submitted = true;
    });
  }
}
