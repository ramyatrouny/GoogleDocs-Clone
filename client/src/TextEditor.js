import React, { useEffect } from 'react'
import Quill from 'quill'
import 'quill/dist/quill.snow.css'

export default function TextEditor() {
    useEffect(() => {
        new Quill('#container', {
            theme: 'snow'
        })
    }, []);

    return (
        <div id="container">
        </div>
    )
}
