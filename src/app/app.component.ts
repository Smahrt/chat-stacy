import { Component, OnInit, ElementRef, ViewChild, AfterViewChecked, ChangeDetectorRef } from '@angular/core';
import { NetworkService, NetworkState } from './services/network/network.service';
import { StacyService } from './services/stacy/stacy.service';
import { getCommand, StacyCommand } from './services/stacy/stacy.commands';
import { Subject, BehaviorSubject } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter } from 'rxjs/operators';

interface Message {
  body: string;
  isBot: boolean;
  timestamp: string;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})

export class AppComponent implements OnInit {
  @ViewChild('messageList', { static: true }) messageList: ElementRef;

  private mutationObserver: MutationObserver;

  public networkStatus: NetworkState = { message: 'Online', color: 'palegreen' };

  public inputListener$: Subject<Event> = new Subject();
  public message: string;
  public messages: Message[] = [];

  public movieSuggestions: string[] = [];

  public stacyThinking = false;

  constructor(
    private network: NetworkService,
    private stacy: StacyService,
    private ref: ChangeDetectorRef
  ) { }

  async ngOnInit(): Promise<void> {
    this.network.networkChanges().subscribe(status => {
      this.networkStatus = status;
      this.ref.detectChanges();
    });

    this.inputListener$
      .pipe(
        debounceTime(750),
        distinctUntilChanged()
      ).subscribe(() => {
        this.movieSuggestions = this.message.length > 3
          ? this.stacy.getMovieTitleSuggestions(this.message)
          : [];
      });

    this.displayMessage(await this.stacy.say('GREETING'));
    this.displayMessage(await this.stacy.say('INTRODUCTION'));

    this.mutationObserver = new MutationObserver((mutations) => {
      this.scrollToBottom();
    });

    this.mutationObserver.observe(this.messageList.nativeElement, {
      childList: true
    });
  }

  /**
   * Sends a user message to the bot.
   */
  public async sendMessage(ev?: Event): Promise<void> {
    if (ev) {
      ev.preventDefault();
    }

    if (this.message !== '') {
      this.displayMessage(this.message, false);

      if (this.stacy.VALID_PAGE_REQUEST.test(this.message)) {
        return this.displayMessage(await this.stacy.say('NAVIGATE', this.message));
      }

      if (this.message.toLowerCase().includes('search')) {
        const messageWithoutKeyword = this.message.toLowerCase().replace('search', '').trim();
        return this.displayMessage(await this.stacy.say('TITLE', messageWithoutKeyword));
      }

      if (this.stacy.VALID_MOVIE_REQUEST.test(this.message)) {
        return this.displayMessage(await this.stacy.say('POSITIVE', this.message));
      }

      if (this.commandToRegex('POSITIVE', 'GREETING').test(this.message)) {
        return this.displayMessage(await this.stacy.say('PROMPT'));
      }

      if (this.commandToRegex('NEGATIVE').test(this.message)) {
        return this.displayMessage(await this.stacy.say('PERSUADE'));
      }

      return this.displayMessage(await this.stacy.say('ERROR'));
    }
  }

  /**
   * Applies a movie suggestion to the chat window
   */
  public async applySuggestion(title: string) {
    const messageTitle = `"${title}"`;
    this.displayMessage(messageTitle, false);
    this.movieSuggestions = []; // reset suggestions
    this.ref.detectChanges();
    this.displayMessage(await this.stacy.say('TITLE', messageTitle));
  }

  /**
   * Reset Suggestions
   */
  public resetSuggestions() {
    this.movieSuggestions = []; // reset suggestions
    this.message = '';
    this.ref.detectChanges();
    return this.stacy.resetMovieSuggestions();
  }

  private commandToRegex(...commands: StacyCommand[]) {
    const list = commands.reduce((acc: string[], command) => {
      const cs = getCommand(command).map(c => c.toLowerCase());

      return [...acc, ...cs];
    }, []);

    return new RegExp(`(${list.join('|')})`, 'gmi');
  }

  /**
   * Adds message to the messages array. Displays on the chat window.
   * @param body The message body
   * @param isBot If the message is sent by the user or the bot
   */
  private displayMessage(body: string, isBot = true): void {
    this.stacyThinking = isBot;
    setTimeout(() => {
      this.stacyThinking = false;
      this.messages.push({ body, isBot, timestamp: new Date(Date.now()).toISOString() });
      this.resetMessageInput();
      this.scrollToBottom();
    }, isBot ? 1750 : 0);
  }

  /**
   * Resets the message input
   */
  private resetMessageInput(): void {
    this.movieSuggestions = []; // reset suggestions
    this.message = '';
  }

  private scrollToBottom(): void {
    this.messageList.nativeElement.scrollTop = this.messageList.nativeElement.scrollHeight;
  }
}
