export default `/* 土豪金 */

/* 全局属性
 * 页边距 padding: 30px;
 * 全文字体 font-family: ptima-Regular;
 * 英文换行 word-break: break-all;
 */
#nice {
}

#nice p {
    font-family: Avenir, "PingFangSC-Light";
    font-size: 15px;
    color: #333;
    line-height: 1.8em;
    letter-spacing: 0.1em;
    margin: 1em 1em; /* 增加段落边距 */
    text-align: justify;
}


#nice table,
#nice pre,
#nice dl,
#nice blockquote,
#nice q,
#nice ul,
#nice ol {
  margin: 1.2em 0em;
}

#nice ul,
#nice ol {
  padding-left: 0em;
  margin: 1.2em 2em;
}

#nice li section  {
  margin: 0.2em 0;
  font-family: Avenir, "PingFangSC-Light";
  font-size: 15px;
  color: #333;
  line-height: 1.8em;
  letter-spacing: 0.1em;
  margin: 0.2em 0.2em;
}

#nice ul li section {
  margin: 0.2em 0;
  font-family: Avenir, "PingFangSC-Light";
  font-size: 15px;
  color: #333;
  line-height: 1.8em;
  letter-spacing: 0.1em;
  margin: 0.2em 0.2em;
}

/* Smaller spacing for sub-lists */
#nice ul ul,
#nice ul ol,
#nice ol ul,
#nice ol ol {
  margin: 0;
  padding-left: 1em;
}

/* Use Roman numerals for sub-ordered-lists. (Like Github.) */
#nice ol ol,
#nice ul ol {
  list-style-type: circle;
}

/* Use letters for sub-sub-ordered lists. (Like Github.) */
#nice ul ul ol,
#nice ul ol ol,
#nice ol ul ol,
#nice ol ol ol {
  list-style-type: square;
}

#nice dl {
  padding: 0;
}

#nice dl dt {
  font-size: 1em;
  font-weight: bold;
  font-style: italic;
}

#nice dl dd {
  margin: 0 0 1em;
  padding: 0 1em;
}

#nice blockquote,
#nice q {
  border-left: 4px solid #8e6a27;
  /* background-color: #fafafa;*/
  padding: 0em; /* 删除内边距 */
  margin: 0em 1em;
  color: #777;
  quotes: none;
}

#nice strong,
#nice b {
  color: #8e6a27;
}

/* 设置引用文本颜色 */
#nice blockquote p {
  color: rgb(119, 117, 117);
}

#nice blockquote::before,
#nice blockquote::after,
#nice q::before,
#nice q::after {
  content: none;
}

#nice h1,
#nice h2,
#nice h3,
#nice h4,
#nice h5,
#nice h6 {
  margin: 1.3em 0 1em;
  padding: 0;
  font-weight: bold;
  letter-spacing: 0.1em;
  color: #8e6a27;
}

#nice h1 {
  font-size: 1.6em;
  border-bottom: 1px solid #ddd;
  color: black;
}

#nice h2 {
  font-size: 1.4em;
  text-align: center;
  border-bottom: 1px solid #eee;
  color: #8e6a27;
}

#nice h3 {
  font-size: 1.3em;
}

#nice h4 {
  font-size: 1.2em;
}

#nice h5 {
  font-size: 1em;
}

#nice h6 {
  font-size: 1em;
  color: #777;
}

#nice table {
  border-collapse: collapse;
  border-spacing: 0;
  font-size: 0.8em;
  border: 0;
  font-family: Avenir, "PingFangSC-Light";
}

#nice tbody {
  margin: 0;
  padding: 0;
  border: 0;
}

#nice table tr {
  border: 0;
  border-top: 1px solid #ccc;
  background-color: white;
  margin: 0;
  padding: 0;
}

#nice table tr:nth-child(2n) {
  background-color: #f8f8f8;
}

#nice table tr th,
#nice table tr td {
  font-size: 0.8em;
  border: 1px solid #ccc;
  margin: 0;
  padding: 0.5em 1em;
}

#nice table tr th {
  font-weight: bold;
  background-color: #f0f0f0;
}
`