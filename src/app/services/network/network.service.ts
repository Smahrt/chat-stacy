import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

declare const Offline: any;

export interface NetworkState {
  message: string;
  color: string;
}

@Injectable({
  providedIn: 'root'
})

export class NetworkService {
  private networkStatus$: Subject<NetworkState> = new Subject();

  constructor() {
    Offline.options = {
      checks: {
        image: {
          url: `https://hobeei.herokuapp.com/favicon.ico`
        },
        active: 'image'
      },
      reconnect: {
        initialDelay: 3,
        delay: 5
      }
    };

    Offline.on('up', () => {
      this.networkStatus$.next({ message: 'Online', color: 'palegreen' });
    });

    Offline.on('reconnect:connecting', () => {
      this.networkStatus$.next({ message: 'Reconnecting...', color: 'palegoldenrod' });
    });

    Offline.on('down', () => {
      this.networkStatus$.next({ message: 'Offline', color: 'palevioletred' });
    });
  }

  public networkChanges(): Observable<NetworkState> {
    return this.networkStatus$.asObservable();
  }
}
