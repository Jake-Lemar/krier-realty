import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { LeadService } from '../../services/lead.service';
import { SeoService } from '../../services/seo.service';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.css'
})
export class ContactComponent implements OnInit {
  contactForm!: FormGroup;
  submitting = false;
  submitted = false;

  constructor(
    private leadService: LeadService,
    private seoService: SeoService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.seoService.updateMeta({
      title: 'Contact Aaron Krier REALTOR® | (402) 555-0187 | Omaha & Council Bluffs',
      description: 'Contact Aaron Krier, dual-licensed REALTOR® serving Greater Omaha and Council Bluffs. Call (402) 555-0187 or send a message.',
      canonical: '/contact'
    });

    this.seoService.addJsonLd({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'What areas does Aaron Krier serve?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Aaron serves the entire Greater Omaha and Council Bluffs metropolitan area, including Omaha, Bellevue, Papillion, La Vista, Gretna, Elkhorn, Millard, Council Bluffs, and Carter Lake. As a dual-licensed agent in both Nebraska and Iowa, he handles transactions on both sides of the Missouri River.'
          }
        },
        {
          '@type': 'Question',
          name: 'How quickly does Aaron respond to inquiries?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Aaron typically responds to all inquiries within a few hours during business hours. For urgent matters, you can call or text directly at (402) 555-0187.'
          }
        },
        {
          '@type': 'Question',
          name: 'Does Aaron work with first-time homebuyers?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: "Yes — Aaron enjoys working with first-time buyers and is patient with the process. He'll walk you through every step from pre-approval to closing, and can recommend trusted local lenders if you need financing guidance."
          }
        },
        {
          '@type': 'Question',
          name: 'Is Aaron licensed in both Nebraska and Iowa?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes. Aaron holds active real estate licenses in both Nebraska (License #NE-45821) and Iowa (License #IA-78234), making him one of the few agents fully equipped to represent buyers and sellers on both sides of the Omaha-Council Bluffs metro.'
          }
        }
      ]
    }, 'json-ld-faq');

    this.contactForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      message: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  onSubmit(): void {
    if (this.contactForm.invalid) return;
    this.submitting = true;
    const v = this.contactForm.value;
    this.leadService.submitLead({
      type: 'contact',
      name: v.name,
      email: v.email,
      phone: v.phone,
      message: v.message,
      source: 'contact-page'
    }).subscribe(() => {
      this.submitting = false;
      this.submitted = true;
    });
  }
}
