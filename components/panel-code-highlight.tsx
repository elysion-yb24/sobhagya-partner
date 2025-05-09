'use client';
import CodeHighlight from '@/components/highlight';
import IconCode from '@/components/icon/icon-code';
import React, { useState, ReactNode } from 'react';

interface PanelCodeHighlightProps {
    children: ReactNode;
    title?: string;
    codeHighlight?: string;
    id?: string;
    className?: string;
}

const PanelCodeHighlight = ({ children, title, codeHighlight, id, className = '' }: PanelCodeHighlightProps) => {
    const [toggleCode, setToggleCode] = useState(false);
    return (
        <div className={`panel ${className}`} id={id}>
            <div className="mb-5 flex items-center justify-between">
                <h5 className="text-lg font-semibold dark:text-white-light">{title}</h5>
            </div>
            {children}
            {toggleCode && (
                <CodeHighlight>
                    <pre className="language-xml">{codeHighlight}</pre>
                </CodeHighlight>
            )}
        </div>
    );
};

export default PanelCodeHighlight;
