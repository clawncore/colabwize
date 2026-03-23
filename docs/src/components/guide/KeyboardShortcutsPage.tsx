import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";

const KeyboardShortcutsPage: React.FC = () => {
  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <Card className="bg-white">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-gray-900">
            Keyboard Shortcuts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-6 text-gray-800">
            This document provides a comprehensive list of keyboard shortcuts
            available in the ColabWize editor to help you work more efficiently.
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-gray-900">
              Text Formatting
            </h2>
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-100">
                  <TableHead className="w-1/2 text-gray-900 font-bold">
                    Shortcut
                  </TableHead>
                  <TableHead className="text-gray-900 font-bold">
                    Action
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow className="hover:bg-gray-50">
                  <TableCell className="text-gray-800">
                    Cmd+B (Mac) / Ctrl+B (Windows)
                  </TableCell>
                  <TableCell className="text-gray-800">
                    Toggle bold formatting
                  </TableCell>
                </TableRow>
                <TableRow className="hover:bg-gray-50">
                  <TableCell className="text-gray-800">
                    Cmd+I (Mac) / Ctrl+I (Windows)
                  </TableCell>
                  <TableCell className="text-gray-800">
                    Toggle italic formatting
                  </TableCell>
                </TableRow>
                <TableRow className="hover:bg-gray-50">
                  <TableCell className="text-gray-800">
                    Cmd+U (Mac) / Ctrl+U (Windows)
                  </TableCell>
                  <TableCell className="text-gray-800">
                    Toggle underline formatting
                  </TableCell>
                </TableRow>
                <TableRow className="hover:bg-gray-50">
                  <TableCell className="text-gray-800">
                    Cmd+Shift+X (Mac) / Ctrl+Shift+X (Windows)
                  </TableCell>
                  <TableCell className="text-gray-800">
                    Toggle strikethrough formatting
                  </TableCell>
                </TableRow>
                <TableRow className="hover:bg-gray-50">
                  <TableCell className="text-gray-800">
                    Cmd+Shift+2 (Mac) / Ctrl+Shift+2 (Windows)
                  </TableCell>
                  <TableCell className="text-gray-800">
                    Toggle superscript formatting
                  </TableCell>
                </TableRow>
                <TableRow className="hover:bg-gray-50">
                  <TableCell className="text-gray-800">
                    Cmd+Shift+S (Mac) / Ctrl+Shift+S (Windows)
                  </TableCell>
                  <TableCell className="text-gray-800">
                    Toggle subscript formatting
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-gray-900">
              Headings
            </h2>
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-100">
                  <TableHead className="w-1/2 text-gray-900 font-bold">
                    Shortcut
                  </TableHead>
                  <TableHead className="text-gray-900 font-bold">
                    Action
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow className="hover:bg-gray-50">
                  <TableCell className="text-gray-800">
                    Cmd+1 (Mac) / Ctrl+1 (Windows)
                  </TableCell>
                  <TableCell className="text-gray-800">
                    Apply Heading 1
                  </TableCell>
                </TableRow>
                <TableRow className="hover:bg-gray-50">
                  <TableCell className="text-gray-800">
                    Cmd+2 (Mac) / Ctrl+2 (Windows)
                  </TableCell>
                  <TableCell className="text-gray-800">
                    Apply Heading 2
                  </TableCell>
                </TableRow>
                <TableRow className="hover:bg-gray-50">
                  <TableCell className="text-gray-800">
                    Cmd+3 (Mac) / Ctrl+3 (Windows)
                  </TableCell>
                  <TableCell className="text-gray-800">
                    Apply Heading 3
                  </TableCell>
                </TableRow>
                <TableRow className="hover:bg-gray-50">
                  <TableCell className="text-gray-800">
                    Cmd+Shift+Q (Mac) / Ctrl+Shift+Q (Windows)
                  </TableCell>
                  <TableCell className="text-gray-800">
                    Toggle blockquote
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-gray-900">Lists</h2>
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-100">
                  <TableHead className="w-1/2 text-gray-900 font-bold">
                    Shortcut
                  </TableHead>
                  <TableHead className="text-gray-900 font-bold">
                    Action
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow className="hover:bg-gray-50">
                  <TableCell className="text-gray-800">
                    Cmd+Shift+2 (Mac) / Ctrl+Shift+2 (Windows)
                  </TableCell>
                  <TableCell className="text-gray-800">
                    Create two-column layout
                  </TableCell>
                </TableRow>
                <TableRow className="hover:bg-gray-50">
                  <TableCell className="text-gray-800">
                    Cmd+Shift+3 (Mac) / Ctrl+Shift+3 (Windows)
                  </TableCell>
                  <TableCell className="text-gray-800">
                    Create three-column layout
                  </TableCell>
                </TableRow>
                <TableRow className="hover:bg-gray-50">
                  <TableCell className="text-gray-800">
                    Cmd+Shift+L (Mac) / Ctrl+Shift+L (Windows)
                  </TableCell>
                  <TableCell className="text-gray-800">
                    Toggle bullet list
                  </TableCell>
                </TableRow>
                <TableRow className="hover:bg-gray-50">
                  <TableCell className="text-gray-800">
                    Cmd+Shift+O (Mac) / Ctrl+Shift+O (Windows)
                  </TableCell>
                  <TableCell className="text-gray-800">
                    Toggle ordered/numbered list
                  </TableCell>
                </TableRow>
                <TableRow className="hover:bg-gray-50">
                  <TableCell className="text-gray-800">
                    Cmd+Shift+C (Mac) / Ctrl+Shift+C (Windows)
                  </TableCell>
                  <TableCell className="text-gray-800">
                    Toggle checklist
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-gray-900">
              Text Alignment
            </h2>
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-100">
                  <TableHead className="w-1/2 text-gray-900 font-bold">
                    Shortcut
                  </TableHead>
                  <TableHead className="text-gray-900 font-bold">
                    Action
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow className="hover:bg-gray-50">
                  <TableCell className="text-gray-800">
                    Cmd+Shift+L (Mac) / Ctrl+Shift+L (Windows)
                  </TableCell>
                  <TableCell className="text-gray-800">
                    Align text left
                  </TableCell>
                </TableRow>
                <TableRow className="hover:bg-gray-50">
                  <TableCell className="text-gray-800">
                    Cmd+Shift+E (Mac) / Ctrl+Shift+E (Windows)
                  </TableCell>
                  <TableCell className="text-gray-800">
                    Align text center
                  </TableCell>
                </TableRow>
                <TableRow className="hover:bg-gray-50">
                  <TableCell className="text-gray-800">
                    Cmd+Shift+R (Mac) / Ctrl+Shift+R (Windows)
                  </TableCell>
                  <TableCell className="text-gray-800">
                    Align text right
                  </TableCell>
                </TableRow>
                <TableRow className="hover:bg-gray-50">
                  <TableCell className="text-gray-800">
                    Cmd+Shift+J (Mac) / Ctrl+Shift+J (Windows)
                  </TableCell>
                  <TableCell className="text-gray-800">Justify text</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-gray-900">
              Indentation
            </h2>
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-100">
                  <TableHead className="w-1/2 text-gray-900 font-bold">
                    Shortcut
                  </TableHead>
                  <TableHead className="text-gray-900 font-bold">
                    Action
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow className="hover:bg-gray-50">
                  <TableCell className="text-gray-800">
                    Cmd+Shift+- (Mac) / Ctrl+Shift+- (Windows)
                  </TableCell>
                  <TableCell className="text-gray-800">
                    Decrease indent
                  </TableCell>
                </TableRow>
                <TableRow className="hover:bg-gray-50">
                  <TableCell className="text-gray-800">
                    Cmd+Shift++ (Mac) / Ctrl+Shift++ (Windows)
                  </TableCell>
                  <TableCell className="text-gray-800">
                    Increase indent
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-gray-900">
              Insert Elements
            </h2>
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-100">
                  <TableHead className="w-1/2 text-gray-900 font-bold">
                    Shortcut
                  </TableHead>
                  <TableHead className="text-gray-900 font-bold">
                    Action
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow className="hover:bg-gray-50">
                  <TableCell className="text-gray-800">
                    Cmd+K (Mac) / Ctrl+K (Windows)
                  </TableCell>
                  <TableCell className="text-gray-800">Insert link</TableCell>
                </TableRow>
                <TableRow className="hover:bg-gray-50">
                  <TableCell className="text-gray-800">
                    Cmd+Shift+I (Mac) / Ctrl+Shift+I (Windows)
                  </TableCell>
                  <TableCell className="text-gray-800">Insert image</TableCell>
                </TableRow>
                <TableRow className="hover:bg-gray-50">
                  <TableCell className="text-gray-800">
                    Cmd+Shift+G (Mac) / Ctrl+Shift+G (Windows)
                  </TableCell>
                  <TableCell className="text-gray-800">
                    Search online images
                  </TableCell>
                </TableRow>
                <TableRow className="hover:bg-gray-50">
                  <TableCell className="text-gray-800">
                    Cmd+Shift+T (Mac) / Ctrl+Shift+T (Windows)
                  </TableCell>
                  <TableCell className="text-gray-800">Insert table</TableCell>
                </TableRow>
                <TableRow className="hover:bg-gray-50">
                  <TableCell className="text-gray-800">
                    Cmd+Shift+C (Mac) / Ctrl+Shift+C (Windows)
                  </TableCell>
                  <TableCell className="text-gray-800">
                    Insert code block
                  </TableCell>
                </TableRow>
                <TableRow className="hover:bg-gray-50">
                  <TableCell className="text-gray-800">
                    Cmd+Shift+H (Mac) / Ctrl+Shift+H (Windows)
                  </TableCell>
                  <TableCell className="text-gray-800">
                    Insert horizontal rule
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-gray-900">
              Academic Features
            </h2>
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-100">
                  <TableHead className="w-1/2 text-gray-900 font-bold">
                    Shortcut
                  </TableHead>
                  <TableHead className="text-gray-900 font-bold">
                    Action
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow className="hover:bg-gray-50">
                  <TableCell className="text-gray-800">
                    Cmd+Shift+A (Mac) / Ctrl+Shift+A (Windows)
                  </TableCell>
                  <TableCell className="text-gray-800">Add citation</TableCell>
                </TableRow>
                <TableRow className="hover:bg-gray-50">
                  <TableCell className="text-gray-800">
                    Cmd+Shift+E (Mac) / Ctrl+Shift+E (Windows)
                  </TableCell>
                  <TableCell className="text-gray-800">Edit citation</TableCell>
                </TableRow>
                <TableRow className="hover:bg-gray-50">
                  <TableCell className="text-gray-800">
                    Cmd+Shift+R (Mac) / Ctrl+Shift+R (Windows)
                  </TableCell>
                  <TableCell className="text-gray-800">
                    Insert reference list
                  </TableCell>
                </TableRow>
                <TableRow className="hover:bg-gray-50">
                  <TableCell className="text-gray-800">
                    Cmd+Shift+F (Mac) / Ctrl+Shift+F (Windows)
                  </TableCell>
                  <TableCell className="text-gray-800">Add footnote</TableCell>
                </TableRow>
                <TableRow className="hover:bg-gray-50">
                  <TableCell className="text-gray-800">
                    Cmd+Shift+I (Mac) / Ctrl+Shift+I (Windows)
                  </TableCell>
                  <TableCell className="text-gray-800">
                    Import document
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 text-gray-900">Note</h2>
            <ul className="list-disc pl-5 space-y-2 text-gray-800">
              <li>On Windows/Linux, replace "Cmd" with "Ctrl"</li>
              <li>Some shortcuts may vary depending on your keyboard layout</li>
              <li>
                All shortcuts work in the main editor area when it's focused
              </li>
            </ul>
          </section>
        </CardContent>
      </Card>
    </div>
  );
};

export default KeyboardShortcutsPage;
