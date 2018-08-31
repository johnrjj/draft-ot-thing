import { Record, Map } from 'immutable';
import { OperationType } from './OperationType';
import { AttributeType } from './AttributeType';

const defaultRecord: {
  type: OperationType;
  numOfChars: number;
  text: string;
  attributes: Map<AttributeType, any>;
} = {
  type: 'insert',
  numOfChars: 0,
  text: '',
  attributes: Map(),
};

const OperationRecord = Record(defaultRecord);

class Operation extends OperationRecord {
  isInsert() {
    return this.get('type') === 'insert';
  }

  isRetain() {
    return this.get('type') === 'retain';
  }

  isDelete() {
    return this.get('type') === 'delete';
  }

  toString() {
    return `${this.get('type')} ${this.get('text') || this.get('numOfChars')}`;
  }
}

export default Operation;
