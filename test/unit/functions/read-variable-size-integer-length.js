import { readVariableSizeIntegerLength } from '../../../src/functions/read-variable-size-integer-length';

describe('readVariableSizeIntegerLength()', () => {

    let dataView;

    beforeEach(() => {
        dataView = new DataView(new ArrayBuffer(2));
    });

    describe('without any consecutive zero-value bits', () => {

        beforeEach(() => {
            dataView.setUint8(0, 0b11111111);
            dataView.setUint8(1, 255);
        });

        it('should return the correct length', () => {
            expect(readVariableSizeIntegerLength(dataView, 0)).to.equal(1);
        });

    });

    describe('with one consecutive zero-value bit', () => {

        beforeEach(() => {
            dataView.setUint8(0, 0b01111111);
            dataView.setUint8(1, 255);
        });

        it('should return the correct length', () => {
            expect(readVariableSizeIntegerLength(dataView, 0)).to.equal(2);
        });

    });

    describe('with two consecutive zero-value bits', () => {

        beforeEach(() => {
            dataView.setUint8(0, 0b00111111);
            dataView.setUint8(1, 255);
        });

        it('should return the correct length', () => {
            expect(readVariableSizeIntegerLength(dataView, 0)).to.equal(3);
        });

    });

    describe('with three consecutive zero-value bits', () => {

        beforeEach(() => {
            dataView.setUint8(0, 0b00011111);
            dataView.setUint8(1, 255);
        });

        it('should return the correct length', () => {
            expect(readVariableSizeIntegerLength(dataView, 0)).to.equal(4);
        });

    });

    describe('with four consecutive zero-value bits', () => {

        beforeEach(() => {
            dataView.setUint8(0, 0b00001111);
            dataView.setUint8(1, 255);
        });

        it('should return the correct length', () => {
            expect(readVariableSizeIntegerLength(dataView, 0)).to.equal(5);
        });

    });

    describe('with five consecutive zero-value bits', () => {

        beforeEach(() => {
            dataView.setUint8(0, 0b00000111);
            dataView.setUint8(1, 255);
        });

        it('should return the correct length', () => {
            expect(readVariableSizeIntegerLength(dataView, 0)).to.equal(6);
        });

    });

    describe('with six consecutive zero-value bits', () => {

        beforeEach(() => {
            dataView.setUint8(0, 0b00000011);
            dataView.setUint8(1, 255);
        });

        it('should return the correct length', () => {
            expect(readVariableSizeIntegerLength(dataView, 0)).to.equal(7);
        });

    });

    describe('with seven consecutive zero-value bits', () => {

        beforeEach(() => {
            dataView.setUint8(0, 0b00000001);
            dataView.setUint8(1, 255);
        });

        it('should return the correct length', () => {
            expect(readVariableSizeIntegerLength(dataView, 0)).to.equal(8);
        });

    });

    describe('with eight consecutive zero-value bits', () => {

        beforeEach(() => {
            dataView.setUint8(0, 0);
            dataView.setUint8(1, 255);
        });

        it('should return the correct length', () => {
            expect(readVariableSizeIntegerLength(dataView, 0)).to.equal(9);
        });

    });

    describe('with nine consecutive zero-value bits', () => {

        beforeEach(() => {
            dataView.setUint8(0, 0);
            dataView.setUint8(1, 0b01111111);
        });

        it('should return the correct length', () => {
            expect(readVariableSizeIntegerLength(dataView, 0)).to.equal(10);
        });

    });

});
