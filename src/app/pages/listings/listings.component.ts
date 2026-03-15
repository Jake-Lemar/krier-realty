import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { PropertyCardComponent } from '../../components/property-card/property-card.component';
import { PropertyService } from '../../services/property.service';
import { SeoService } from '../../services/seo.service';
import { Property, PropertySearchFilters } from '../../models/property.model';

@Component({
  selector: 'app-listings',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    PropertyCardComponent
  ],
  templateUrl: './listings.component.html',
  styleUrl: './listings.component.css'
})
export class ListingsComponent implements OnInit {
  listings: Property[] = [];
  loading = true;

  filters: PropertySearchFilters = {
    query: '',
    minPrice: undefined,
    maxPrice: undefined,
    minBeds: undefined,
    propertyType: '',
    status: 'all',
    state: ''
  };

  stateOptions = [
    { label: 'NE & IA', value: '' },
    { label: 'Nebraska (NE)', value: 'NE' },
    { label: 'Iowa (IA)', value: 'IA' }
  ];

  priceOptions = [
    { label: 'Any', value: undefined },
    { label: '$100,000', value: 100000 },
    { label: '$200,000', value: 200000 },
    { label: '$300,000', value: 300000 },
    { label: '$400,000', value: 400000 },
    { label: '$500,000', value: 500000 }
  ];

  bedOptions = [
    { label: 'Any', value: undefined },
    { label: '1+', value: 1 },
    { label: '2+', value: 2 },
    { label: '3+', value: 3 },
    { label: '4+', value: 4 }
  ];

  typeOptions = [
    { label: 'Any', value: '' },
    { label: 'Single Family', value: 'single-family' },
    { label: 'Condo', value: 'condo' },
    { label: 'Townhouse', value: 'townhouse' },
    { label: 'Multi-Family', value: 'multi-family' }
  ];

  constructor(
    private propertyService: PropertyService,
    private seoService: SeoService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.seoService.updateMeta({
      title: 'Homes for Sale in Nebraska & Iowa | Aaron Krier REALTOR®',
      description: 'Browse homes for sale in Omaha NE and Council Bluffs IA. Filter by price, beds, and type. Aaron Krier is your dual-licensed NE & IA REALTOR® based in Carter Lake.'
    });

    this.route.queryParams.subscribe(params => {
      if (params['q']) {
        this.filters.query = params['q'];
      }
      this.loadListings();
    });
  }

  loadListings(): void {
    this.loading = true;
    this.propertyService.getListings(this.filters).subscribe(listings => {
      this.listings = listings;
      this.loading = false;
    });
  }

  onFilterChange(): void {
    this.loadListings();
  }

  clearFilters(): void {
    this.filters = {
      query: '',
      minPrice: undefined,
      maxPrice: undefined,
      minBeds: undefined,
      propertyType: '',
      status: 'all',
      state: ''
    };
    this.router.navigate(['/listings']);
    this.loadListings();
  }

  get hasActiveFilters(): boolean {
    return !!(
      this.filters.query ||
      this.filters.minPrice != null ||
      this.filters.maxPrice != null ||
      this.filters.minBeds != null ||
      this.filters.propertyType ||
      this.filters.state
    );
  }
}
