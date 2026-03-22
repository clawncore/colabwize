import React, { useEffect, useState } from 'react';
import { Editor } from '@tiptap/react';
import { CitationRegistryService, RegistryEntry } from '../../services/CitationRegistryService';

interface AutoBibliographyProps {
    editor: Editor | null;
    projectId: string;
    style?: string;
}

export const AutoBibliography: React.FC<AutoBibliographyProps> = ({
    editor,
    projectId,
    style = 'APA'
}) => {
    const [citations, setCitations] = useState<RegistryEntry[]>([]);

    useEffect(() => {
        if (!editor) return;

        const updateBibliography = () => {
            const ids = new Set<string>();
            editor.state.doc.descendants((node) => {
                if (node.type.name === 'citation' && node.attrs.citationId) {
                    ids.add(node.attrs.citationId);
                }
            });

            const uniqueIds = Array.from(ids);
            const entries = uniqueIds
                .map(id => CitationRegistryService.getCitation(id))
                .filter((entry): entry is RegistryEntry => entry !== undefined)
                .sort((a, b) => {
                    const authorA = (a.authors && a.authors[0]) || '';
                    const authorB = (b.authors && b.authors[0]) || '';
                    return authorA.localeCompare(authorB);
                });

            setCitations(entries);
        };

        // Update initially
        updateBibliography();

        // Listen for editor updates
        editor.on('update', updateBibliography);
        editor.on('transaction', updateBibliography);

        return () => {
            editor.off('update', updateBibliography);
            editor.off('transaction', updateBibliography);
        };
    }, [editor, projectId]);

    if (citations.length === 0) {
        return null;
    }

    return (
        <div className="bibliography-container mt-12 pt-8 border-t border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">References</h2>
            <div className="space-y-4">
                {citations.map((entry) => (
                    <BibliographyItem
                        key={entry.ref_key}
                        entry={entry}
                        style={style}
                    />
                ))}
            </div>
        </div>
    );
};

interface BibliographyItemProps {
    entry: RegistryEntry;
    style: string;
}

const BibliographyItem: React.FC<BibliographyItemProps> = ({ entry, style }) => {
    const handleClick = () => {
        if (entry.url) {
            window.open(entry.url, '_blank', 'noopener,noreferrer');
        }
    };

    const formattedText = formatBibliographyEntry(entry, style);

    return (
        <div
            id={`bib-${entry.ref_key}`}
            onClick={handleClick}
            className="bibliography-entry p-3 rounded-md hover:bg-blue-50 transition-all cursor-pointer border-l-4 border-transparent hover:border-blue-500 group"
        >
            <p className="text-gray-800 leading-relaxed">
                {formattedText}
                {entry.url && (
                    <span className="ml-2 text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
                        🔗
                    </span>
                )}
            </p>
        </div>
    );
};

function formatBibliographyEntry(entry: RegistryEntry, style: string): string {
    const authors = entry.authors || [];
    const year = entry.year || 'n.d.';
    const title = entry.sourceTitle || entry.raw_reference_text || 'Untitled';

    // Quick APA-like formatter
    let authorText = authors.length > 0 ? authors.join(', ') : 'Unknown Author';
    if (authors.length > 3) {
        authorText = authors[0] + ' et al.';
    }

    return `${authorText} (${year}). ${title}.`;
}
