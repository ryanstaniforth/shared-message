# Shared Message

`shared-message` is built in TypeScript and provides means of building shared components used to
build and validate JSON messages sent bi-directionally between server and client.

While designed to work with [WebSockets](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API),
this library is transport agnostic.

Two main problems solved:

1. **Minimises code duplication** by creating a single source of truth for each message. This is
   achieved by creating "message builders". Message builders are used to build and validate messages.
2. **Creates trust in code** by enabling the attachment of handlers to message builders in a typed
   way. Handlers have typed knowledge of data they are expected to receive.

## Install

```bash
npm install --save shared-message
```

> Type definitions are bundled and do not require a separate install.

## Overview of a message

A message is a JSON object consisting of a `_name` and any other data you define.

`_name` is a string that uniquely identifies the type of message. This is used by routers to
correctly route a message to the correct handler.

```json
{
    "_name": "NAME",
    "any": "abc",
    "other": 123,
    "data": true
}
```

## Usage

### Message Builders

To create your first message, begin by creating an interface to represent the data it will carry.

```typescript
interface ExampleInterface {
    name: string;
    age: number;
}
```

A message builder can now be created by extending `AbstractMessageBuilder` with your interface as
a supplied generic type parameter.

Implement `getMessageName` by returning a globally unique string that identifies your
message. Implement `isMessage` to validate the message interface.

```typescript
import { AbstractMessageBuilder } from 'shared-message';

class ExampleMessageBuilder extends AbstractMessageBuilder<ExampleInterface> {
    public static shared = new ExampleMessageBuilder();

    public getMessageName(): string {
        return 'EXAMPLE';
    }

    public isMessage(messageData: unknown): messageData is ExampleInterface {
        if (!(messageData instanceof Object)) {
            return false;
        }

        if (typeof (messageData as ExampleInterface).name !== 'string') {
            return false;
        }

        if (typeof (messageData as ExampleInterface).age !== 'number') {
            return false;
        }

        return true;
    }
}
```

**Note**: Although not necessary, because message builders do not require multiple instantiations,
`ExampleMessageBuilder` has been given a static property called `shared` to act as a singleton.

Messages can now be built using your message builder's `build` method. These messages can be
serialised and sent to a server or client.

```typescript
ExampleMessageBuilder.shared.build({
    name: 'Bob',
    age: 40,
});

// {
//     _name: "EXAMPLE",
//     name: "Bob",
//     age: 40,
// }
```

### Handlers

A handler handles application logic for a particular received message. A handler must conform to
the `MessageHandler` interface. This ensures that it knows what data to expect.

As well as receiving the message data, your handlers may also need other data or components. This
is solved by creating a context interface, here you can define everything your handlers need such as
a user ID for requests to be authenticated.

```typescript
interface Context {
    user_id: string;
}
```

Your handler can now be created. `MessageHandler` requires your message and context interfaces.
If you do not require a context, `undefined` can be used instead.

```typescript
import { MessageHandler } from 'shared-message';

const handler: MessageHandler<ExampleInterface, Context> = (message, context) => {
    // Business logic.
};
```

### Router

Now that your message builders and handlers have been created, we can associate them with a router.

```typescript
import { MessageHandler, MessageRouter } from 'shared-message';

const router = new MessageRouter<Context>();
const exampleMessageBuilder = new ExampleMessageBuilder();

const handler: MessageHandler<ExampleInterface, Context> = (message, context) => {
    // Business logic.
};

// Attach a handler.
router.on(exampleMessageBuilder, handler);

// Attach a handler directly using an anonymous function.
router.on(exampleMessageBuilder, (message, context) => {
    // Business logic.
});
```

The router can now handle incoming messages using the `handleMessage` method. This needs to be used
by your code that handles incoming data.

```typescript
let message;

try {
    message = JSON.parse(incommingDataString);
} catch (error) {
    // handle
}

router.handleMesage(message, {
    user_id: 'abc',
});
```
