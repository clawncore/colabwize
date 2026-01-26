import React, { createContext, useContext } from 'react';

interface EditorContextType {
    editor: any; // Using any since the exact type would be complex
}

const EditorContext = createContext<EditorContextType | undefined>(undefined);

interface EditorProviderProps {
    children: React.ReactNode;
    editor: any; // Using any since the exact type would be complex
}

export const EditorProvider: React.FC<EditorProviderProps> = ({ children, editor }) => {
    return (
        <EditorContext.Provider value={{ editor }}>
            {children}
        </EditorContext.Provider>
    );
};

export const useEditorContext = (): EditorContextType => {
    const context = useContext(EditorContext);
    if (context === undefined) {
        throw new Error('useEditorContext must be used within an EditorProvider');
    }
    return context;
};