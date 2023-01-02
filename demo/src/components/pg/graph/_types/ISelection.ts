export type ISelection =
    | {
          type: "node";
          node: number;
      }
    | {
          type: "arc";
          from: number;
          to: number;
      };
