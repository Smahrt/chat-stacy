import { Component, OnInit, ElementRef, ViewChild, AfterViewChecked, ChangeDetectorRef } from '@angular/core';
import { NetworkService, NetworkState } from './services/network/network.service';
import { StacyService } from './services/stacy/stacy.service';
import { getCommand, StacyCommand } from './services/stacy/stacy.commands';

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

  public offlineIndicator = { message: 'Online', color: 'palegreen' };

  public message: string;
  public messages: Message[] = [];

  public stacyThinking = false;

  constructor(
    private network: NetworkService,
    private stacy: StacyService,
    private ref: ChangeDetectorRef
  ) { }

  async ngOnInit(): Promise<void> {
    this.network.networkChanges().subscribe(status => {
      console.log(status);
      if (status === NetworkState.Offline) {
        this.offlineIndicator = { message: 'Offline', color: 'palevioletred' };
        console.log(this.offlineIndicator);
      }

      if (status === NetworkState.Online) {
        this.offlineIndicator = { message: 'Online', color: 'palegreen' };
      }

      if (status === NetworkState.Reconnecting) {
        this.offlineIndicator = { message: 'Reconnecting...', color: 'palegoldenrod' };
      }
      this.ref.detectChanges();
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

      if (this.stacy.VALID_MOVIE_REQUEST.test(this.message)) {
        return this.displayMessage(await this.stacy.say('POSITIVE', this.message));
      }

      if (this.commandToRegex('POSITIVE').test(this.message)) {
        return this.displayMessage(await this.stacy.say('PROMPT'));
      }

      if (this.commandToRegex('NEGATIVE').test(this.message)) {
        return this.displayMessage(await this.stacy.say('PERSUADE'));
      }

      return this.displayMessage(await this.stacy.say('ERROR'));
    }
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
    this.message = '';
  }

  private scrollToBottom(): void {
    this.messageList.nativeElement.scrollTop = this.messageList.nativeElement.scrollHeight;
  }
}
