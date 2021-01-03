import { Component, Inject, PLATFORM_ID } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'Anonder Bazaar Admin';

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngOnInt() {}
}
