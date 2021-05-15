import React, { useCallback, useEffect, useState } from 'react'
import Quill from 'quill'
import io from 'socket.io-client';
import 'quill/dist/quill.snow.css'

const TOOLBAR_OPTIONS = [
    [{ header: [1, 2, 3, 4, 5, 6, false] }],
    [{ font: [] }],
    [{ list: "ordered" }, { list: "bullet" }],
    ["bold", "italic", "underline"],
    [{ color: [] }, { background: [] }],
    [{ script: "sub" }, { script: "super" }],
    [{ align: [] }],
    ["image", "blockquote", "code-block"],
    ["clean"]
]

export default function TextEditor() {

    const [socket, setSocket] = useState();
    const [quilly, setQuill] = useState();

    // To connect to the server Socket IO
    useEffect(() => {
        const s = io("http://localhost:3001");
        setSocket(s);

        return () => {
            s.disconnect();
        }
    }, []);

    // To handle any changes apply on the document
    useEffect(() => {
        if (socket === null || quilly === null) return;

        // handle quill text through Delta params
        const handler = (delta) => {
            quilly.updateContents(delta);
        }

        // Receive the broadcast from the server
        socket.on('receive-changes', handler);

        return () => {
            // To disconnect from the changes
            socket.off('receive-changes', handler)
        }
    }, [socket, quilly])

    // To handle emitting text changes
    useEffect(() => {
        if (socket === null || quilly === null) return;

        // To send to the server the changes through socket
        const handler = (delta, oldDelta, source) => {
            if (source !== 'user') return;
            socket.emit("send-changes", delta)
        }

        // API from quill that detects that the text has been changed 👆
        quilly.on('text-change', handler);

        return () => {
            // To disconnect from text change
            quilly.off('text-change', handler);
        }
    }, [socket, quilly])

    // UseCallback is exactly the same as useEffect but it only return an answer whenever
    // we have a value from the ref in the JSX
    const wrapperRef = useCallback((wrapper) => {
        if (wrapper === null) return;

        // To avoid appending make sure it's always null 
        wrapper.innerHTML = ""
        // Make sure that quill always append in a div in the ref container
        const editor = document.createElement('div');
        wrapper.append(editor);

        // Use the snow quill theme, and add attribute to the top toolbar 
        const q = new Quill(editor, {
            theme: 'snow',
            modules: {
                toolbar: TOOLBAR_OPTIONS
            }
        });

        setQuill(q);
    }, []);

    return (
        <div className="container" ref={wrapperRef}>
        </div>
    )
}
