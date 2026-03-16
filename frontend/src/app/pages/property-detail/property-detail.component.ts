import { Component, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { PropertyService } from '../../services/property.service';
import { SeoService } from '../../services/seo.service';
import { LeadService } from '../../services/lead.service';
import { Property } from '../../models/property.model';

@Component({
  selector: 'app-property-detail',
  standalone: true,
  imports: [
    CommonModule,
    CurrencyPipe,
    RouterLink,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatDividerModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './property-detail.component.html',
  styleUrl: './property-detail.component.css'
})
export class PropertyDetailComponent implements OnInit {
  property: Property | undefined;
  loading = true;
  activeImageIndex = 0;
  leadForm!: FormGroup;
  submitting = false;
  submitted = false;

  constructor(
    private propertyService: PropertyService,
    private seoService: SeoService,
    private leadService: LeadService,
    private route: ActivatedRoute,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.leadForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      message: ["I'm interested in this property and would like to schedule a showing."]
    });

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.propertyService.getListingById(id).subscribe(property => {
        this.property = property;
        this.loading = false;
        if (property) {
          this.seoService.updateMeta({
            title: `${property.address}, ${property.city} | $${property.price.toLocaleString()} | Omaha Property Group`,
            description: `${property.bedrooms} bed, ${property.bathrooms} bath home in ${property.neighborhood}, Omaha. ${property.sqft.toLocaleString()} sq ft. Listed at $${property.price.toLocaleString()}. MLS# ${property.mlsNumber}.`,
            image: property.images[0],
            canonical: `/property/${property.id}`
          });
        }
      });
    }
  }

  setActiveImage(index: number): void {
    this.activeImageIndex = index;
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'active': return 'Active Listing';
      case 'pending': return 'Under Contract';
      case 'sold': return 'Sold';
      default: return status;
    }
  }

  onSubmitLead(): void {
    if (this.leadForm.invalid || !this.property) return;
    this.submitting = true;
    const v = this.leadForm.value;
    this.leadService.submitLead({
      type: 'tour',
      name: v.name,
      email: v.email,
      phone: v.phone,
      message: v.message,
      propertyId: this.property.id,
      source: 'property-detail'
    }).subscribe(() => {
      this.submitting = false;
      this.submitted = true;
    });
  }
}
