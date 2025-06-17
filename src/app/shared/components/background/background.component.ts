import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { HeaderComponent } from '../header/header.component';

@Component({
    selector: 'app-background',
    imports: [HeaderComponent],
    standalone: true,
    templateUrl: './background.component.html',
    styleUrl: './background.component.css',
     schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class BackgroundComponent {

}
