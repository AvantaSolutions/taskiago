import { inject, Injectable, NgZone } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class SharedService {
    startDate = new Date(new Date().getTime() + (new Date().getDay() === 0 ? -7 : -(new Date().getDay())) * 24 * 60 * 60 * 1000)
    
    out(item: any) { console.log(item) }
}