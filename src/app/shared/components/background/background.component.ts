import { Component } from '@angular/core';
import { HeaderComponent } from '../header/header.component';

@Component({
    selector: 'app-background',
    imports: [HeaderComponent],
    standalone: true,
    templateUrl: './background.component.html',
    styleUrl: './background.component.css'
})
export class BackgroundComponent {

}
