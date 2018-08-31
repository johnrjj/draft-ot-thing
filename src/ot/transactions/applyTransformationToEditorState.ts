/* flow */
import { Transformation } from '../immutable/Transformation';
import {
  EditorState,
  Modifier,
  SelectionState,
  ContentState,
  ContentBlock,
  genKey,
} from 'draft-js';
import { List } from 'immutable';

const getSelectionStateForOffset = (contentState: ContentState, offset: number) => {
  let blockOffset = 0;
  let selectionState;
  contentState.getBlockMap().forEach(contentBlock => {
    console.log('blockOffset', blockOffset);
    console.log('offset', offset);

    const blockLength = contentBlock.getLength() + 1;
    if (blockOffset <= offset && offset <= blockLength) {
      selectionState = SelectionState.createEmpty(contentBlock.getKey())
        .set('anchorOffset', offset - blockOffset)
        .set('focusOffset', offset - blockOffset);
    }
    blockOffset += blockLength;
  });
  return selectionState;
};

const applyTransformationToEditorState = (
  transformation: Transformation,
  editorState: EditorState
): EditorState => {
  const contentState = editorState.getCurrentContent();
  let offset = 0;
  const operations = transformation.get('operations');
  const newContentState = operations.reduce((memoContentState, operation) => {
    const selectionState = getSelectionStateForOffset(memoContentState, offset);
    if (!selectionState && operation.get('type') === 'insert') {
      const key = genKey();
      const newBlock = new ContentBlock({
        key,
        type: 'unstyled',
        text: operation.get('text') || '',
        characterList: List(),
      });
      const newBlockMap = memoContentState.getBlockMap().set(key, newBlock);
      return ContentState.createFromBlockArray(newBlockMap.toArray())
        .set('selectionBefore', memoContentState.getSelectionBefore())
        .set('selectionAfter', memoContentState.getSelectionAfter());
      // return EditorState.push(
      //   editorState,
      //   ContentState
      //     .createFromBlockArray(newBlockMap.toArray())
      //     .set('selectionBefore', contentState.getSelectionBefore())
      //     .set('selectionAfter', contentState.getSelectionAfter())

      // var contentState = Modifier.insertText(
      //   editorState.getCurrentContent(),
      //   editorState.getSelection(),
      //   '\n',
      //   editorState.getCurrentInlineStyle(),
      //   null,
      // );

      // var newEditorState = EditorState.push(
      //   editorState,
      //   contentState,
      //   'insert-characters',
      // );

      // return EditorState.forceSelection(
      //   newEditorState,
      //   contentState.getSelectionAfter(),
      // );

      // return;
    }

    if (!selectionState) {
      return memoContentState;
    }

    const focusOffsetRemoval = selectionState.get('focusOffset') + operation.get('numOfChars');

    switch (operation.get('type')) {
      case 'insert':
        offset += operation.get('numOfChars');
        // console.log(operation.toJS());
        // console.log(focusOffsetRemoval);
        // console.log(selectionState.toJS());
        return Modifier.insertText(memoContentState, selectionState, operation.get('text'));
      case 'retain':
        offset += operation.get('numOfChars');
        break;
      case 'delete':
        return Modifier.removeRange(
          memoContentState,
          selectionState.set('focusOffset', focusOffsetRemoval),
          'backward'
        );
      default:
        return memoContentState;
    }
    return memoContentState;
  }, contentState);

  const newEditorState = EditorState.push(
    editorState,
    newContentState,
    'apply-transformation' as any
  );

  return newEditorState;
};

export { applyTransformationToEditorState };
