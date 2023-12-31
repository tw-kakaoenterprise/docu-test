"use strict";
/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = require("../util");
const docsUrl = 'https://docusaurus.io/docs/docusaurus-core#link';
function isFullyResolvedUrl(urlString) {
    try {
        // href gets coerced to a string when it gets rendered anyway
        const url = new URL(String(urlString));
        if (url.protocol) {
            return true;
        }
    }
    catch (e) { }
    return false;
}
exports.default = (0, util_1.createRule)({
    name: 'no-html-links',
    meta: {
        type: 'problem',
        docs: {
            description: 'enforce using Docusaurus Link component instead of <a> tag',
            recommended: false,
        },
        schema: [
            {
                type: 'object',
                properties: {
                    ignoreFullyResolved: {
                        type: 'boolean',
                    },
                },
                additionalProperties: false,
            },
        ],
        messages: {
            link: `Do not use an \`<a>\` element to navigate. Use the \`<Link />\` component from \`@docusaurus/Link\` instead. See: ${docsUrl}`,
        },
    },
    defaultOptions: [
        {
            ignoreFullyResolved: false,
        },
    ],
    create(context, [options]) {
        const { ignoreFullyResolved } = options;
        return {
            JSXOpeningElement(node) {
                if (node.name.name !== 'a') {
                    return;
                }
                if (ignoreFullyResolved) {
                    const hrefAttr = node.attributes.find((attr) => attr.type === 'JSXAttribute' && attr.name.name === 'href');
                    if (hrefAttr?.value?.type === 'Literal') {
                        if (isFullyResolvedUrl(String(hrefAttr.value.value))) {
                            return;
                        }
                    }
                    if (hrefAttr?.value?.type === 'JSXExpressionContainer') {
                        const container = hrefAttr.value;
                        const { expression } = container;
                        if (expression.type === 'TemplateLiteral') {
                            // Simple static string template literals
                            if (expression.expressions.length === 0 &&
                                expression.quasis.length === 1 &&
                                expression.quasis[0]?.type === 'TemplateElement' &&
                                isFullyResolvedUrl(String(expression.quasis[0].value.raw))) {
                                return;
                            }
                            // TODO add more complex TemplateLiteral cases here
                        }
                    }
                }
                context.report({ node, messageId: 'link' });
            },
        };
    },
});
