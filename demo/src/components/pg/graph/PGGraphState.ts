import {Field, IDataHook} from "model-react";
import {string} from "parsimmon";
import {State} from "../../../model/State";
import {IPoint} from "../../../_types/IPoint";
import {radius} from "./drawing/Node";
import {getDistance} from "./util/getDistance";
import {Opt, VBool, VEnum, VNumber, VObject, VString} from "./util/verifiers";
import {IErrorData} from "./util/_types/IVerifier";
import {IEditNode} from "./_types/IEditNode";
import {IGraphEditorConfig} from "./_types/IGraphEditorConfig";
import {ISelection} from "./_types/ISelection";
import {IToolSelection} from "./_types/IToolSelection";
import {ITransformation} from "./_types/ITransformation";

const localStorageID = `model-checker-editorConfig`;
export class PGGraphState {
    protected showCodeEditor = new Field(false);

    protected transformation = new Field<ITransformation>({
        offset: {x: 0, y: 0},
        scale: 1,
    });

    protected boundingBox = new Field<IPoint>({x: 0, y: 0});
    protected config = new Field<IGraphEditorConfig>({
        grid: "none",
        showAxis: false,
        snap: {
            gridMajor: true,
            gridMinor: true,
            lines: false,
            points: true,
            disableAll: true,
        },
        snapDistance: {
            gridMajor: 10,
            gridMinor: 5,
        },
        zoomSpeed: 0.1,
        selectPointDistance: 15,
    });
    protected selection = new Field<null | ISelection>(null);
    protected editingArc = new Field<null | IEditNode>(null);
    protected simplifiedView = new Field<boolean>(false);

    protected tool = new Field<IToolSelection>("select");

    public PGState: State;

    /**
     * Creates a new graph state for a given LTS state
     * @param PGState The state that the graph state is for
     */
    public constructor(PGState: State) {
        this.PGState = PGState;

        const configText = localStorage.getItem(localStorageID);
        if (configText) this.loadConfig(configText);
    }

    /**
     * Selects the specified tool
     * @param tool The tool to be selected
     */
    public setSelectedTool(tool: IToolSelection): void {
        this.tool.set(tool);
    }

    /**
     * Retrieves the currently selected tool
     * @param hook The hook to subscribe to changes
     * @returns The currently selected tool
     */
    public getSelectedTool(hook?: IDataHook): IToolSelection {
        return this.tool.get(hook);
    }

    /**
     * Sets the node being edited
     * @param node The node to be edited
     */
    public setEditingNode(node: null | IEditNode): void {
        this.editingArc.set(node);
    }

    /**
     * Retrieves the currently selected node
     * @param hook The hook to subscibe to changes
     * @returns The currently selected node
     */
    public getEditingNode(hook?: IDataHook): null | IEditNode {
        return this.editingArc.get(hook);
    }

    // Transformation related methods
    /**
     * Retrieves the transformation of the editor
     * @param hook The hook to subscribe to changes
     * @returns The transformation of the editor
     */
    public getTransformation(hook?: IDataHook): ITransformation {
        return this.transformation.get(hook);
    }

    /**
     * Sets the transformation of the editor
     * @param transformation The new transformation
     */
    public setTransformation(transformation: ITransformation): void {
        this.transformation.set(transformation);
    }

    /**
     * Translates the given amount in screen coordinates
     * @param x The amount on the x-axis
     * @param y The amount on the y-axis
     */
    public translate(x: number, y: number): void {
        const {offset, scale} = this.transformation.get();
        this.transformation.set({
            offset: {
                x: x + offset.x,
                y: y + offset.y,
            },
            scale,
        });
    }

    /**
     * Updates to the new scale and ensures that the target point remains in the same position
     * @param newScale The new scale to set
     * @param target The point that should stay in the same location (in screen coordinates, where (0,0) is the middle of the screen)
     */
    public scaleAt(newScale: number, target: IPoint): void {
        const {offset, scale} = this.transformation.get();

        const scalePos = {
            x: -offset.x + target.x,
            y: -offset.y + target.y,
        };

        const delta = {
            x: (scalePos.x / scale) * newScale - scalePos.x,
            y: (scalePos.y / scale) * newScale - scalePos.y,
        };

        this.transformation.set({
            offset: {
                x: offset.x - delta.x,
                y: offset.y - delta.y,
            },
            scale: newScale,
        });
    }

    /**
     * Sets the available area
     * @param area The hook to subscribe to changes
     */
    public setArea(area: IPoint): void {
        this.boundingBox.set(area);
    }

    /**
     * Retrieves the area of the drawing space
     * @param hook The hook to subscribe to changes
     * @returns The available area
     */
    public getArea(hook?: IDataHook): IPoint {
        return this.boundingBox.get(hook);
    }

    /**
     * Automatically sets the scale and position to fit the current drawing
     */
    public autoPosition(): void {
        const {minX, maxX, minY, maxY} = this.PGState.getBoundingBox();
        const center = {
            x: (maxX + minX) / 2,
            y: (maxY + minY) / 2,
        };
        const padding = 2 * radius + radius; // 2*radius to fit everything, + radius as random margin
        const size = {
            width: maxX - minX + padding,
            height: maxY - minY + padding,
        };
        if (size.width == 0 || size.width == 0) return;
        const availableSize = this.boundingBox.get();

        const scale = Math.min(
            availableSize.x / size.width,
            availableSize.y / size.height
        );
        this.setTransformation({
            scale,
            offset: {
                x: -center.x * scale,
                y: -center.y * scale,
            },
        });
    }

    // Visual settings
    /**
     * Retrieves the grid size based on the current zoom factor
     * @param hook The hook to subscribe to changes
     * @returns The distance between lines on the grid, in world units
     */
    public getGridSize(hook?: IDataHook): number {
        const {scale} = this.transformation.get(hook);

        // TODO: make configurarable
        const desiredSpacing = {
            pixels: 50, // The minimum number of pixels between lines in the grid on the screen
            units: 100, // The base units on the screen
        };

        const baseScale = desiredSpacing.units / desiredSpacing.pixels;
        const relScale = scale * baseScale;
        const baseFactor = baseScale / Math.pow(10, Math.floor(Math.log10(relScale)));

        // Try to subdivide the factor further
        let factor = baseFactor;
        if (factor * 0.2 * scale > 1) {
            factor *= 0.2;
        } else if (factor * 0.5 * scale > 1) {
            factor *= 0.5;
        }

        return factor * desiredSpacing.pixels;
    }

    /**
     * Checks whether the code editor for the graph is currently visible
     * @param hook The hook to subscribe to changes
     * @returns Whetherh the code editor is visible
     */
    public isCodeEditorVisible(hook?: IDataHook): boolean {
        return this.showCodeEditor.get(hook);
    }

    /**
     * Sets whether or not the code editor should be visible
     * @param visible Whether or not the code editor is visible
     */
    public setCodeEditorVisible(visible: boolean): void {
        this.showCodeEditor.set(visible);
    }

    /**
     * Checks whether we should display the simplified view
     * @param hook The hook to susbscribe to changes
     * @returns Whether to display simplified view
     */
    public useSimplifiedView(hook?: IDataHook): boolean {
        return this.simplifiedView.get(hook);
    }

    /**
     * Enables or disables the simplified view
     * @param simplified Whether to use the simplified view
     */
    public enableSimplifiedView(simplified: boolean): void {
        this.simplifiedView.set(simplified);
    }

    /**
     * Retrieves the configuration of the editor
     * @param hook The hook to subscribe to changes
     * @returns The retrieved configuration
     */
    public getConfig(hook?: IDataHook): IGraphEditorConfig {
        return this.config.get(hook);
    }

    /**
     * Updates teh config of the editor
     * @param config The new configuration to be used
     */
    public setConfig(config: IGraphEditorConfig): void {
        this.config.set(config);
        localStorage.setItem(localStorageID, JSON.stringify(config));
    }

    /**
     * Tries to load the given string config
     * @param configText The config to be loaded in json text form
     * @returns The errors in the provided data
     */
    public loadConfig(configText: string): IErrorData[] | void {
        try {
            const configRaw = JSON.parse(configText);
            const def = this.config.get();

            const OptPositiveNum = (fb: number) => Opt(VNumber({min: 0}), {fb});
            const OptBool = (fb: boolean) => Opt(VBool(), {fb});

            const verifier = VObject({
                showAxis: OptBool(def.showAxis),
                grid: Opt(VEnum(["none", "major", "minor"] as const), {fb: def.grid}),

                snap: Opt(
                    VObject({
                        gridMajor: OptBool(def.snap.gridMajor),
                        gridMinor: OptBool(def.snap.gridMinor),
                        lines: OptBool(def.snap.lines),
                        points: OptBool(def.snap.points),
                        disableAll: OptBool(def.snap.disableAll),
                    }),
                    {fb: def.snap}
                ),

                snapDistance: Opt(
                    VObject({
                        gridMajor: OptPositiveNum(def.snapDistance.gridMajor),
                        gridMinor: OptPositiveNum(def.snapDistance.gridMinor),
                    }),
                    {fb: def.snapDistance}
                ),

                zoomSpeed: Opt(VNumber({min: 0.01, max: 0.5}), {fb: def.zoomSpeed}),
                selectPointDistance: OptPositiveNum(def.selectPointDistance),
            });

            const res = verifier(configRaw);
            if ("result" in res) {
                this.setConfig(res.result);
            } else {
                return res.errors;
            }
        } catch (e) {
            return [{message: `Invalid JSON: ${e.message}`}];
        }
    }

    // State selection
    /**
     * Updates the currently selected node
     * @param selection The new selection
     */
    public setSelection(selection: ISelection | null): void {
        this.selection.set(selection);
    }

    /**
     * Retrieves the current selection
     * @param hook The hook to subscribe to changes
     * @returns The current selection
     */
    public getSelection(hook?: IDataHook): ISelection | null {
        return this.selection.get(hook);
    }

    // Util
    /**
     * Snaps the given point to the grid depending on the selected sensitivity
     * @param point The point to be snapped
     * @param settings The settings to use for the snapping
     * @returns The snapped point
     */
    public snap(
        point: IPoint,
        settings?: {
            snap: IGraphEditorConfig["snap"];
            snapDistance: IGraphEditorConfig["snapDistance"];
        }
    ): IPoint {
        settings = settings ?? this.getConfig();
        if (settings.snap.disableAll) return point;

        const scale = this.getTransformation().scale;

        // Snap to any point on the grid
        if (settings.snap.gridMajor) {
            const majorSnapDistance = settings.snapDistance.gridMajor / scale; // Adjusted for view space
            const gridline = this.getGridSize();
            const snapPoint = {
                x: Math.round(point.x / gridline) * gridline,
                y: Math.round(point.y / gridline) * gridline,
            };

            const dist = getDistance(snapPoint, point);
            if (dist < majorSnapDistance) return {...snapPoint};
        }

        if (settings.snap.gridMinor) {
            const minorSnapDistance = settings.snapDistance.gridMinor / scale; // Adjusted for view space
            const gridline = this.getGridSize() / 5;
            const snapPoint = {
                x: Math.round(point.x / gridline) * gridline,
                y: Math.round(point.y / gridline) * gridline,
            };

            const dist = getDistance(snapPoint, point);
            if (dist < minorSnapDistance) return {...snapPoint};
        }

        return point;
    }
}
