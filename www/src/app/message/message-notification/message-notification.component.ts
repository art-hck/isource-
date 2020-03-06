import { Component, OnInit } from '@angular/core';
import { WebsocketService } from "../../websocket/websocket.service";
import { EventTypes } from "../../websocket/event-types";
import { Message } from "../../request/common/models/message";
import { Subscription, timer } from "rxjs";
import { MessageContextTypes } from "../message-context-types";
import { Router } from "@angular/router";

@Component({
  selector: 'app-message-notification',
  templateUrl: './message-notification.component.html',
  styleUrls: ['./message-notification.component.scss']
})
export class MessageNotificationComponent implements OnInit {

  open = false;
  message: Message;

  protected durations = 5000;

  private timerSubscription = new Subscription();

  constructor(
    private wsService: WebsocketService,
    public router: Router,
  ) {
  }

  ngOnInit() {
    this.initMessagesWebsocket();
  }

  initMessagesWebsocket() {
    // можно не отписываться, т.к. компонент создается только один раз и используется на всех страницах
    this.wsService.on<any>(EventTypes.NEW_MESSAGE_EVENT.valueOf()).subscribe((message) => {
      // если уже находимся на нужной странице, то сообщение не показываем
      if (this.router.url === this.getChatUrl(message)) {
        return;
      }

      this.message = message;

      // устанавливаем таймер для автозакрытия всплывашки
      this.open = true;
      this.timerSubscription.unsubscribe();
      this.timerSubscription = timer(this.durations).subscribe(val => {
        this.open = false;
      });
    });
  }

  onContainerClick() {
    this.open = false;
    this.router.navigateByUrl(this.getChatUrl(this.message));
  }

  getChatUrl(message: Message): string {
    switch (message.contextType) {
      case MessageContextTypes.REQUEST: {
        return `/messages/request/${message.contextId}`;
      }
      case MessageContextTypes.REQUEST_GROUP: {
        return `/messages/request/${message.requestId}/group/${message.contextId}`;
      }
      case MessageContextTypes.REQUEST_POSITION: {
        return `/messages/request/${message.requestId}/position/${message.contextId}`;
      }
      default:
        console.error('Тип контекста сообщений не найден');
    }

    return 'messages';
  }

  getSubName() {
    return this.message.contragent ?
      this.message.contragent.shortName :
      'Бэк-офис';
  }
}
