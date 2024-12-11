// components/LicenseNotice.js

import { Separator } from "../ui/separator";

const LicenseNotice = () => {
  return (
    <div
      style={{
        padding: "20px",
        backgroundColor: "#f4f4f4",
        borderRadius: "10px",
      }}
    >
      <h2>License Notice for Emoji, Emoji Icon, Emoji Icon Image.</h2>

      <pre
        style={{
          backgroundColor: "#eaeaea",
          padding: "15px",
          borderRadius: "5px",
          overflow: "auto",
        }}
      >
        {`Emoji Icon License
Some emoji icons used on this site are provided by Google's Noto Emoji project.
These icons are licensed under the Apache License, Version 2.0.
You can view the full license at Apache License, Version 2.0.`}
      </pre>
      <p>
        Source:{" "}
        <a
          href="https://www.apache.org/licenses/LICENSE-2.0"
          target="_blank"
          rel="noopener noreferrer"
        >
          Apache License, Version 2.0
        </a>
      </p>
      <Separator className="my-5" />
      <h2>
        License Notice for <code>react-copy-to-clipboard</code>
      </h2>
      <p>
        This project uses the <code>react-copy-to-clipboard</code> library,
        which is licensed under the MIT License:
      </p>
      <pre
        style={{
          backgroundColor: "#eaeaea",
          padding: "15px",
          borderRadius: "5px",
          overflow: "auto",
        }}
      >
        {`The MIT License (MIT)

Copyright (c) 2016 Nik Butenko

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.`}
      </pre>
      <p>
        Source:{" "}
        <a
          href="https://github.com/nkbt/react-copy-to-clipboard?tab=readme-ov-file"
          target="_blank"
          rel="noopener noreferrer"
        >
          react-copy-to-clipboard
        </a>
      </p>
    </div>
  );
};

export default LicenseNotice;
