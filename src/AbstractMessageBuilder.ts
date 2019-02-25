import { MessageHandler } from './MessageHandler';
import { NamedMessage } from './NamedMessage';

export abstract class AbstractMessageBuilder<Message> {
    public build(messageData: Message): NamedMessage & Message {
        return {
            _name: this.getMessageName(),
            ...messageData,
        };
    }

    public createHandler = <Context>(
        handler: MessageHandler<Message, Context>,
    ): MessageHandler<Message, Context> => {
        return handler;
    };

    public abstract getMessageName(): string;

    public abstract isMessage(messageData: unknown): messageData is Message;
}
