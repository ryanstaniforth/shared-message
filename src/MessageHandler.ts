export type MessageHandler<Message, Context> = (message: Message, context: Context) => void;
