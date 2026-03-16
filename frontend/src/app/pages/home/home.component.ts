import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';
import { PropertyCardComponent } from '../../components/property-card/property-card.component';
import { PropertyService } from '../../services/property.service';
import { SeoService } from '../../services/seo.service';
import { Property } from '../../models/property.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatCardModule,
    PropertyCardComponent
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {
  featuredListings: Property[] = [];
  searchQuery = '';

  testimonials = [
    {
      quote: "Aaron made buying our first home in Dundee an absolute dream. He knew every street, every neighbor, and had us under contract in 3 days. Couldn't recommend him more.",
      name: 'Jake & Megan T.',
      neighborhood: 'Dundee',
      stars: 5
    },
    {
      quote: "We listed our Aksarben home on a Friday and had 7 offers by Sunday. Aaron's marketing strategy and negotiating skills got us $13,000 over asking. He's simply the best.",
      name: 'Robert & Linda K.',
      neighborhood: 'Aksarben',
      stars: 5
    },
    {
      quote: "As a relocated professional, I needed someone who could move fast. Aaron found me the perfect Blackstone condo, handled everything remotely, and made it seamless.",
      name: 'David C.',
      neighborhood: 'Blackstone',
      stars: 5
    }
  ];

  constructor(
    private propertyService: PropertyService,
    private seoService: SeoService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.seoService.updateMeta({
      title: 'Omaha & Council Bluffs Homes for Sale | Aaron Krier REALTOR®',
      description: 'Search homes for sale in Omaha NE and Council Bluffs IA with Aaron Krier, dual-licensed REALTOR® based in Carter Lake. Browse listings in Dundee, Midtown, Aksarben, and more.',
      image: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=1200&q=80'
    });

    this.seoService.setJsonLd({
      '@context': 'https://schema.org',
      '@type': 'RealEstateAgent',
      name: 'Aaron Krier',
      url: 'https://krierrealty.com',
      telephone: '(402) 555-0187',
      email: 'aaron@krierrealty.com',
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Carter Lake',
        addressRegion: 'IA',
        postalCode: '51510'
      }
    });

    this.propertyService.getFeaturedListings().subscribe(listings => {
      this.featuredListings = listings;
    });
  }

  onSearch(): void {
    if (this.searchQuery.trim()) {
      this.router.navigate(['/listings'], { queryParams: { q: this.searchQuery.trim() } });
    } else {
      this.router.navigate(['/listings']);
    }
  }
}
