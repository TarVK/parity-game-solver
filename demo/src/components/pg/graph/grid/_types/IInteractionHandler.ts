import React from "react";
import {IPoint} from "../../../../../_types/IPoint";

/**
 * An event handler to handle interactions with the plane
 * @param evt The original mouse event
 * @param worldPoint The mouse location in world coordinates
 * @param worldDelta The mouse's movement in world units
 */
export type IInteractionHandler = (
    evt: React.MouseEvent<HTMLDivElement>,
    worldPoint: IPoint,
    worldDelta: IPoint
) => void;
