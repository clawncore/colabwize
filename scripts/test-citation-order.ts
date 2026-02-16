// @ts-nocheck
import { CitationOrderManager } from '../src/services/citationOrderManager';

// Mock Editor State
const mockCitations = [
    { id: 'ref_A', pos: 10, text: '(Author, 2020)' },
    { id: 'ref_B', pos: 50, text: '(Other, 2021)' },
    { id: 'ref_A', pos: 100, text: '(Author, 2020)' } // Repeated citation
];

const mockEditor = {
    state: {
        doc: {
            descendants: (callback: any) => {
                mockCitations.forEach(c => {
                    callback({
                        type: { name: 'citation' },
                        attrs: { citationId: c.id, text: c.text }
                    }, c.pos);
                });
            }
        },
        tr: {
            setNodeMarkup: (pos, type, attrs) => {
                console.log(`Update at ${pos}: text -> ${attrs.text}`);
            }
        }
    },
    view: {
        dispatch: (tr: any) => console.log("Transaction dispatched")
    }
};

async function testOrder() {
    console.log("Testing IEEE Ordering...");
    await CitationOrderManager.updateCitationNodes(mockEditor, 'proj_1', 'ieee');

    // Expected: 
    // ref_A -> [1]
    // ref_B -> [2]
    // ref_A -> [1]
}

testOrder();
