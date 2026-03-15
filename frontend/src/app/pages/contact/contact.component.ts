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
      description: 'Contact Aaron Krier, dual-licensed REALTOR® serving Greater Omaha and Council Bluffs. Call (402) 555-0187 or send a message.'
    });

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
