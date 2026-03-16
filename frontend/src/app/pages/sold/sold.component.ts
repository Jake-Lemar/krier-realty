import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { PropertyCardComponent } from '../../components/property-card/property-card.component';
import { PropertyService } from '../../services/property.service';
import { SeoService } from '../../services/seo.service';
import { Property } from '../../models/property.model';

@Component({
  selector: 'app-sold',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatButtonModule,
    MatIconModule,
    PropertyCardComponent
  ],
  templateUrl: './sold.component.html',
  styleUrl: './sold.component.css'
})
export class SoldComponent implements OnInit {
  soldListings: Property[] = [];

  stats = [
    { value: '150+', label: 'Homes Sold', icon: 'home' },
    { value: 'Avg 18 Days', label: 'Days on Market', icon: 'timer' },
    { value: '98%', label: 'List-to-Sale Ratio', icon: 'trending_up' },
    { value: '$42M+', label: 'Total Volume', icon: 'attach_money' }
  ];

  constructor(
    private propertyService: PropertyService,
    private seoService: SeoService
  ) {}

  ngOnInit(): void {
    this.seoService.updateMeta({
      title: 'Recently Sold Homes in Omaha & Council Bluffs | Aaron Krier REALTOR®',
      description: "Browse Aaron Krier's recently sold properties across the Greater Omaha-Council Bluffs metro. Proven track record on both sides of the Missouri River.",
      canonical: '/sold'
    });

    this.propertyService.getSoldListings().subscribe(listings => {
      this.soldListings = listings;
    });
  }
}
