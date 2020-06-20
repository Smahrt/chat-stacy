import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

declare const Offline: any;

export enum NetworkState {
  Offline,
  Online,
  Reconnecting
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
      interceptRequests: true,
      reconnect: {
        initialDelay: 3,
        delay: 5
      }
    };

    Offline.on('up', () => {
      this.networkStatus$.next(NetworkState.Online);
    });

    Offline.on('reconnect:connecting', () => {
      this.networkStatus$.next(NetworkState.Reconnecting);
    });

    Offline.on('down', () => {
      this.networkStatus$.next(NetworkState.Offline);
    });
  }

  public networkChanges(): Observable<NetworkState> {
    return this.networkStatus$.asObservable();
  }

  public getCurrentState(): NetworkState {
    return Offline.state === 'up' ? NetworkState.Online : NetworkState.Offline;
  }
}
