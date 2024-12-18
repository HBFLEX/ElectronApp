import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SyncDbService {

  syncRemoteDB(): Promise<any>{
    return (window as any).api.syncRemoteDB();
  }
  constructor() { }
}
