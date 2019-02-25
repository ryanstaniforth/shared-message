export interface NamedMessage {
    _name: string;
}

export const isNamedMessage = (message: unknown): message is NamedMessage => {
    const coerced = message as NamedMessage;

    if (!(coerced instanceof Object)) {
        return false;
    }

    if (typeof coerced._name !== 'string') {
        return false;
    }

    return true;
};
