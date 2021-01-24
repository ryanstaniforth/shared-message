import { isNamedMessage, NamedMessage } from '../../NamedMessage';

describe('NamedMessage', (): void => {
    test('isNamedMessage should be true', (): void => {
        const message1: NamedMessage = {
            _name: 'test',
        };

        expect(isNamedMessage(message1)).toBe(true);
    });

    test('isNamedMessage should be false', (): void => {
        const message1 = {};

        const message2 = {
            // tslint:disable-next-line:no-null-keyword
            name: null,
        };

        const message3 = {
            name: 1,
        };

        const message4 = {
            name: {},
        };

        // tslint:disable-next-line:no-null-keyword
        for (const message of [null, undefined, '', 1, message1, message2, message3, message4]) {
            expect(isNamedMessage(message)).toBe(false);
        }
    });
});
