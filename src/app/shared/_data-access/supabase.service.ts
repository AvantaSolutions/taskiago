import { inject, Injectable, NgZone } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class SupabaseService {
    public client: SupabaseClient
    private readonly ngZone = inject(NgZone);

    constructor() {
        this.client = this.ngZone.runOutsideAngular(() => createClient(environment.supabaseUrl, environment.supabaseKey))
    }
}