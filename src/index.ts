/**
 * Example Pi extension: one tool. Replace it with the package's real work.
 */

import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { Type } from "typebox";

export default function extension(pi: ExtensionAPI) {
  pi.registerTool({
    name: "hello",
    label: "Hello",
    description: "Greet someone by name.",
    parameters: Type.Object({
      name: Type.String({ minLength: 1, description: "Who to greet." }),
    }, { additionalProperties: false }),
    async execute(_id, params) {
      return { content: [{ type: "text" as const, text: `Hello, ${params.name}.` }], details: {} };
    },
  });
}
