import {PGGraphState} from "../../PGGraphState";
import {IInteractionHandler} from "./IInteractionHandler";
import {IKeyboardHandler} from "./IKeyboardHandler";

export type IEditorPlaneProps = {
    state: PGGraphState;
    onMouseDown?: IInteractionHandler;
    onMouseUp?: IInteractionHandler;
    onMouseMove?: IInteractionHandler;

    onMouseLeave?: React.MouseEventHandler<HTMLDivElement>;
    onMouseEnter?: React.MouseEventHandler<HTMLDivElement>;

    onKeyDown?: IKeyboardHandler;
    onKeyUp?: IKeyboardHandler;

    height?: string | number;
    width?: string | number;
};
