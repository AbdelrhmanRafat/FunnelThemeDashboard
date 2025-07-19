import { ApplicationConfig, importProvidersFrom, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withHashLocation, withInMemoryScrolling, withViewTransitions } from '@angular/router';
import { provideHttpClient, withFetch } from '@angular/common/http';  // Add this import

import { routes } from './app.routes';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideToastr } from 'ngx-toastr';
import { provideAnimations } from '@angular/platform-browser/animations';


export const appConfig: ApplicationConfig = {
    providers: [provideRouter(routes,
    withHashLocation(),
    withViewTransitions(),
    withInMemoryScrolling({
     scrollPositionRestoration : 'top'
    }),
   ),
   provideHttpClient(withFetch()),
   importProvidersFrom(),
   provideAnimations(), // required animations providers
   provideToastr(), provideAnimationsAsync(),
  ],
};