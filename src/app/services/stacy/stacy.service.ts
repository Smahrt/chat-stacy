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

  private movies: ApiResponse[] = [];
  private searchTerm = '';
  private page = 1;
  private pages = 1;

  public VALID_MOVIE_REQUEST = /(\"|\'){1}\n?.+\n?(\"|\'){1}/mi;
  public VALID_PAGE_REQUEST = /(page{1}\s+\d+|(next){1}\s?(page)?)/mi;

  constructor(private http: HttpClient) { }

  /**
   * Make Stacy say something
   */
  public async say(command: StacyCommand, fromUser?: string) {
    if (fromUser) {
      if (command === 'TITLE') {
        const title = this.extractTitle(fromUser);
        return title !== 'NOT_AVAILABLE' ? await this.fetchMovie(title) : await this.searchMovie(fromUser);
      }

      if (command === 'NAVIGATE') {
        const nextPageCommand = /next/gmi.test(fromUser);

        if (nextPageCommand) {
          return await this.searchMovie(this.searchTerm, true);
        }

        const pageNumber = Number(fromUser.match(/\d+/i));
        if (Number.isInteger(pageNumber)) {
          return await this.searchMovie(this.searchTerm, true, pageNumber);
        }
      }

      command = 'ERROR';
    }
    return this.getMessage(command);
  }

  private getMessage(command: StacyCommand): string {
    const messages = getCommand(command);
    const randomIndex = Math.floor(Math.random() * messages.length);
    return messages[randomIndex];
  }

  private extractTitle(message: string) {
    const tempTitle = message.match(this.VALID_MOVIE_REQUEST);
    if (!tempTitle) {
      return 'NOT_AVAILABLE';
    }
    return tempTitle[0].replace(/(\"|\'|\n|\r|\t)/gi, '').trim();
  }

  private async fetchMovie(title: string) {
    try {
      const { Response, Plot, Title, Year, Director, Genre }: ApiResponse = await this.http
        .get(`https://www.omdbapi.com/?apikey=${this.OMDB_API_KEY}&t=${title}&plot=short`)
        .toPromise() as any;

      return Response === 'True'
        ? `The movie, ${Title} (${Year}) was directed by ${Director} and involves ${Genre}.<br><br>In ${Title}, ${Plot}`
        : 'Clearly your movie taste is better than mine. You could keep trying other familiar movies tho.';
    } catch (error) {
      console.log('An error occured', error);
      return 'For some reason I was not able to help you like I promised 😢. Here\'s a cookie 🍪';
    }
  }

  private async searchMovie(searchTerm: string, nextPage = false, pageNumber?: number) {
    if (!nextPage) {
      this.resetPagination();
    }

    if (nextPage && this.movies.length === 0) {
      return this.getMessage('PROMPT');
    }

    try {
      if (nextPage) { // query current state
        this.page++;

        if (this.page > this.pages) {
          this.page = 1;
        }

        if (pageNumber) {
          this.page = pageNumber;
        }
      } else { // perform fresh search
        const { Response, Search }: { Response: 'True' | 'False', Search: ApiResponse[] } = await this.http
          .get(`https://www.omdbapi.com/?apikey=${this.OMDB_API_KEY}&s=${searchTerm}&type=movie`)
          .toPromise() as any;

        if (Response === 'False') {
          return 'Clearly your movie taste is better than mine. You could keep trying other familiar movies tho.';
        }

        this.movies = Search;
        this.searchTerm = searchTerm;
        this.pages = Math.ceil(this.movies.length / 5);
      }

      return `I found roughly ${this.movies.length} movies with the title <strong><em>${searchTerm}</strong></em> <br><br>
        You can navigate by just typing <strong><em>next page</em></strong> or type <strong><em>page 2</em></strong>
        to go to a specific page <br><br>
        <strong>Page ${this.page} of ${this.pages}</strong> <br>
        ${this.getMovieList(this.page, this.movies)}`;
    } catch (error) {
      console.log('An error occured', error);
      return 'For some reason I was not able to help you like I promised 😢. Here\'s a cookie 🍪';
    }
  }

  private getMovieList(page: number, movies: ApiResponse[]): string {
    return movies
      .slice((page - 1) * 5, page * 5)
      .map(({ Title, Year }, i) => `${i + 1}. ${Title} (${Year})`)
      .join('<br>');
  }

  private resetPagination(): void {
    this.pages = 1;
    this.page = 1;
    this.searchTerm = '';
    this.movies = [];
  }
}
