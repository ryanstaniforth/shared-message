import { AbstractMessageBuilder } from './AbstractMessageBuilder';
import { MessageHandler } from './MessageHandler';
import { isNamedMessage } from './NamedMessage';

export class MessageRouter<Context> {
    private registeredHandlers: Array<
        [AbstractMessageBuilder<unknown>, MessageHandler<unknown, unknown>]
    > = [];

    public handleMesage = (message: unknown, context: Context): void => {
        if (!isNamedMessage(message)) {
            return;
        }

        const filteredNamedHandlers = this.registeredHandlers.filter(
            ([builder, _]) => builder.getMessageName() === message._name,
        );

        const unnammedMessage = { ...message, _name: undefined };

        filteredNamedHandlers.forEach(([builder, handler]) => {
            if (!builder.isMessage(unnammedMessage)) {
                return;
            }

            handler(unnammedMessage, context);
        });
    };

    public off = <Message>(
        builder: AbstractMessageBuilder<Message>,
        handler: MessageHandler<Message, Context>,
    ): void => {
        this.registeredHandlers = this.registeredHandlers.filter(
            (registeredHandler) =>
                registeredHandler[0].getMessageName() !== builder.getMessageName() ||
                registeredHandler[1] !== handler,
        );
    };

    public on = <Message>(
        builder: AbstractMessageBuilder<Message>,
        handler: MessageHandler<Message, Context>,
    ): void => {
        this.registeredHandlers.push([
            builder as AbstractMessageBuilder<unknown>,
            handler as MessageHandler<unknown, unknown>,
        ]);
    };
}
