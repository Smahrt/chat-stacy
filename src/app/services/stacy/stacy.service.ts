import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { StacyCommand, getCommand } from './stacy.commands';

interface ApiResponse {
  Response: 'True' | 'False';
  Plot: string;
  Title: string;
  Year: string;
  Genre: string;
  Director: string;
}

@Injectable({
  providedIn: 'root'
})

export class StacyService {
  private OMDB_API_KEY = 'df4914cc';

  public VALID_MOVIE_REQUEST = /(\"|\'){1}\n?.+\n?(\"|\'){1}/mi;

  constructor(private http: HttpClient) { }

  /**
   * Make Stacy say something
   */
  public async say(command: StacyCommand, fromUser?: string) {
    if (fromUser) {
      const title = this.extractTitle(fromUser);
      if (title) {
        return await this.searchMovie(title);
      }

      command = 'ERROR';
    }
    const messages = getCommand(command);
    const randomIndex = Math.floor(Math.random() * messages.length);
    return messages[randomIndex];
  }

  private extractTitle(message: string) {
    const tempTitle = message.match(this.VALID_MOVIE_REQUEST);
    const title = tempTitle ? tempTitle[0] : null;
    return title.replace(/(\"|\'|\n|\r|\t)/gi, '').trim();
  }

  private async searchMovie(title: string) {
    try {
      const { Response, Plot, Title, Year, Director, Genre }: ApiResponse = await this.http
        .get(`http://www.omdbapi.com/?apikey=${this.OMDB_API_KEY}&t=${title}&plot=short`)
        .toPromise() as any;

      return Response === 'True'
        ? `The movie, ${Title} (${Year}) was directed by ${Director} and involves ${Genre}.<br><br>In ${Title}, ${Plot}`
        : 'Clearly your movie taste is better than mine. You could keep trying other familiar movies tho.';
    } catch (error) {
      console.log('An error occured', error);
      return 'For some reason I was not able to help you like I promised 😢. Here\'s a cookie 🍪';
    }
  }
}
