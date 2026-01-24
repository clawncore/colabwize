import { Node, mergeAttributes, nodeInputRule } from '@tiptap/core';
import katex from 'katex';
import 'katex/dist/katex.min.css';

export const MathExtension = Node.create({
    name: 'math',

    group: 'inline',

    inline: true,

    draggable: true,

    atom: true,

    addAttributes() {
        return {
            latex: {
                default: 'x',
            },
        };
    },

    parseHTML() {
        return [
            {
                tag: 'span[data-type="math"]',
            },
        ];
    },

    renderHTML({ HTMLAttributes }) {
        return ['span', mergeAttributes(HTMLAttributes, { 'data-type': 'math' })];
    },

    addNodeView() {
        return ({ node }) => {
            const dom = document.createElement('span');
            dom.classList.add('math-node');
            dom.style.cursor = 'pointer';
            dom.style.padding = '0 2px';
            dom.style.display = 'inline-block';
            dom.style.verticalAlign = 'middle';
            dom.contentEditable = 'false'; // IMPORTANT: Prevent editing inside

            const latex = node.attrs.latex;

            try {
                katex.render(latex, dom, {
                    throwOnError: false,
                    errorColor: '#cc0000',
                });

                // Add a tooltip or title to show the latex source on hover
                dom.title = latex;
            } catch (error) {
                dom.textContent = latex;
                dom.style.color = 'red';
            }

            return {
                dom,
            };
        };
    },

    addInputRules() {
        return [
            // Regex to match $...$ for inline math (simple implementation)
            nodeInputRule({
                find: /\$([^\$]+)\$/,
                type: this.type,
                getAttributes: (match) => {
                    return {
                        latex: match[1],
                    };
                },
            }),
        ];
    },
});
