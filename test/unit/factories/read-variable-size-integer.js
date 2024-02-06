import { createReadVariableSizeInteger } from '../../../src/factories/read-variable-size-integer';
import { readVariableSizeIntegerLength } from '../../../src/functions/read-variable-size-integer-length';

/*
 * THIS IS JUST HERE TO DOUBLECHECK MY IMPLEMENTATION
 * const readVint = (dataView, start = 0) => {
 *     const length = 8 - Math.floor(Math.log2(dataView.getUint8(start)));
 *     if (length > 8) {
 *         throw new Error(`Unrepresentable length: ${length}`);
 *     }
 *     if (start + length > dataView.byteLength) {
 *         return null;
 *     }
 *     let value = dataView.getUint8(start) & ((1 << (8 - length)) - 1);
 *     for (let i = 1; i < length; i += 1) {
 *         if (i === 7) {
 *         if (value >= 2 ** 8 && dataView.getUint8(start + 7) > 0) {
 *             return { length, value: -1 };
 *         }
 *         }
 *         value *= 2 ** 8;
 *         value += dataView.getUint8(start + i);
 *     }
 *     return { length, value };
 * }
 */

describe('readVariableSizeInteger()', () => {
    let dataView;
    let readVariableSizeInteger;

    beforeEach(() => {
        dataView = new DataView(new ArrayBuffer(10));
        readVariableSizeInteger = createReadVariableSizeInteger(readVariableSizeIntegerLength);
    });

    describe('with a variable size integer encoded in one byte', () => {
        beforeEach(() => {
            dataView.setUint8(0, 255);
        });

        it('should return the correct length and value', () => {
            expect(readVariableSizeInteger(dataView, 0)).to.deep.equal({ length: 1, value: 127 });
        });
    });

    describe('with a variable size integer encoded in two bytes', () => {
        beforeEach(() => {
            dataView.setUint8(0, 0b01111111);
            dataView.setUint8(1, 255);
        });

        it('should return the correct length and value', () => {
            expect(readVariableSizeInteger(dataView, 0)).to.deep.equal({ length: 2, value: 16383 });
        });
    });

    describe('with a variable size integer encoded in eight bytes', () => {
        beforeEach(() => {
            dataView.setUint8(0, 0b00000001);
            dataView.setUint8(1, 255);
            dataView.setUint8(2, 255);
            dataView.setUint8(3, 255);
            dataView.setUint8(4, 255);
            dataView.setUint8(5, 255);
            dataView.setUint8(6, 255);
            dataView.setUint8(7, 255);
        });

        it('should return the correct length and value', () => {
            expect(readVariableSizeInteger(dataView, 0)).to.deep.equal({ length: 8, value: -1 });
        });
    });

    describe('with a variable size integer encoded in nine bytes', () => {
        beforeEach(() => {
            dataView.setUint8(0, 0);
            dataView.setUint8(1, 255);
            dataView.setUint8(2, 255);
            dataView.setUint8(3, 255);
            dataView.setUint8(4, 255);
            dataView.setUint8(5, 255);
            dataView.setUint8(6, 255);
            dataView.setUint8(7, 255);
            dataView.setUint8(8, 255);
        });

        it('should return the correct length and value', () => {
            expect(readVariableSizeInteger(dataView, 0)).to.deep.equal({ length: 9, value: -256 });
        });
    });
});
