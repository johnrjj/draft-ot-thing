import { EditorState } from 'draft-js';
import * as jsDiff from 'diff';
import { Transformation } from '../immutable/Transformation';
import { diff as mydiff } from '../../diff/diff';
var diff2 = require('immutablediff');

const generateTextTransformationForEditorState = (
  previousEditorState: EditorState,
  editorState: EditorState
) => {
  const prevContentState = previousEditorState.getCurrentContent();
  const newContentState = editorState.getCurrentContent();

  const prevBlockMap = prevContentState.getBlockMap();
  const newBlockMap = newContentState.getBlockMap();

  // console.log('prev_block_map', prevBlockMap.toJS());
  // console.log('updated_block_map', newBlockMap.toJS());

  // console.log('REEEEEEEEE', mydiff(prevContentState, newContentState).toJS())
  // console.log('REEEEEEEEE2', diff2(prevContentState, newContentState).toJS())

  const prevBlockMapKeySequence = prevBlockMap.keySeq();
  const newBlockMapKeySequence = newBlockMap.keySeq();

  const prevBlockLength = prevBlockMapKeySequence.size;
  const newBlockLength = newBlockMapKeySequence.size;

  const sizesEqual = prevBlockLength === newBlockLength;
  const hasBlockInserts = prevBlockLength < newBlockLength;
  const hasBlockDeletes = prevBlockLength > newBlockLength;
  // if (sizesEqual) {
  //   console.log('Block sizes are equal, only need to compare blocks themselves');
  // } else {
  //   console.log('Block sizes not equal');
  //   if (hasBlockInserts) {
  //     console.log('Inserts detected')
  //   }
  //   if (hasBlockDeletes) {
  //     console.log('Deletes detected');
  //   }
  // }

  let prevCount = 0;
  let newCount = 0;

  let transformation = new Transformation();
  console.log(sizesEqual);

  while (prevCount < prevBlockLength && newCount < newBlockLength) {
    console.log(`iteration ${prevCount}`);

    const prevBlockCurrentKey = prevBlockMapKeySequence.get(prevCount);
    const newBlockCurrentKey = newBlockMapKeySequence.get(newCount);

    const prevBlock = prevBlockMap.get(prevBlockCurrentKey);
    const newBlock = newBlockMap.get(newBlockCurrentKey);

    if (prevBlockCurrentKey === newBlockCurrentKey) {
      console.log('keys are equal');
      const prevBlockText = prevBlock.getText();
      const newBlockText = newBlock.getText();
      // console.log(prevBlockText, newBlockText);

      // same text, just need a retain block
      if (prevBlockText === newBlockText) {
        console.log('Text is the same');
        transformation = transformation.retain(newBlock.getLength() + 1) as Transformation;
      } else {
        console.log('Text is different');
        const differences = jsDiff.diffChars(prevBlockText, newBlockText);
        console.log(differences);
        differences.forEach(diff => {
          if (diff.added) {
            transformation = transformation.insert(diff.value) as Transformation;
          } else if (diff.removed) {
            transformation = transformation.delete(diff.count) as Transformation;
          } else {
            transformation = transformation.retain(diff.count) as Transformation;
          }
        });
      }
      prevCount++;
      newCount++;
    } else {
      console.log(
        `keys are not equal. prevKey: ${prevBlockCurrentKey}, newKey: ${newBlockCurrentKey}`
      );
      // if prev doesnty have new key, implies addition
      const isDelete = !newBlockMapKeySequence.contains(prevBlockCurrentKey);
      const isInsert = !prevBlockMapKeySequence.contains(newBlockCurrentKey);
      console.log(`isInsertion: ${isInsert}`);
      console.log(`isDelete: ${isDelete}`);

      const prevBlock = prevBlockMap.get(prevBlockCurrentKey);
      const newBlock = newBlockMap.get(newBlockCurrentKey);

      const prevBlockText = prevBlock.getText();
      const newBlockText = newBlock.getText();

      if (isDelete) {
        prevCount++;
        console.error('todo delete');
      } else if (isInsert) {
        // https://stackoverflow.com/questions/43512897/immutable-js-orderedmap-insert-a-new-entry-after-a-given-key/43513374
        if (prevBlockText === newBlockText) {
          console.error('styles are different need to write support for this');
        }
        const differences = jsDiff.diffChars(prevBlockText, newBlockText);
        console.log(differences);
        console.error('todo insert');
        newCount++;
      } else {
        console.error('this shouldnt happen');
      }
    }
    // prevent infinte loop until we're ready to remove
  }

  // finish up the loop for any remaining
  while (newCount < newBlockLength) {
    console.log('has more on new block');
    transformation = transformation.insert('\n') as Transformation;
    transformation = transformation.retain(1) as Transformation;

    const newBlockCurrentKey = newBlockMapKeySequence.get(newCount);

    const newBlock = newBlockMap.get(newBlockCurrentKey);
    if (newBlock.getText().length > 0) {
      transformation = transformation.insert(newBlock.getText()) as Transformation;
    }

    newCount++;
  }
  while (prevCount < prevBlockLength) {
    console.error('todo: has more on prev block');
    prevCount++;
  }

  console.log('here', transformation.toJS());

  // if (prevBlockCurrentKey === newBlockCurrentKey) {
  //   console.log('keys are same, compare keys');

  //   const prevBlockText = prevBlock.getText();
  //   const newBlockText = newBlock.getText();
  //   console.log(newBlock.getCharacterList().toJS())

  //   const prevBlockCharList = prevBlock.getCharacterList();
  //   const newBlockCharList = newBlock.getCharacterList();

  //   const prevTestChar = prevBlockCharList.first();
  //   const newTestChar = newBlockCharList.first();
  //   const x = prevTestChar.getStyle();
  //   const y = newTestChar.getStyle();
  //   console.log(x.toArray(), y.toArray());
  //   console.log(jsDiff.diffArrays(x.toArray(), y.toArray()));
  //   // console.log(diff2(prevBlockCharList, newBlockCharList).toJS());

  //   // diff character list too ?

  //   const hasSameText = prevBlockText === newBlockText;

  //   if (hasSameText) {
  //     console.log('Has same text, only need to check for attributes');
  //     retain += newBlock.getLength();
  //   } else {
  //     console.log(`New text detected in block ${prevBlockCurrentKey}`)
  //     console.log(jsDiff.diffChars(prevBlockText, newBlockText))
  //   }
  // } else {
  //   console.log('keys are different, delete or insert');
  // }

  const EverythingButFirstElement = prevBlockMap.rest();
  const EverythingButFirstElement2 = newBlockMap.rest();

  // console.log('HERE JJJJJ', foo);
  // // foo.first()

  // console.log('REEEEEEEEE3', mydiff(prevBlockMap, newBlockMap).toJS())
  // console.log('REEEEEEEEE4', diff2(prevBlockMap, newBlockMap).toJS())

  // console.log('prev_block_map_key_seq', prevBlockMapKeySequence.toJS());
  // console.log('updated_block_map_key_seq', newBlockMapKeySequence.toJS());

  // prevContentState.getBlockForKey();
  // newContentState.getBlockForKey();

  // const x = newBlockMap.get(newBlockMapKeySequence.slice());
  // console.log('YEEEEEEEEEEEE', x);

  // newBlockMap.reduce((_, cur, i) => {

  //   console.log('REEEEEEEEE-CHARLIST', mydiff(cur && cur.getCharacterList(), prevBlockMap[i] && prevBlockMap.get(i).getCharacterList()).toJS())
  // }, {});

  const previousText = previousEditorState.getCurrentContent().getPlainText();
  const currentText = editorState.getCurrentContent().getPlainText();
  const differences = jsDiff.diffChars(previousText, currentText);
  // console.log('major diff', jsDiff.diffJson(prevContentState.toJS(), newContentState.toJS()));
  // console.log('DIFFERENCES FROM JS DIFF', differences);
  const diff = differences.reduce((transformation, diff) => {
    if (diff.added) {
      return transformation.insert(diff.value);
    }
    if (diff.removed) {
      return transformation.delete(diff.count);
    }
    // console.log(diff);
    return transformation.retain(diff.count);
  }, new Transformation());
  // console.log('DIFF', diff.toJS());
  return transformation;
};

export { generateTextTransformationForEditorState };
