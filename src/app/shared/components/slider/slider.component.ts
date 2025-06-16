import { Component, ViewEncapsulation } from '@angular/core';
import { BackgroundComponent } from '../../../shared/components/background/background.component';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { CarouselModule } from 'primeng/carousel';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { CommonModule } from '@angular/common';

interface Product {
  id: string;
  code: string;
  name: string;
  description: string;
  image: string;
  price: number;
  category: string;
  quantity: number;
  inventoryStatus: 'NEW' | 'LOWSTOCK' | 'OUTOFSTOCK';
  rating: number;
  startDate?: Date; // Optionnel, pour la date de début
  endDate?: Date; // Optionnel, pour la date de fin
}

@Component({
    selector: 'app-slider',
     imports: [
    CommonModule,
    BackgroundComponent,
    MatSlideToggleModule,
    CarouselModule,
    ButtonModule,
    TagModule
  ],
    standalone: true,
    templateUrl: './slider.component.html',
    styleUrl: './slider.component.css',
     encapsulation: ViewEncapsulation.None,
})
export class SliderComponent {
  // 1. On définit la liste statique ici
  products: Product[] = [
    {
      id: '1000',
      code: 'f230fh0g3',
      name: 'Bamboo Watch',
      description: 'Product Description',
      image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/Flag_of_Hong_Kong.svg/1200px-Flag_of_Hong_Kong.svg.png',
      price: 65,
      category: 'Accessories',
      quantity: 24,
      inventoryStatus: 'NEW',
      rating: 5,
        startDate:  new Date('2023-12-31'), // Date de début
        endDate: new Date('2023-12-31') // Date de fin
    },
    {
      id: '1000',
      code: 'f230fh0g3',
      name: 'Bamboo Watch',
      description: 'Product Description',
      image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/Flag_of_Hong_Kong.svg/1200px-Flag_of_Hong_Kong.svg.png',
      price: 65,
      category: 'Accessories',
      quantity: 24,
      inventoryStatus: 'NEW',
      rating: 5
    },
    {
      id: '1000',
      code: 'f230fh0g3',
      name: 'Bamboo Watch',
      description: 'Product Description',
      image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/Flag_of_Hong_Kong.svg/1200px-Flag_of_Hong_Kong.svg.png',
      price: 65,
      category: 'Accessories',
      quantity: 24,
      inventoryStatus: 'NEW',
      rating: 5
    },
    {
      id: '1000',
      code: 'f230fh0g3',
      name: 'Bamboo Watch',
      description: 'Product Description',
      image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/Flag_of_Hong_Kong.svg/1200px-Flag_of_Hong_Kong.svg.png',
      price: 65,
      category: 'Accessories',
      quantity: 24,
      inventoryStatus: 'NEW',
      rating: 5
    },
    {
      id: '1000',
      code: 'f230fh0g3',
      name: 'Bamboo Watch',
      description: 'Product Description',
      image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/Flag_of_Hong_Kong.svg/1200px-Flag_of_Hong_Kong.svg.png',
      price: 65,
      category: 'Accessories',
      quantity: 24,
      inventoryStatus: 'NEW',
      rating: 5
    },
    {
      id: '1000',
      code: 'f230fh0g3',
      name: 'Bamboo Watch',
      description: 'Product Description',
      image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/Flag_of_Hong_Kong.svg/1200px-Flag_of_Hong_Kong.svg.png',
      price: 65,
      category: 'Accessories',
      quantity: 24,
      inventoryStatus: 'NEW',
      rating: 5
    },
    {
      id: '1000',
      code: 'f230fh0g3',
      name: 'Bamboo Watch',
      description: 'Product Description',
      image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/Flag_of_Hong_Kong.svg/1200px-Flag_of_Hong_Kong.svg.png',
      price: 65,
      category: 'Accessories',
      quantity: 24,
      inventoryStatus: 'NEW',
      rating: 5
    },
    {
      id: '1000',
      code: 'f230fh0g3',
      name: 'Bamboo Watch',
      description: 'Product Description',
      image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/Flag_of_Hong_Kong.svg/1200px-Flag_of_Hong_Kong.svg.png',
      price: 65,
      category: 'Accessories',
      quantity: 24,
      inventoryStatus: 'NEW',
      rating: 5
    },
    {
      id: '1000',
      code: 'f230fh0g3',
      name: 'Bamboo Watch',
      description: 'Product Description',
      image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/Flag_of_Hong_Kong.svg/1200px-Flag_of_Hong_Kong.svg.png',
      price: 65,
      category: 'Accessories',
      quantity: 24,
      inventoryStatus: 'NEW',
      rating: 5
    },
    {
      id: '1000',
      code: 'f230fh0g3',
      name: 'Bamboo Watch',
      description: 'Product Description',
      image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/Flag_of_Hong_Kong.svg/1200px-Flag_of_Hong_Kong.svg.png',
      price: 65,
      category: 'Accessories',
      quantity: 24,
      inventoryStatus: 'NEW',
      rating: 5
    },  
    // tu peux ajouter d'autres objets Product ici…
  ];

  // 2. Les options de responsivité pour le carousel
  responsiveOptions = [
    {
      breakpoint: '1400px',
      numVisible: 2,
      numScroll: 1,
    },
    {
      breakpoint: '1199px',
      numVisible: 3,
      numScroll: 1,
    },
    {
      breakpoint: '767px',
      numVisible: 2,
      numScroll: 1,
    },
    {
      breakpoint: '575px',
      numVisible: 1,
      numScroll: 1,
    },
  ];

  constructor() {
    // plus de ProductService, tout est statique
  }

  // 3. Méthode pour déterminer la couleur du Tag
  getSeverity(status: Product['inventoryStatus']): 'success' | 'warn' | 'danger' {
    switch (status) {
      case 'NEW':
        return 'success';
      case 'LOWSTOCK':
        return 'warn';
      case 'OUTOFSTOCK':
        return 'danger';
    }
  }

}
