// tslint:disable:max-classes-per-file

import { AbstractMessageBuilder, MessageRouter } from '../..';

interface AMessage {
    a1: string;
    a2: string;
}

interface BMessage {
    b1: number;
    b2: number;
}

class AMessageBuilder extends AbstractMessageBuilder<AMessage> {
    public getMessageName = (): string => 'a';

    public isMessage = (message: unknown): message is AMessage => {
        const coerced = message as AMessage;

        if (!(coerced instanceof Object)) {
            return false;
        }

        if (typeof coerced.a1 !== 'string') {
            return false;
        }

        if (typeof coerced.a2 !== 'string') {
            return false;
        }

        return true;
    };
}

class BMessageBuilder extends AbstractMessageBuilder<BMessage> {
    public getMessageName = (): string => 'b';

    public isMessage = (message: unknown): message is BMessage => {
        const coerced = message as BMessage;

        if (!(coerced instanceof Object)) {
            return false;
        }

        if (typeof coerced.b1 !== 'number') {
            return false;
        }

        if (typeof coerced.b2 !== 'number') {
            return false;
        }

        return true;
    };
}

describe('router', () => {
    test('routes messages to correct handler', () => {
        const router = new MessageRouter<undefined>();
        const aMessageBuilder = new AMessageBuilder();
        const bMessageBuilder = new BMessageBuilder();

        const aMock = jest.fn();
        const bMock = jest.fn();

        router.on(aMessageBuilder, aMock);
        router.on(bMessageBuilder, bMock);

        router.handleMesage(
            aMessageBuilder.build({
                a1: '1',
                a2: '2',
            }),
            undefined,
        );

        router.handleMesage(
            bMessageBuilder.build({
                b1: 1,
                b2: 2,
            }),
            undefined,
        );

        expect(aMock).toBeCalledWith(
            {
                a1: '1',
                a2: '2',
            },
            undefined,
        );

        expect(bMock).toBeCalledWith(
            {
                b1: 1,
                b2: 2,
            },
            undefined,
        );
    });

    test('handlers can be unbound', () => {
        const router = new MessageRouter<undefined>();
        const aMessageBuilder = new AMessageBuilder();

        const mock = jest.fn();
        const message = aMessageBuilder.build({
            a1: '1',
            a2: '2',
        });

        router.on(aMessageBuilder, mock);

        router.handleMesage(message, undefined);
        router.handleMesage(message, undefined);

        router.off(aMessageBuilder, mock);

        router.handleMesage(message, undefined);
        router.handleMesage(message, undefined);

        expect(mock).toBeCalledTimes(2);
    });

    test('handler is not called if incorrect message data is given', () => {
        const router = new MessageRouter<undefined>();
        const aMessageBuilder = new AMessageBuilder();

        const mock = jest.fn();

        router.on(aMessageBuilder, mock);

        for (const message of [
            undefined,
            null, // tslint:disable-line:no-null-keyword
            1,
            'a',
            {},
            {
                // This is the only message that should work.
                _name: aMessageBuilder.getMessageName(),
                a1: '1',
                a2: '2',
            },
            {
                _name: aMessageBuilder.getMessageName(),
                a1: '1',
            },
            {
                _name: aMessageBuilder.getMessageName(),
                a2: '2',
            },
            {
                a1: '1',
                a2: '2',
            },
        ]) {
            router.handleMesage(message, undefined);
        }

        expect(mock).toBeCalledTimes(1);
    });

    test('context is sent correctly', () => {
        interface Context {
            id: string;
        }

        const router = new MessageRouter<Context>();
        const aMessageBuilder = new AMessageBuilder();

        const mock = jest.fn();
        const message = aMessageBuilder.build({
            a1: '1',
            a2: '2',
        });

        router.on(aMessageBuilder, mock);

        router.handleMesage(message, {
            id: 'abc',
        });

        expect(mock).toBeCalledWith(
            {
                a1: '1',
                a2: '2',
            },
            {
                id: 'abc',
            },
        );
    });
});
