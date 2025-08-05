import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { BackgroundComponent } from './shared/components/background/background.component';

@Component({
    selector: 'app-root',
    imports: [RouterOutlet, BackgroundComponent],
    standalone: true,
    templateUrl: './app.component.html',
    styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'tfe-front';
}
