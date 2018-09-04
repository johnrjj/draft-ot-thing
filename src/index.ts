import { generateTextTransformationForEditorState } from "./ot/generators/editorStateTransformationGenerator";
import { Transformation } from "./ot/immutable/Transformation";
import { applyTransformationToEditorState } from "./ot/transactions/applyTransformationToEditorState";

export {
  Transformation,
  generateTextTransformationForEditorState,
  applyTransformationToEditorState,
};